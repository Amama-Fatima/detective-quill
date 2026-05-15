import json
import re
from collections import Counter
from typing import Dict, List, Optional, Tuple

from src.models.schemas import Entity, Relationship
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


RELATION_ONTOLOGY: Dict[str, str] = {
    # crime
    "killed": "crime",
    "attacked": "crime",
    "threatened": "crime",
    "kidnapped": "crime",
    "poisoned": "crime",
    "stabbed": "crime",
    "shot": "crime",
    "stole": "crime",
    "blackmailed": "crime",
    "framed": "crime",
    # investigation
    "discovered": "investigation",
    "suspected": "investigation",
    "questioned": "investigation",
    "accused": "investigation",
    "followed": "investigation",
    "searched": "investigation",
    "found_evidence": "investigation",
    "identified": "investigation",
    "contradicted": "investigation",
    # evidence
    "owns": "evidence",
    "carries": "evidence",
    "found_at": "evidence",
    "used_as_weapon": "evidence",
    "contains_clue": "evidence",
    "hid": "evidence",
    "revealed": "evidence",
    # social / character context
    "related_to": "social",
    "married_to": "social",
    "works_for": "social",
    "knows": "social",
    "lied_to": "social",
    "betrayed": "social",
    # location / alibi
    "present_at": "location",
    "last_seen_at": "location",
    "moved_to": "location",
    "alibi_for": "plot",
    "motive_against": "plot",
    "witnessed": "plot",
    "concealed": "plot",
}

LOW_VALUE_RELATIONS = {
    "breathed",
    "sat",
    "sat_on",
    "stood",
    "walked",
    "walked_to",
    "looked",
    "looked_at",
    "turned",
    "smiled",
    "frowned",
    "nodded",
    "sighed",
    "said",
    "talked_to",
    "spoke_to",
    "entered",
    "left",
    "opened",
    "closed",
    "held",
    "touched",
}

RELATION_ALIASES = {
    "accuse": "accused",
    "attack": "attacked",
    "betray": "betrayed",
    "blackmail": "blackmailed",
    "carry": "carries",
    "conceal": "concealed",
    "contradict": "contradicted",
    "discover": "discovered",
    "find": "found_evidence",
    "found": "found_evidence",
    "frame": "framed",
    "hide": "hid",
    "identify": "identified",
    "kidnap": "kidnapped",
    "kill": "killed",
    "murder": "killed",
    "murdered": "killed",
    "poison": "poisoned",
    "question": "questioned",
    "reveal": "revealed",
    "search": "searched",
    "shoot": "shot",
    "stab": "stabbed",
    "steal": "stole",
    "suspect": "suspected",
    "threaten": "threatened",
    "use_as_weapon": "used_as_weapon",
    "used_weapon": "used_as_weapon",
    "witness": "witnessed",
}

GENERIC_ENTITY_NAMES = {
    "air",
    "breath",
    "chair",
    "door",
    "floor",
    "hand",
    "head",
    "room",
    "table",
    "window",
}

ROLE_VALUES = {
    "detective",
    "suspect",
    "victim",
    "witness",
    "item",
    "location",
    "character",
    "policeman",
    "evidence",
    "other",
}


def _format_entity_list(entities: List[Entity]) -> str:
    return "\n".join(f"- {e.name} (type: {e.type})" for e in entities)


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower()).strip()


def _normalize_relation(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9_ ]", "", value or "")
    normalized = "_".join(value.lower().split())
    return RELATION_ALIASES.get(normalized, normalized)


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

    for sentence in sentences:
        normalized_sentence = _normalize_text(sentence)
        if normalized_evidence == normalized_sentence:
            return sentence
        if normalized_evidence in normalized_sentence:
            return sentence

    return None


def _is_generic_entity(name: str) -> bool:
    return _normalize_text(name) in GENERIC_ENTITY_NAMES


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
        logger.info("CASE_FACT_DEDUP removed_duplicates=%s", duplicates)
    return result


