import re
import json
from typing import List

from src.models.schemas import Entity, Relationship
from src.models.llm_loader import get_llm_loader
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def _build_sentence_token_sets(text: str, nlp) -> list[set[str]]:
    doc = nlp(text)
    return [
        {token.lower_ for token in sent if not token.is_space}
        for sent in doc.sents
    ]


def _entities_co_occur(
    entity_a: Entity,
    entity_b: Entity,
    sentence_sets: list[set[str]],
) -> bool:
    tokens_a = {t.lower() for t in entity_a.name.split()}
    tokens_b = {t.lower() for t in entity_b.name.split()}

    for sent_tokens in sentence_sets:
        if tokens_a & sent_tokens and tokens_b & sent_tokens:
            return True
    return False


def _evidence_mentions_both(evidence: str, entity_a: Entity, entity_b: Entity) -> bool:
    """
    Return True only if the evidence string contains at least one token from
    each entity's name.  This prevents the LLM from citing a sentence that
    mentions only one of the two entities and fabricating the other side of
    the relationship.
    """
    evidence_lower = evidence.lower()
    name_a_tokens = {t.lower() for t in entity_a.name.split()}
    name_b_tokens = {t.lower() for t in entity_b.name.split()}

    a_present = any(token in evidence_lower for token in name_a_tokens)
    b_present = any(token in evidence_lower for token in name_b_tokens)

    return a_present and b_present


