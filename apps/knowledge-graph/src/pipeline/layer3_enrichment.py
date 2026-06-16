import json
import re
from collections import Counter
from difflib import SequenceMatcher
from typing import Dict, List, Optional, Tuple

from src.models.schemas import Entity, Relationship
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def _format_entity_list(entities: List[Entity]) -> str:
    return "\n".join(f"- {e.name} (type: {e.type})" for e in entities)


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower()).strip()


def _normalize_relation(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_ -]", "", value or "")
    value = re.sub(r"\s+", " ", value).strip().lower()
    return "_".join(value.replace("-", " ").split())


def _split_sentences(scene_text: str) -> List[str]:
    sentences = re.split(r"(?<=[.!?])\s+", scene_text.strip())
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def _match_name(name: str, entities: List[Entity]) -> Optional[str]:
    normalized = _normalize_text(name)
    if not normalized:
        return None

    exact = {
        _normalize_text(entity.name): entity.name
        for entity in entities
        if entity.name.strip()
    }
    if normalized in exact:
        return exact[normalized]

    for entity in entities:
        entity_name = _normalize_text(entity.name)
        if not entity_name:
            continue
        if normalized in entity_name or entity_name in normalized:
            return entity.name

        for mention in entity.mentions:
            mention_name = _normalize_text(mention)
            if normalized == mention_name:
                return entity.name

    return None


def _evidence_in_scene(evidence: str, sentences: List[str]) -> Optional[str]:
    normalized_evidence = _normalize_text(evidence)
    if not normalized_evidence:
        return None

    best_sentence = None
    best_score = 0.0
    for sentence in sentences:
        normalized_sentence = _normalize_text(sentence)
        if normalized_evidence == normalized_sentence:
            return sentence
        if normalized_evidence in normalized_sentence:
            return sentence
        if normalized_sentence in normalized_evidence:
            return sentence

        score = SequenceMatcher(None, normalized_evidence, normalized_sentence).ratio()
        if score > best_score:
            best_score = score
            best_sentence = sentence

    if best_sentence and best_score >= 0.78:
        logger.info(
            "NARRATIVE_FACT_EVIDENCE_FUZZY_MATCH score=%.2f evidence=%s matched=%s",
            best_score,
            _shorten(evidence, 160),
            _shorten(best_sentence, 160),
        )
        return best_sentence

    return None


def _clamp_confidence(value: object) -> float:
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        return 0.65

    return max(0.0, min(confidence, 1.0))


def _shorten(value: object, limit: int = 180) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3] + "..."


def _deduplicate_relationships(rels: List[Relationship]) -> List[Relationship]:
    seen: set = set()
    result = []
    duplicates = 0
    for rel in rels:
        key = (
            rel.source.lower(),
            rel.target.lower(),
            rel.relation_type.lower(),
            (rel.evidence or "").lower(),
        )
        if key in seen:
            duplicates += 1
            continue
        seen.add(key)
        result.append(rel)
    if duplicates:
        logger.info("NARRATIVE_FACT_DEDUP removed_duplicates=%s", duplicates)
    return result