class CaseFactValidator:
    def __init__(self, entities: List[Entity], scene_text: str):
        self.entities = entities
        self.sentences = _split_sentences(scene_text)
        self.rejection_counts: Counter[str] = Counter()
        self.rejection_examples: Dict[str, str] = {}

    def _reject(self, reason: str, item: dict, detail: str) -> None:
        self.rejection_counts[reason] += 1
        self.rejection_examples.setdefault(reason, detail)
        logger.info(
            "CASE_FACT_REJECT reason=%s detail=%s raw=%s",
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

        relation_type = _normalize_relation(str(item.get("relation_type", "")))
        if relation_type in LOW_VALUE_RELATIONS:
            self._reject("low_value_relation", item, f"relation={relation_type}")
            return None

        if relation_type not in RELATION_ONTOLOGY:
            self._reject("outside_ontology", item, f"relation={relation_type}")
            return None

        if _is_generic_entity(source) or _is_generic_entity(target):
            self._reject("generic_endpoint", item, f"source={source} target={target}")
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
        if confidence < 0.55:
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
            category=RELATION_ONTOLOGY[relation_type],
            evidence=evidence,
            confidence=confidence,
        )

    def log_summary(self, accepted_count: int) -> None:
        logger.info(
            "CASE_FACT_VALIDATION_SUMMARY accepted=%s rejected=%s reasons=%s",
            accepted_count,
            sum(self.rejection_counts.values()),
            dict(self.rejection_counts),
        )
        for reason, example in self.rejection_examples.items():
            logger.info("CASE_FACT_REJECT_EXAMPLE reason=%s detail=%s", reason, example)


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
        allowed_relations = ", ".join(sorted(RELATION_ONTOLOGY))
        sentences = _split_sentences(scene_text)
        logger.info(
            "CASE_FACT_INPUT scene_chars=%s sentences=%s candidate_entities=%s",
            len(scene_text),
            len(sentences),
            len(entities),
        )
        logger.info(
            "CASE_FACT_ENTITY_CANDIDATES %s",
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
{scene_text[:2200]}
</scene>

Entities:
{entity_list_str}

Extract only case-relevant detective-story facts.

A case-relevant fact helps answer at least one of these:
- Who committed, suffered, witnessed, discovered, hid, used, or suspected something important?
- What evidence, weapon, clue, alibi, motive, contradiction, relationship, or meaningful location is revealed?
- Where was an important person or object during a crime or investigation?

Ignore background motion and atmosphere: breathing, sitting, standing, looking, walking, turning, smiling, ordinary talking, opening doors, holding objects, or decorative actions unless they reveal evidence, motive, alibi, identity, deception, or crime.

Allowed relation_type values only:
{allowed_relations}

Respond with ONLY valid JSON. No markdown, no explanation.

{{
  "entities": [
    {{
      "name": "<exact entity name from the provided entity list>",
      "role": "<detective|suspect|victim|witness|item|location|character|policeman|evidence|other>",
      "description": "<one short sentence based only on the scene>"
    }}
  ],
  "relationships": [
    {{
      "source": "<exact entity name from the provided entity list>",
      "target": "<exact entity name from the provided entity list>",
      "relation_type": "<one allowed relation_type>",
      "when": "<explicit time string or null>",
      "evidence": "<exact sentence copied from the scene that proves this fact>",
      "confidence": 0.0
    }}
  ]
}}

Rules:
- Return at most 5 relationships.
- Every relationship must have an exact evidence sentence copied from the scene.
- Do not invent entities that are not in the provided entity list.
- If there are no case-relevant facts, return an empty relationships array.
- Prefer precision over recall. It is better to miss a weak fact than pollute the graph.
"""

        logger.info("Batch LLM case-fact call: %s entities", len(entities))
        response = self.llm_loader.generate(prompt, max_tokens=900)
        logger.info(
            "CASE_FACT_LLM_RAW_RESPONSE chars=%s preview=%s",
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
            "CASE_FACT_LLM_PARSED proposed_entities=%s proposed_relationships=%s",
            len(raw_entities) if isinstance(raw_entities, list) else "invalid",
            len(raw_relationships) if isinstance(raw_relationships, list) else "invalid",
        )

        for item in raw_entities if isinstance(raw_entities, list) else []:
            if not isinstance(item, dict):
                logger.info("CASE_FACT_ENTITY_REJECT reason=invalid_shape raw=%s", _shorten(item))
                continue

            canonical = _match_name(str(item.get("name", "")), original_entities)
            if not canonical:
                logger.info(
                    "CASE_FACT_ENTITY_REJECT reason=unmatched_name name=%s raw=%s",
                    item.get("name"),
                    _shorten(item),
                )
                continue

            role = _normalize_relation(str(item.get("role", "other")))
            if role not in ROLE_VALUES:
                role = "other"

            description = str(item.get("description", "")).strip() or None
            entity_map[canonical].role = role
            entity_map[canonical].description = description
            logger.info(
                "CASE_FACT_ENTITY_ACCEPT name=%s role=%s description=%s",
                canonical,
                role,
                _shorten(description, 140),
            )

        validator = CaseFactValidator(original_entities, scene_text)
        relationships: List[Relationship] = []

        for item in raw_relationships if isinstance(raw_relationships, list) else []:
            if not isinstance(item, dict):
                logger.info("CASE_FACT_REJECT reason=invalid_shape raw=%s", _shorten(item))
                continue

            relationship = validator.validate(item)
            if relationship:
                relationships.append(relationship)
                logger.info(
                    "CASE_FACT_ACCEPT source=%s relation=%s target=%s category=%s confidence=%.2f evidence=%s",
                    relationship.source,
                    relationship.relation_type,
                    relationship.target,
                    relationship.category,
                    relationship.confidence or 0,
                    _shorten(relationship.evidence, 220),
                )

        relationships = _deduplicate_relationships(relationships)
        if len(relationships) > 5:
            logger.info(
                "CASE_FACT_LIMIT kept=5 dropped=%s reason=max_relationships",
                len(relationships) - 5,
            )
        relationships = relationships[:5]
        validator.log_summary(len(relationships))
        enriched = list(entity_map.values())
        logger.info(
            "Parsed case facts: %s entities, %s accepted relationships",
            len(enriched),
            len(relationships),
        )
        return enriched, relationships


def enrich_and_extract_batch(
    entities: List[Entity],
    scene_text: str,
) -> Tuple[List[Entity], List[Relationship]]:
    logger.info("=" * 60)
    logger.info("LAYER 3+4: Case Fact Enrichment + Validated Relationship Extraction")
    logger.info("=" * 60)

    processor = BatchLLMProcessor()
    enriched_entities, relationships = processor.process_batch(entities, scene_text)

    logger.info(
        "Layer 3+4 complete: %s entities, %s relationships",
        len(enriched_entities),
        len(relationships),
    )
    for entity in enriched_entities:
        logger.debug("  %s (%s) - role: %s", entity.name, entity.type, entity.role)
    for relationship in relationships:
        logger.debug(
            "  %s --[%s]--> %s",
            relationship.source,
            relationship.relation_type,
            relationship.target,
        )

    return enriched_entities, relationships
