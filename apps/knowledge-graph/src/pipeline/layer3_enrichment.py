import re
import json
from typing import List, Tuple, Optional

from src.models.schemas import Entity, Relationship
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def _format_entity_list(entities: List[Entity]) -> str:
    return "\n".join(f"- {e.name} (type: {e.type})" for e in entities)


def _match_name(name: str, entities: List[Entity]) -> Optional[str]:
    nl = name.lower().strip()
    for e in entities:
        cn = e.name.lower()
        if nl == cn or nl in cn or cn in nl:
            return e.name
    return None


def _deduplicate_relationships(rels: List[Relationship]) -> List[Relationship]:
    seen: set = set()
    result = []
    for r in rels:
        key = frozenset([r.source.lower(), r.target.lower()]) | {r.relation_type.lower()}
        if key not in seen:
            seen.add(key)
            result.append(r)
    return result


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

        prompt = f"""<scene>
{scene_text[:1500]}
</scene>

Entities: {entity_list_str}

Respond with ONLY valid JSON. No explanation, no markdown.

{{
  "entities": [
    {{"name": "<exact name>", "role": "<detective|suspect|victim|witness|item|location|character|policeman>,"description": "<freeform text not more than one sentence>"}}
  ],
  "relationships": [
    {{"source": "<name>", "target": "<name>", "relation_type": "<snake_case_verb>", "when": "<time or null>"}}
  ]
}}

Rules:
- Extract 1–3 relationships only between entities that clearly interact. Do NOT extract more than 3 relationships, even if more interactions exist.
- Priority: crime/violence (stab, murder, fight, hit) > interpersonal (comfort, betray, threaten, help, marry) > situational (talk_to, sit_with)
- If no interaction exists between entities, omit the relationship entirely
- "when": exact time string only if explicitly stated for a crime-related interaction, else null
- "description": a single sentence that describes that entity
"""


        logger.info(f"Batch LLM call: {len(entities)} entities")
        response = self.llm_loader.generate(prompt, max_tokens=512)
        logger.debug(f"Batch LLM response (first 600 chars):\n{response[:600]}")

        return self._parse(response, entities)

    def _parse(
        self,
        response: str,
        original_entities: List[Entity],
    ) -> Tuple[List[Entity], List[Relationship]]:

        response = re.sub(r'```json\s*', '', response)
        response = re.sub(r'```\s*', '', response)

        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if not json_match:
            logger.warning("Batch LLM returned no JSON — entities unenriched, no relationships")
            return original_entities, []

        try:
            data = json.loads(json_match.group())
        except json.JSONDecodeError as e:
            logger.warning(f"Batch JSON parse error ({e}) — entities unenriched, no relationships")
            return original_entities, []

        # ── Enrich entities ──────────────────────────────────────────────────
        entity_map = {e.name: e for e in original_entities}

        for item in data.get('entities', []):
            name = item.get('name', '')
            canonical = _match_name(name, original_entities)
            if not canonical:
                logger.debug(f"  Could not match entity name from LLM: '{name}'")
                continue

            role = item.get('role', 'other')
            description = item.get('description', '').strip() or None
            entity_map[canonical].role = role
            entity_map[canonical].description = description

            logger.debug(f"  Enriched '{canonical}' — role: {role}")

        enriched = list(entity_map.values())



        relationships: List[Relationship] = []

        for item in data.get('relationships', []):
            source = _match_name(item.get('source', ''), original_entities)
            target = _match_name(item.get('target', ''), original_entities)

            if not source or not target or source == target:
                logger.debug(
                    f"  Skipped — unresolvable pair: "
                    f"'{item.get('source')}' → '{item.get('target')}'"
                )
                continue

            rel_type = (item.get('relation_type') or 'related_to').strip() or 'related_to'
            when = item.get('when')
            if when and isinstance(when, str):
                when = when.strip() or None

            relationships.append(Relationship(
                source=source,
                target=target,
                relation_type=rel_type,
                when=when,
            ))
            time_str = f" @ {when}" if when else ""
            logger.debug(f"  Relationship: {source} --[{rel_type}]--> {target}{time_str}")

        relationships = _deduplicate_relationships(relationships)
        logger.info(f"Parsed: {len(enriched)} entities, {len(relationships)} relationships")
        return enriched, relationships


def enrich_and_extract_batch(
    entities: List[Entity],
    scene_text: str,
) -> Tuple[List[Entity], List[Relationship]]:

    logger.info("=" * 60)
    logger.info("LAYER 3+4: Batch LLM Enrichment + Relationship Extraction")
    logger.info("=" * 60)

    processor = BatchLLMProcessor()
    enriched_entities, relationships = processor.process_batch(entities, scene_text)

    logger.info(f"Layer 3+4 complete: {len(enriched_entities)} entities, {len(relationships)} relationships")
    for e in enriched_entities:
        logger.debug(f"  {e.name} ({e.type}) — role: {e.role}")
    for r in relationships:
        logger.debug(f"  {r.source} --[{r.relation_type}]--> {r.target}")

    return enriched_entities, relationships
