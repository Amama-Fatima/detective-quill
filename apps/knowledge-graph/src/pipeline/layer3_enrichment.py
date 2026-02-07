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
    
    def enrich_single_entity(self, entity: Entity, scene_text: str) -> Entity:
      
        logger.debug(f"Enriching entity: {entity.name} ({entity.type})")
        
        prompt = f"""Given this detective fiction scene, provide rich contextual information for the entity "{entity.name}".

        Scene:
        {scene_text}

        Entity to analyze:
        - Name: {entity.name}
        - Type: {entity.type}
        - Mentions in text: {', '.join(entity.mentions)}

        Extract relevant attributes for this entity based on the context. Output valid JSON:
        {{
        "description": "brief description from context",
        "role": "detective/suspect/victim/witness/location/object/etc",
        "attributes": {{
            "key": "value"
        }}
        }}

        Examples of attributes you might include:
        - For people: occupation, motive, alibi, behavior, emotional_state
        - For locations: significance, atmosphere, accessibility
        - For objects: type (weapon/evidence/clue), owner, condition

        Only output valid JSON for "{entity.name}":"""
        
        response = self.llm_loader.generate(prompt, max_tokens=400)
        
        logger.debug(f"LLM response for '{entity.name}': {response[:150]}")
        
        try:
            response = re.sub(r'```json\s*', '', response)
            response = re.sub(r'```\s*', '', response)
            
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                entity_data = json.loads(json_match.group())
            else:
                entity_data = json.loads(response)
            
            entity.attributes = {
                'description': entity_data.get('description', ''),
                'role': entity_data.get('role', ''),
                **entity_data.get('attributes', {})
            }
            
            logger.debug(f"  ✓ Enriched '{entity.name}' with role: {entity.attributes.get('role')}")
            
            return entity
        
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error for '{entity.name}': {e}")
            logger.error(f"Response: {response[:300]}")
            return entity 
        except Exception as e:
            logger.error(f"Unexpected error enriching '{entity.name}': {e}")
            return entity
    
    def enrich_entities(self, entities: List[Entity], scene_text: str) -> List[Entity]:

        logger.info(f"Enriching {len(entities)} entities individually")
        
        enriched_entities = []
        
        for i, entity in enumerate(entities, 1):
            logger.info(f"  [{i}/{len(entities)}] Processing: {entity.name}")
            enriched_entity = self.enrich_single_entity(entity, scene_text)
            enriched_entities.append(enriched_entity)
        
        return enriched_entities


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
    
    return enriched_entities