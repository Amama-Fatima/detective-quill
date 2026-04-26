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


class LLMRelationshipExtractor:

    def __init__(self):
        self.llm_loader = get_llm_loader()

    def extract_pairwise_relationship(
        self,
        entity_a: Entity,
        entity_b: Entity,
        scene_text: str
    ) -> List[Relationship]:

        entity_a_context = f"{entity_a.name} ({entity_a.type}"
        if entity_a.attributes.get('role'):
            entity_a_context += f", {entity_a.attributes['role']}"
        entity_a_context += ")"

        entity_b_context = f"{entity_b.name} ({entity_b.type}"
        if entity_b.attributes.get('role'):
            entity_b_context += f", {entity_b.attributes['role']}"
        entity_b_context += ")"

        logger.debug(f"Analyzing relationship: {entity_a.name} ↔ {entity_b.name}")

        prompt = f"""Scene:
\"\"\"{scene_text[:1200]}\"\"\"

A: {entity_a_context}
B: {entity_b_context}

Find the single most significant relationship between A and B.

Check these tiers in order and use the first that applies:

TIER 1 — Crime / violence (always extract if present):
  murder, kill, attack, stab, hit, strangle, shoot, threaten, confront, accuse, chase, fight, assault

TIER 2 — Interpersonal actions (extract if clearly shown in the scene):
  love, hate, marry, kiss, greet, wait_for, serve, help, trust, suspect, argue, comfort, betray, protect

TIER 3 — Social / situational (use if nothing stronger applies, but DO extract something):
  talk_to, drink_with, sit_with, live_with, work_for, know, meet, share_space_with, prepare_for

Rules:
- If A and B interact in any way, output a relationship — use Tier 3 at minimum
- Only output null if A and B have absolutely no connection in this scene
- "type" must be a short snake_case verb phrase
- "description" must be a brief phrase drawn from the scene text

Output ONLY one of:
{{"source":"<A or B name>","target":"<A or B name>","type":"<snake_case_verb>","description":"<brief scene evidence>"}}
null"""

        response = self.llm_loader.generate(prompt, max_tokens=150)
        logger.debug(f"LLM response for {entity_a.name} ↔ {entity_b.name}: {response[:150]}")

        try:
            response = re.sub(r'```json\s*', '', response)
            response = re.sub(r'```\s*', '', response)
            response = response.strip()

            if response.lower() == 'null' or response == '':
                logger.debug(f"  No relationship found between {entity_a.name} and {entity_b.name}")
                return []

            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                data = json.loads(response)

            source = data.get('source', '').strip()
            target = data.get('target', '').strip()

            known_names = {entity_a.name.lower(), entity_b.name.lower()}

            def _matches(name: str) -> str | None:
                """Return the canonical entity name if name loosely matches one of the two entities."""
                nl = name.lower()
                for canonical in [entity_a.name, entity_b.name]:
                    if nl == canonical.lower() or nl in canonical.lower() or canonical.lower() in nl:
                        return canonical
                return None

            source_canonical = _matches(source)
            target_canonical = _matches(target)

            if source_canonical and target_canonical and source_canonical != target_canonical:
                relationship = Relationship(
                    source=source_canonical,
                    target=target_canonical,
                    relation_type=data.get('type', 'unknown'),
                    description=data.get('description', data.get('evidence', '')),
                    confidence=0.9
                )
                logger.debug(f"  Found: {source_canonical} --[{data.get('type')}]--> {target_canonical}")
                return [relationship]

            return []

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
        nlp,                          # ← added
    ) -> List[Relationship]:

        all_relationships = []
        total_pairs = len(entities) * (len(entities) - 1) // 2
        processed = 0
        skipped_type = 0              # ← was just 'skipped', now split for clarity
        skipped_cooc = 0              # ← was missing entirely

        MEANINGFUL_TYPES = {'PERSON', 'ORG', 'GPE'}
        SAME_TYPE_SKIP = {'FAC', 'LOC', 'GPE', 'NORP'}
        SKIP_AS_ACTOR = {'NORP', 'FAC', 'LOC', 'DATE', 'TIME', 'MONEY', 'QUANTITY', 'CARDINAL', 'ORDINAL'}

        # Built once here, passed into _entities_co_occur for every pair
        sentence_sets = _build_sentence_token_sets(scene_text, nlp)  # ← was missing
        logger.debug(f"  Built {len(sentence_sets)} sentence token sets for co-occurrence filter")

        logger.info(f"Extracting relationships from {total_pairs} entity pairs")

        for i, entity_a in enumerate(entities):
            for entity_b in entities[i+1:]:
                processed += 1

                logger.info(f"  [{processed}/{total_pairs}] Analyzing: {entity_a.name} ↔ {entity_b.name}")

                if entity_a.type in SAME_TYPE_SKIP and entity_a.type == entity_b.type:
                    logger.debug(f"  ⊘ Skipping same-type non-person pair: {entity_a.type} ↔ {entity_b.type}")
                    skipped_type += 1
                    continue

                if entity_a.type not in MEANINGFUL_TYPES and entity_b.type not in MEANINGFUL_TYPES:
                    logger.debug(f"  ⊘ Skipping low-value pair: {entity_a.name} ({entity_a.type}) ↔ {entity_b.name} ({entity_b.type})")
                    skipped_type += 1
                    continue

                if entity_a.type in SKIP_AS_ACTOR and entity_b.type in SKIP_AS_ACTOR:
                    skipped_type += 1
                    continue

                if not _entities_co_occur(entity_a, entity_b, sentence_sets):  # ← sentence_sets now defined
                    logger.info(f"  ⊘ Skipping ({entity_a.name} ↔ {entity_b.name}): no sentence co-occurrence")
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
    nlp,                              # ← added
) -> List[Relationship]:

    logger.info("=" * 60)
    logger.info("LAYER 4: LLM Relationship Extraction")
    logger.info("=" * 60)

    extractor = LLMRelationshipExtractor()
    relationships = extractor.extract_relationships(entities, scene_text, nlp=nlp)  # ← forwarded

    logger.info(f"Layer 4 complete: {len(relationships)} relationships extracted")
    for rel in relationships:
        logger.debug(f"  - {rel.source} --[{rel.relation_type}]--> {rel.target}")

    return relationships