class NarrativeFactValidator:
    def __init__(self, entities: List[Entity], scene_text: str):
        self.entities = entities
        self.sentences = _split_sentences(scene_text)
        self.rejection_counts: Counter[str] = Counter()
        self.rejection_examples: Dict[str, str] = {}

    def _reject(self, reason: str, item: dict, detail: str) -> None:
        self.rejection_counts[reason] += 1
        self.rejection_examples.setdefault(reason, detail)
        logger.info(
            "NARRATIVE_FACT_REJECT reason=%s detail=%s raw=%s",
            reason,
            detail,
            _shorten(item),
        )

    def validate(self, item: dict) -> Optional[Relationship]:
        source = _match_name(str(item.get("source", "")), self.entities)
        target = _match_name(str(item.get("target", "")), self.entities)
        if not source or not target or source == target:
            self._reject(
                "unresolved_endpoints",
                item,
                f"source={item.get('source')} target={item.get('target')}",
            )
            return None

        raw_relation = (
            item.get("relation_type")
            or item.get("relation")
            or item.get("relation_label")
            or ""
        )
        relation_type = _normalize_relation(str(raw_relation))
        relation_words = relation_type.split("_")
        if not relation_type:
            self._reject("missing_relation", item, "empty relation label")
            return None
        if len(relation_words) > 5 or len(relation_type) > 64:
            self._reject("relation_too_long", item, f"relation={relation_type}")
            return None

        evidence = _evidence_in_scene(str(item.get("evidence", "")), self.sentences)
        if not evidence:
            self._reject(
                "missing_exact_evidence",
                item,
                f"evidence={_shorten(item.get('evidence'))}",
            )
            return None

        confidence = _clamp_confidence(item.get("confidence"))
        if confidence < 0.5:
            self._reject("low_confidence", item, f"confidence={confidence}")
            return None

        when = item.get("when")
        if when and isinstance(when, str):
            when = when.strip() or None
        else:
            when = None

        return Relationship(
            source=source,
            target=target,
            relation_type=relation_type,
            when=when,
            category=None,
            evidence=evidence,
            confidence=confidence,
        )

    def log_summary(self, accepted_count: int) -> None:
        logger.info(
            "NARRATIVE_FACT_VALIDATION_SUMMARY accepted=%s rejected=%s reasons=%s",
            accepted_count,
            sum(self.rejection_counts.values()),
            dict(self.rejection_counts),
        )
        for reason, example in self.rejection_examples.items():
            logger.info("NARRATIVE_FACT_REJECT_EXAMPLE reason=%s detail=%s", reason, example)


