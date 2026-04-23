import re
from typing import List
from src.models.schemas import Entity
from src.config import settings
from src.utils.logger import setup_logger

# Honorific titles to strip before name comparison
_TITLE_RE = re.compile(
    r'\b(mr|mrs|ms|miss|dr|prof|sir|lord|lady|det|sgt|cpl|insp)\.?\s*',
    re.IGNORECASE,
)
# Any remaining punctuation after title stripping
_PUNCT_RE = re.compile(r"[^\w\s]")

logger = setup_logger(__name__)

# Single-word strings that spaCy commonly mislabels as ORG in fiction:
# greetings, interjections, genericised brand names, etc.
FICTION_FALSE_ORG_WORDS = {
    # greetings / interjections / dialogue fillers
    'hullo', 'hello', 'hi', 'hey', 'goodbye', 'bye', 'yes', 'no',
    'ok', 'okay', 'sure', 'right', 'well', 'oh', 'ah', 'aye', 'nope',
    'darling', 'dear', 'love', 'sir', 'madam', 'miss', 'mister',
    # genericised brand / household names not useful as entities
    'thermos', 'kleenex', 'hoover', 'jello',
}


class EntityPostProcessor:
    def __init__(self):
        self.keep_types = {
            'PERSON',      
            'ORG',       
            'GPE',         
            'LOC',        
            'FAC',        
            'PRODUCT',     
            'EVENT',       
                 
        }

        self.skip_types = {
            'TIME', 'DATE', 'CARDINAL', 'ORDINAL',
            'QUANTITY', 'PERCENT', 'MONEY'
        }

    def normalize_name(self, name: str) -> str:
        """Lowercase, strip honorific titles and punctuation, collapse whitespace."""
        name = _TITLE_RE.sub('', name)
        name = _PUNCT_RE.sub('', name)
        return ' '.join(name.lower().split())

    def is_substring_match(self, short_name: str, long_name: str) -> bool:
        short_tokens = set(self.normalize_name(short_name).split())
        long_tokens  = set(self.normalize_name(long_name).split())
        # Match if every token in the shorter name appears in the longer one
        # e.g. {"maloney"} ⊆ {"mary", "maloney"}  →  True
        #      {"mrs", "maloney"} → after title strip → {"maloney"} ⊆ {"mary","maloney"} → True
        if not short_tokens:
            return False
        return short_tokens <= long_tokens
    
    def merge_duplicate_entities(self, entities: List[Entity]) -> List[Entity]:
        
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
          
        }
        
        for entity in entities:
            if entity.type not in type_priority:
                continue
            
            if entity.type == 'GPE' and len(entity.name.split()) <= 2:
                entity.attributes['uncertain_type'] = True
        
        return entities


    def remove_false_positives(self, entities: List[Entity]) -> List[Entity]:
        result = []
        for entity in entities:
            tokens = entity.name.split()
            if (
                entity.type == 'ORG'
                and len(tokens) == 1
                and entity.name.lower() in FICTION_FALSE_ORG_WORDS
            ):
                logger.debug(f"  Removed false-positive ORG: '{entity.name}'")
                continue
            result.append(entity)
        return result

    def process(self, entities: List[Entity], verbose: bool = True) -> List[Entity]:
        if verbose:
            logger.info(f"  Input: {len(entities)} raw entities")

        entities = self.remove_false_positives(entities)
        if verbose:
            logger.info(f"  After false-positive removal: {len(entities)} entities")

        entities = self.filter_entity_types(entities)
        if verbose:
            logger.info(f"  After filtering: {len(entities)} entities")
        
        entities = self.merge_duplicate_entities(entities)
        if verbose:
            logger.info(f"  After deduplication: {len(entities)} entities")
        
        entities = self.resolve_type_conflicts(entities)
        if verbose:
            logger.info(f"  After type resolution: {len(entities)} entities")
        
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