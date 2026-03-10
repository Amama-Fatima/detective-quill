import re
import json
from typing import List

from src.models.schemas import Entity
from src.models.llm_loader import get_llm_loader
from src.utils.logger import setup_logger


logger = setup_logger(__name__)


class LLMEntityEnricher:

    def __init__(self):
        """Initialize the enricher with the LLM model."""
        self.llm_loader = get_llm_loader()

    def enrich_entity_pair(self, entities: List[Entity], scene_text: str) -> List[Entity]:
        """Enrich 1 or 2 entities in a single LLM call."""

        prompt = f"""Scene: "{scene_text}"

You are extracting information about specific entities from the scene above.

For each entity below, write what the scene text says about them. Be descriptive. Do not return null for description unless the entity is literally not mentioned.

Entities:
{chr(10).join(f'{idx+1}. "{e.name}" (type: {e.type})' for idx, e in enumerate(entities))}

Output ONLY a JSON array with exactly {len(entities)} object(s), one per entity, in the same order as listed above:
[
  {{"name":"<entity name>","description":"<1-2 sentences about this entity from the scene>","role":"<detective|suspect|victim|witness|object|location|other>","attributes":{{}}}},
  ...
]

Only add extra keys to "attributes" if the scene explicitly states them (e.g. age, occupation). Keep each object focused on its own entity only."""

        response = self.llm_loader.generate(prompt, max_tokens=300)
        logger.debug(f"LLM response for pair {[e.name for e in entities]}: {response[:300]}")

        try:
            response = re.sub(r'```json\s*', '', response)
            response = re.sub(r'```\s*', '', response)
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                results = json.loads(json_match.group())
            else:
                results = json.loads(response)

            if not isinstance(results, list):
                results = [results] if isinstance(results, dict) else []

            for idx, entity in enumerate(entities):
                if idx < len(results):
                    data = results[idx]
                    if isinstance(data, dict):
                        entity.attributes.update({
                            'description': data.get('description', ''),
                            'role': data.get('role', ''),
                            **data.get('attributes', {})
                        })
                        logger.debug(f"  ✓ Enriched '{entity.name}' with role: {entity.attributes.get('role')}")

            return entities

        except (json.JSONDecodeError, Exception) as e:
            logger.error(f"Error enriching pair {[e.name for e in entities]}: {e}")
            logger.error(f"Response: {response[:300]}")
            return entities  # return unenriched rather than crashing

    def enrich_entities(self, entities: List[Entity], scene_text: str) -> List[Entity]:
        logger.info(f"Enriching {len(entities)} entities in pairs")

        enriched = []
        for i in range(0, len(entities), 2):
            batch = entities[i:i+2]
            names = [e.name for e in batch]
            logger.info(f"  [{i+1}-{min(i+2, len(entities))}/{len(entities)}] Processing: {names}")
            enriched.extend(self.enrich_entity_pair(batch, scene_text))

        return enriched


def enrich_entities_layer3(entities: List[Entity], scene_text: str) -> List[Entity]:
    
    logger.info("=" * 60)
    logger.info("LAYER 3: LLM Entity Enrichment")
    logger.info("=" * 60)
    
    enricher = LLMEntityEnricher()
    
    enriched_entities = enricher.enrich_entities(entities, scene_text)
    
    logger.info(f"Layer 3 complete: {len(enriched_entities)} entities enriched")
    for entity in enriched_entities:
        role = entity.attributes.get('role', 'unknown')
        logger.debug(f"  - {entity.name} ({entity.type}) → role: {role}")

    logger.info(f"Layer 3 final enriched entities JSON: {json.dumps([e.dict() for e in enriched_entities], indent=2)}")
    return enriched_entities