class BatchLLMProcessor:
    def __init__(self):
        from src.models.llm_loader import get_llm_loader

        self.llm_loader = get_llm_loader()

    def process_batch(
        self,
        entities: List[Entity],
        scene_text: str,
    ) -> Tuple[List[Entity], List[Relationship]]:
        entity_list_str = _format_entity_list(entities)
        logger.info(
            "NARRATIVE_FACT_INPUT scene_chars=%s sentences=%s candidate_entities=%s",
            len(scene_text),
            len(_split_sentences(scene_text)),
            len(entities),
        )
        logger.info(
            "NARRATIVE_FACT_ENTITY_CANDIDATES %s",
            [
                {
                    "name": entity.name,
                    "type": entity.type,
                    "mentions": len(entity.mentions),
                }
                for entity in entities
            ],
        )

        prompt = f"""<scene>
{scene_text[:2600]}
</scene>

Candidate entities:
{entity_list_str}

Extract a compact knowledge graph from the scene.

Use only the exact candidate entities above. Do not invent entities, objects, or places that are missing from the candidate list.
Extract relationships that are stated or strongly implied by the scene.
Prefer story-relevant facts: actions with consequences, discoveries, suspicions, deception, possession, evidence, locations, emotional/social ties, motives, conflicts, and important state changes.
Skip mundane movement, posture, looking, ordinary speech, and background atmosphere unless it changes what the reader knows about the plot or a character.

For relation labels, write a short natural verb phrase such as "killed", "lied_to", "found", "hid_from", "was_married_to", "owned", or "was_seen_at".
Do not force labels into a predefined ontology. Use the wording that best fits the scene.

For evidence, copy the shortest exact sentence or clause from the scene that supports the relationship.

Respond with ONLY valid JSON. No markdown, no explanation.

{{
  "entities": [
    {{
      "name": "<exact candidate entity name>",
      "description": "<one short scene-grounded description, or null>"
    }}
  ],
  "relationships": [
    {{
      "source": "<exact candidate entity name>",
      "target": "<exact candidate entity name>",
      "relation_type": "<short natural relation label>",
      "when": "<explicit time phrase, or null>",
      "evidence": "<exact supporting sentence or clause copied from the scene>",
      "confidence": 0.85
    }}
  ]
}}

Rules:
- Every relationship must connect two different candidate entities.
- The source and target must be copied exactly from the candidate entity list.
- Every relationship must include exact evidence copied from the scene.
- Use confidence between 0.5 and 1.0 for relationships you include.
- Return every clearly supported story-relevant relationship, but avoid duplicates and weak guesses.
- If no useful relationships are supported, return an empty relationships array.
- Prefer precision over volume.
"""

        logger.info("Batch LLM narrative-fact call: %s entities", len(entities))
        response = self.llm_loader.generate(prompt, max_tokens=1200)
        logger.info(
            "NARRATIVE_FACT_LLM_RAW_RESPONSE chars=%s preview=%s",
            len(response),
            _shorten(response, 900),
        )

        return self._parse(response, entities, scene_text)

    def _parse(
        self,
        response: str,
        original_entities: List[Entity],
        scene_text: str,
    ) -> Tuple[List[Entity], List[Relationship]]:
        response = re.sub(r"```json\s*", "", response)
        response = re.sub(r"```\s*", "", response)

        json_match = re.search(r"\{.*\}", response, re.DOTALL)
        if not json_match:
            logger.warning("Batch LLM returned no JSON; entities unenriched, no relationships")
            return original_entities, []

        try:
            data = json.loads(json_match.group())
        except json.JSONDecodeError as exc:
            logger.warning("Batch JSON parse error (%s); entities unenriched, no relationships", exc)
            return original_entities, []

        entity_map = {entity.name: entity for entity in original_entities}
        raw_entities = data.get("entities", [])
        raw_relationships = data.get("relationships", [])
        logger.info(
            "NARRATIVE_FACT_LLM_PARSED proposed_entities=%s proposed_relationships=%s",
            len(raw_entities) if isinstance(raw_entities, list) else "invalid",
            len(raw_relationships) if isinstance(raw_relationships, list) else "invalid",
        )

        for item in raw_entities if isinstance(raw_entities, list) else []:
            if not isinstance(item, dict):
                logger.info("NARRATIVE_FACT_ENTITY_REJECT reason=invalid_shape raw=%s", _shorten(item))
                continue

            canonical = _match_name(str(item.get("name", "")), original_entities)
            if not canonical:
                logger.info(
                    "NARRATIVE_FACT_ENTITY_REJECT reason=unmatched_name name=%s raw=%s",
                    item.get("name"),
                    _shorten(item),
                )
                continue

            description = item.get("description")
            if description is not None:
                description = str(description).strip() or None
            entity_map[canonical].description = description
            entity_map[canonical].role = None
            logger.info(
                "NARRATIVE_FACT_ENTITY_ACCEPT name=%s description=%s",
                canonical,
                _shorten(description, 140),
            )

        validator = NarrativeFactValidator(original_entities, scene_text)
        relationships: List[Relationship] = []

        for item in raw_relationships if isinstance(raw_relationships, list) else []:
            if not isinstance(item, dict):
                logger.info("NARRATIVE_FACT_REJECT reason=invalid_shape raw=%s", _shorten(item))
                continue

            relationship = validator.validate(item)
            if relationship:
                relationships.append(relationship)
                logger.info(
                    "NARRATIVE_FACT_ACCEPT source=%s relation=%s target=%s category=%s confidence=%.2f evidence=%s",
                    relationship.source,
                    relationship.relation_type,
                    relationship.target,
                    relationship.category,
                    relationship.confidence or 0,
                    _shorten(relationship.evidence, 220),
                )

        relationships = _deduplicate_relationships(relationships)
        validator.log_summary(len(relationships))
        enriched = list(entity_map.values())
        logger.info(
            "Parsed narrative facts: %s entities, %s accepted relationships",
            len(enriched),
            len(relationships),
        )
        return enriched, relationships


def enrich_and_extract_batch(
    entities: List[Entity],
    scene_text: str,
) -> Tuple[List[Entity], List[Relationship]]:
    logger.info("=" * 60)
    logger.info("LAYER 3+4: Narrative Fact Enrichment + Grounded Relationship Extraction")
    logger.info("=" * 60)

    processor = BatchLLMProcessor()
    enriched_entities, relationships = processor.process_batch(entities, scene_text)

    logger.info(
        "Layer 3+4 complete: %s entities, %s relationships",
        len(enriched_entities),
        len(relationships),
    )
    for entity in enriched_entities:
        logger.debug("  %s (%s) - description: %s", entity.name, entity.type, entity.description)
    for relationship in relationships:
        logger.debug(
            "  %s --[%s]--> %s",
            relationship.source,
            relationship.relation_type,
            relationship.target,
        )

    return enriched_entities, relationships
