import re
import json
from typing import List
from itertools import combinations

from src.models.schemas import Entity, Relationship
from src.models.llm_loader import get_llm_loader
from src.utils.logger import setup_logger


logger = setup_logger(__name__)


class LLMRelationshipExtractor:

    
    def __init__(self):
        self.llm_loader = get_llm_loader()
    
    def extract_pairwise_relationship(
        self,
        entity_a: Entity,
        entity_b: Entity,
        scene_text: str
    ) -> List[Relationship]:
        
        entity_a_context = f"{entity_a.name} ({entity_a.type})"
        if entity_a.attributes.get('role'):
            entity_a_context += f" - Role: {entity_a.attributes['role']}"
        if entity_a.attributes.get('description'):
            entity_a_context += f" - {entity_a.attributes['description']}"
        
        entity_b_context = f"{entity_b.name} ({entity_b.type})"
        if entity_b.attributes.get('role'):
            entity_b_context += f" - Role: {entity_b.attributes['role']}"
        if entity_b.attributes.get('description'):
            entity_b_context += f" - {entity_b.attributes['description']}"
        
        logger.debug(f"Analyzing relationship: {entity_a.name} ↔ {entity_b.name}")
        
        prompt = f"""Analyze if these two entities have any relationships in this scene. Use careful reasoning.

        Scene:
        {scene_text}

        Entity A: {entity_a_context}
        Entity B: {entity_b_context}

        Think step-by-step:
        1. What does the text say about how A and B interact?
        2. Based on their roles, what relationships are possible?
        3. Who is the ACTOR (does the action) and who is ACTED UPON (receives the action)?
        4. Does the evidence clearly support this relationship direction?

        Key reasoning rules:
        - Victims (dead) cannot perform actions after death (can't investigate, kill, interrogate)
        - Detectives investigate/interrogate others (detective → suspect/victim)
        - Witnesses observe events (witness → event/person)
        - "killed" means: killer → victim (NOT victim → anyone)
        - "investigated" means: investigator → subject (NOT subject → investigator)
        - "suspected" means: detective → suspect (NOT suspect → detective)

        Output ONLY relationships you are confident about. Output valid JSON:
        {{
        "reasoning": "brief explanation of what the text shows",
        "relationships": [
            {{"source": "{entity_a.name}", "target": "{entity_b.name}", "type": "relationship_type", "evidence": "quote from text"}}
        ]
        }}

        If NO clear relationship exists between A and B, return empty relationships list.
        Use exact names: "{entity_a.name}" and "{entity_b.name}"

        Only output valid JSON:"""
        
        response = self.llm_loader.generate(prompt, max_tokens=400)
        
        logger.debug(f"LLM response for {entity_a.name} ↔ {entity_b.name}: {response[:150]}")
        
        try:
            response = re.sub(r'```json\s*', '', response)
            response = re.sub(r'```\s*', '', response)
            
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
            else:
                data = json.loads(response)
            
            relationships = []
            for rel in data.get('relationships', []):
                source = rel.get('source', '')
                target = rel.get('target', '')
                
                source_match = source.lower().strip() in [entity_a.name.lower(), entity_b.name.lower()]
                target_match = target.lower().strip() in [entity_a.name.lower(), entity_b.name.lower()]
                
                if source_match and target_match and source.lower() != target.lower():
                    relationship = Relationship(
                        source=source,
                        target=target,
                        relation_type=rel.get('type', 'unknown'),
                        description=rel.get('evidence', ''),
                        confidence=0.9  
                    )
                    relationships.append(relationship)
                    logger.debug(f" Found: {source} --[{rel.get('type')}]--> {target}")
            
            if not relationships:
                logger.debug(f"  No relationship found between {entity_a.name} and {entity_b.name}")
            
            return relationships
        
        except json.JSONDecodeError as e:
            logger.debug(f"  JSON parsing error for {entity_a.name} ↔ {entity_b.name}: {e}")
            return []
        except Exception as e:
            logger.debug(f"  Error extracting relationship: {e}")
            return []
    
    def extract_relationships(self, entities: List[Entity], scene_text: str) -> List[Relationship]:
        
        all_relationships = []
        total_pairs = len(entities) * (len(entities) - 1) // 2
        processed = 0
        
        logger.info(f"Extracting relationships from {total_pairs} entity pairs")
        
        for i, entity_a in enumerate(entities):
            for entity_b in entities[i+1:]:
                processed += 1
                
                logger.info(f"  [{processed}/{total_pairs}] Analyzing: {entity_a.name} ↔ {entity_b.name}")
                
                
                skip_types = {('FAC', 'FAC'), ('LOC', 'LOC'), ('GPE', 'GPE')}
                if (entity_a.type, entity_b.type) in skip_types:
                    logger.debug(f"  ⊘ Skipping {entity_a.type} ↔ {entity_b.type} pair")
                    continue
                
                # Extract pairwise relationships
                pair_relationships = self.extract_pairwise_relationship(
                    entity_a, entity_b, scene_text
                )
                all_relationships.extend(pair_relationships)
        
        logger.info(f"Found {len(all_relationships)} total relationships")
        
        return all_relationships


def extract_relationships_layer4(entities: List[Entity], scene_text: str) -> List[Relationship]:
    
    logger.info("=" * 60)
    logger.info("LAYER 4: LLM Relationship Extraction")
    logger.info("=" * 60)
    
    extractor = LLMRelationshipExtractor()
    
    relationships = extractor.extract_relationships(entities, scene_text)
    
    logger.info(f"Layer 4 complete: {len(relationships)} relationships extracted")
    for rel in relationships:
        logger.debug(f"  - {rel.source} --[{rel.relation_type}]--> {rel.target}")
    
    return relationships