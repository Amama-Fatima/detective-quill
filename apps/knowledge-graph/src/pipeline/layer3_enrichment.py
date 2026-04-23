import re
import json
from typing import List, Tuple

from src.models.schemas import Entity, Relationship
from src.models.llm_loader import get_llm_loader
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

VALID_ROLES = {'detective', 'suspect', 'victim', 'witness', 'object', 'location', 'other'}


def _format_entity_list(entities: List[Entity]) -> str:
    return "\n".join(f"- {e.name} (type: {e.type})" for e in entities)


def _match_name(name: str, entities: List[Entity]) -> str | None:
    """Fuzzy-match an LLM-returned name back to a canonical entity name."""
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
        self.llm_loader = get_llm_loader()

    def process_batch(
        self,
        entities: List[Entity],
        scene_text: str,
    ) -> Tuple[List[Entity], List[Relationship]]:

        entity_list_str = _format_entity_list(entities)

        prompt = f"""Scene:
\"\"\"{scene_text[:1500]}\"\"\"

Detected entities:
{entity_list_str}

Output ONLY this JSON (no other text):
{{
  "entities": [
    {{"name": "<exact name from list above>", "role": "<detective|suspect|victim|witness|object|location|other>", "description": "<what the scene says about them>", "attributes": {{}}}}
  ],
  "relationships": [
    {{"source": "<entity name>", "target": "<entity name>", "type": "<snake_case_verb>", "description": "<brief evidence from scene>"}}
  ]
}}

Relationship priority — check in order, use the first tier that applies:
TIER 1 (crime/violence — always extract if present): murder, kill, attack, stab, hit, strangle, shoot, threaten, confront, accuse, assault, fight
TIER 2 (interpersonal — extract if clearly shown): love, hate, marry, kiss, greet, wait_for, serve, help, trust, suspect, argue, comfort, betray
TIER 3 (situational — use as fallback, but ALWAYS extract something if characters interact): talk_to, drink_with, sit_with, live_with, know, prepare_for, share_space_with

Rule: if two characters interact in any way, include a relationship — use Tier 3 at minimum. Only omit a pair if they share no connection in this scene."""

        logger.info(f"Batch LLM call: {len(entities)} entities")
        response = self.llm_loader.generate(prompt, max_tokens=1200)
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
            if role not in VALID_ROLES:
                role = 'other'

            entity_map[canonical].attributes = {
                'description': item.get('description', ''),
                'role': role,
                **{k: v for k, v in item.get('attributes', {}).items()},
            }
            logger.debug(f"  Enriched '{canonical}' — role: {role}")

        enriched = list(entity_map.values())

        # ── Extract relationships ─────────────────────────────────────────────
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

            rel_type = (item.get('type') or 'related_to').strip() or 'related_to'

            relationships.append(Relationship(
                source=source,
                target=target,
                relation_type=rel_type,
                description=item.get('description', ''),
                confidence=0.9,
            ))
            logger.debug(f"  Relationship: {source} --[{rel_type}]--> {target}")

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
        logger.debug(f"  {e.name} ({e.type}) — role: {e.attributes.get('role', '—')}")
    for r in relationships:
        logger.debug(f"  {r.source} --[{r.relation_type}]--> {r.target}")

    return enriched_entities, relationships