class LLMRelationshipExtractor:

    def __init__(self):
        self.llm_loader = get_llm_loader()

    def extract_pairwise_relationship(
        self,
        entity_a: Entity,
        entity_b: Entity,
        scene_text: str,
    ) -> List[Relationship]:

        entity_a_context = f"{entity_a.name} ({entity_a.type}"
        if entity_a.attributes.get('role'):
            entity_a_context += f", {entity_a.attributes['role']}"
        entity_a_context += ")"

        entity_b_context = f"{entity_b.name} ({entity_b.type}"
        if entity_b.attributes.get('role'):
            entity_b_context += f", {entity_b.attributes['role']}"
        entity_b_context += ")"

        prompt = f"""Scene: "{scene_text}"

A: {entity_a_context}
B: {entity_b_context}

Task: Find ONE direct, explicit relationship between A and B stated in the scene.

Rules:
- The relationship MUST be directly stated, not inferred or implied.
- "source" must be the entity that performs the action.
- "target" must be the entity that receives the action.
- "type" must be a short active verb or verb phrase (e.g. "works_at", "found", "ignored").
- "evidence" must be a verbatim sentence or clause from the scene that proves the relationship.
- The evidence MUST explicitly mention both "{entity_a.name}" and "{entity_b.name}" by name.
- source and target must be exactly "{entity_a.name}" or "{entity_b.name}".
- If no direct relationship exists, output null.

Output ONLY:
{{"source":"<n>","target":"<n>","type":"<verb>","evidence":"<verbatim quote>"}}
null"""

        response = self.llm_loader.generate(prompt, max_tokens=120)
        logger.debug(f"LLM response for {entity_a.name} ↔ {entity_b.name}: {response[:200]}")

        try:
            response = re.sub(r'```json\s*', '', response)
            response = re.sub(r'```\s*', '', response)
            response = response.strip()

            if not response or response.lower().startswith('null'):
                logger.debug(f"  No relationship found between {entity_a.name} and {entity_b.name}")
                return []

            json_match = re.search(r'\{.*?\}', response, re.DOTALL)
            if not json_match:
                logger.debug(f"  No JSON found in response for {entity_a.name} ↔ {entity_b.name}")
                return []

            data = json.loads(json_match.group())

            source   = data.get('source', '').strip()
            target   = data.get('target', '').strip()
            rel_type = data.get('type', '').strip()
            evidence = data.get('evidence', '').strip()

            # All four fields must be present and non-empty
            if not all([source, target, rel_type, evidence]):
                logger.debug(f"  Incomplete relationship fields for {entity_a.name} ↔ {entity_b.name}")
                return []

            # source and target must exactly match the two entity names
            valid_names = {entity_a.name.lower(), entity_b.name.lower()}
            if source.lower() not in valid_names or target.lower() not in valid_names:
                logger.debug(
                    f"  Invalid source/target names: {source!r}, {target!r} "
                    f"(expected {entity_a.name!r} or {entity_b.name!r})"
                )
                return []

            # source and target must be different
            if source.lower() == target.lower():
                logger.debug(f"  Self-referential relationship skipped for {entity_a.name}")
                return []

            # Evidence must be grounded in the scene —
            # at least 3 consecutive words from the evidence must appear verbatim
            evidence_words = evidence.lower().split()
            scene_lower = scene_text.lower()
            evidence_grounded = any(
                ' '.join(evidence_words[i:i + 3]) in scene_lower
                for i in range(max(1, len(evidence_words) - 2))
            )
            if not evidence_grounded:
                logger.debug(
                    f"  Evidence not grounded in scene text for "
                    f"{entity_a.name} ↔ {entity_b.name}: {evidence!r}"
                )
                return []

            # Evidence must mention BOTH entity names — prevents the LLM from
            # citing a sentence about only one entity and fabricating the link
            if not _evidence_mentions_both(evidence, entity_a, entity_b):
                logger.debug(
                    f"  Evidence does not mention both entities — skipping: {evidence!r}"
                )
                return []

            relationship = Relationship(
                source=source,
                target=target,
                relation_type=rel_type,
                description=evidence,
                confidence=0.9,
            )
            logger.debug(f"  Found: {source} --[{rel_type}]--> {target}")
            return [relationship]

        except json.JSONDecodeError as e:
            logger.debug(f"  JSON parsing error for {entity_a.name} ↔ {entity_b.name}: {e}")
            return []
        except Exception as e:
            logger.debug(f"  Error extracting relationship: {e}")
            return []

    def extract_relationships(
        self,
        entities: List[Entity],
        scene_text: str,
        nlp,
    ) -> List[Relationship]:

        all_relationships = []
        total_pairs = len(entities) * (len(entities) - 1) // 2
        processed = 0
        skipped_type = 0
        skipped_cooc = 0

        MEANINGFUL_TYPES = {'PERSON', 'ORG', 'GPE'}
        SAME_TYPE_SKIP   = {'FAC', 'LOC', 'GPE', 'NORP'}
        SKIP_AS_ACTOR    = {'NORP', 'FAC', 'LOC', 'DATE', 'TIME', 'MONEY', 'QUANTITY', 'CARDINAL', 'ORDINAL'}

        sentence_sets = _build_sentence_token_sets(scene_text, nlp)
        logger.debug(f"  Built {len(sentence_sets)} sentence token sets for co-occurrence filter")

        logger.info(f"Extracting relationships from {total_pairs} entity pairs")

        for i, entity_a in enumerate(entities):
            for entity_b in entities[i + 1:]:
                processed += 1

                logger.info(f"  [{processed}/{total_pairs}] Analyzing: {entity_a.name} ↔ {entity_b.name}")

                if entity_a.type in SAME_TYPE_SKIP and entity_a.type == entity_b.type:
                    logger.debug(f"  Skipping same-type non-person pair: {entity_a.type} ↔ {entity_b.type}")
                    skipped_type += 1
                    continue

                if entity_a.type not in MEANINGFUL_TYPES and entity_b.type not in MEANINGFUL_TYPES:
                    logger.debug(f"  Skipping low-value pair: {entity_a.name} ({entity_a.type}) ↔ {entity_b.name} ({entity_b.type})")
                    skipped_type += 1
                    continue

                if entity_a.type in SKIP_AS_ACTOR and entity_b.type in SKIP_AS_ACTOR:
                    skipped_type += 1
                    continue

                if not _entities_co_occur(entity_a, entity_b, sentence_sets):
                    logger.info(f"  Skipping ({entity_a.name} ↔ {entity_b.name}): no sentence co-occurrence")
                    skipped_cooc += 1
                    continue

                pair_relationships = self.extract_pairwise_relationship(
                    entity_a, entity_b, scene_text
                )
                all_relationships.extend(pair_relationships)

        llm_calls = processed - skipped_type - skipped_cooc
        logger.info(
            f"Skipped {skipped_type} pairs (type filter), "
            f"{skipped_cooc} pairs (co-occurrence filter), "
            f"ran LLM on {llm_calls}/{total_pairs} pairs"
        )
        logger.info(f"Found {len(all_relationships)} total relationships")

        return all_relationships


def extract_relationships_layer4(
    entities: List[Entity],
    scene_text: str,
    nlp,
) -> List[Relationship]:

    logger.info("=" * 60)
    logger.info("LAYER 4: LLM Relationship Extraction")
    logger.info("=" * 60)

    extractor = LLMRelationshipExtractor()
    relationships = extractor.extract_relationships(entities, scene_text, nlp=nlp)

    logger.info(f"Layer 4 complete: {len(relationships)} relationships extracted")
    for rel in relationships:
        logger.debug(f"  - {rel.source} --[{rel.relation_type}]--> {rel.target}")

    return relationships