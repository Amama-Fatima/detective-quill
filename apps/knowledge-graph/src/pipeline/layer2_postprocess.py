from typing import List
from src.models.schemas import Entity
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

class EntityPostProcessor:
    def __init__(self):
        self.keep_types = {
            'PERSON',      
            'ORG',         # Organizations
            'GPE',         # Geopolitical entities (cities, countries)
            'LOC',         # Non-GPE locations
            'FAC',         # Facilities (buildings, airports, etc.)
            'PRODUCT',     # Objects, vehicles, foods, etc.
            'EVENT',       # Named events
            'WORK_OF_ART', # Titles of books, songs, etc.
            'LAW',         # Named documents made into laws
        }

        self.skip_types = {
            'TIME', 'DATE', 'CARDINAL', 'ORDINAL',
            'QUANTITY', 'PERCENT', 'MONEY'
        }

    def normalize_name(self, name: str) -> str:
        return name.lower().strip()
    
    def is_substring_match(self, short_name: str, long_name: str) -> bool:
        
        short = self.normalize_name(short_name)
        long = self.normalize_name(long_name)
        
        # Handle cases like "Marcus" in "Marcus Chen"
        # or "Sullivan" in "Robert Sullivan"
        return short in long.split() or short == long
    
    def merge_duplicate_entities(self, entities: List[Entity]) -> List[Entity]:
        
        # Sort by name length (longer names first)
        sorted_entities = sorted(entities, key=lambda e: len(e.name), reverse=True)
        
        merged = []
        used_indices = set()
        
        for i, entity in enumerate(sorted_entities):
            if i in used_indices:
                continue
            
            matches = [entity]
            
            for j, other in enumerate(sorted_entities[i+1:], start=i+1):
                if j in used_indices:
                    continue
                
                if self.is_substring_match(other.name, entity.name):
                    matches.append(other)
                    used_indices.add(j)
            
            if len(matches) > 1:
                primary = matches[0]
                
                all_mentions = []
                for match in matches:
                    all_mentions.extend(match.mentions)
                
                primary.mentions = list(set(all_mentions))
                merged.append(primary)
            else:
                merged.append(entity)
        
        return merged
    
    def filter_entity_types(self, entities: List[Entity]) -> List[Entity]:
        
        filtered = []
        
        for entity in entities:
            if entity.type in self.keep_types:
                filtered.append(entity)
            elif entity.type not in self.skip_types:
                filtered.append(entity)
        
        return filtered
    
    def resolve_type_conflicts(self, entities: List[Entity]) -> List[Entity]:
        
        type_priority = {
            'PERSON': 10,
            'ORG': 8,
            'FAC': 7,
            'LOC': 6,
            'GPE': 5,
            'PRODUCT': 4,
            'EVENT': 3,
            'WORK_OF_ART': 2,
            'LAW': 1
        }
        
        for entity in entities:
            if entity.type not in type_priority:
                continue
            
            if entity.type == 'GPE' and len(entity.name.split()) <= 2:
                entity.attributes['uncertain_type'] = True
        
        return entities


    def process(self, entities: List[Entity], verbose: bool = True) -> List[Entity]:
        if verbose:
            logger.info(f"  → Input: {len(entities)} raw entities")
        
        entities = self.filter_entity_types(entities)
        if verbose:
            logger.info(f"  → After filtering: {len(entities)} entities")
        
        entities = self.merge_duplicate_entities(entities)
        if verbose:
            logger.info(f"  → After deduplication: {len(entities)} entities")
        
        entities = self.resolve_type_conflicts(entities)
        if verbose:
            logger.info(f"  → After type resolution: {len(entities)} entities")
        
        return entities
    


def postprocess_entities_layer2(entities: List[Entity]) -> List[Entity]:
    
    logger.info("=" * 60)
    logger.info("LAYER 2: Entity Post-Processing")
    logger.info("=" * 60)
    
    processor = EntityPostProcessor()
    
    clean_entities = processor.process(entities, verbose=True)
    
    logger.info(f"Layer 2 complete: {len(clean_entities)} clean entities")
    for entity in clean_entities:
        logger.debug(f"  - {entity.name} ({entity.type}) - {len(entity.mentions)} mentions")
    
    return clean_entities