import re
from typing import List
from src.models.schemas import Entity
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

_LEADING_ARTICLES = re.compile(r'^(the|a|an)\s+', re.IGNORECASE)

TYPE_PRIORITY = {
    'PERSON': 10,
    'ORG': 8,
    'FAC': 7,
    'LOC': 6,
    'GPE': 5,
    'PRODUCT': 4,
    'EVENT': 3
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
        """Lowercase, strip whitespace, and remove leading articles."""
        name = name.lower().strip()
        name = _LEADING_ARTICLES.sub('', name).strip()
        return name

    def is_substring_match(self, short_entity: Entity, long_entity: Entity) -> bool:

        if short_entity.type != long_entity.type:
            return False

        short = self.normalize_name(short_entity.name)
        long  = self.normalize_name(long_entity.name)

        if short == long:
            return True

        short_words = short.split()
        long_words  = long.split()

        if len(short_words) > len(long_words):
            return False

        # Sliding window checks contiguous word sequences
        for i in range(len(long_words) - len(short_words) + 1):
            if long_words[i:i + len(short_words)] == short_words:
                return True

        return False

    def merge_duplicate_entities(self, entities: List[Entity]) -> List[Entity]:
        sorted_entities = sorted(
            entities,
            key=lambda e: len(self.normalize_name(e.name)),
            reverse=True
        )
        merged = []
        used_indices = set()

        for i, entity in enumerate(sorted_entities):
            if i in used_indices:
                continue
            matches = [entity]
            for j, other in enumerate(sorted_entities[i + 1:], start=i + 1):
                if j in used_indices:
                    continue
                if self.is_substring_match(other, entity):
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

    def merge_cross_type_duplicates(self, entities: List[Entity]) -> List[Entity]:

        # Group by normalised name
        groups: dict[str, List[Entity]] = {}
        for entity in entities:
            key = self.normalize_name(entity.name)
            groups.setdefault(key, []).append(entity)

        merged = []
        for key, group in groups.items():
            if len(group) == 1:
                merged.append(group[0])
                continue

            # Pick the entity with the highest-priority type
            primary = max(group, key=lambda e: TYPE_PRIORITY.get(e.type, 0))

            # Absorb all mentions into the primary
            all_mentions = []
            for e in group:
                all_mentions.extend(e.mentions)
            primary.mentions = list(set(all_mentions))

            discarded = [e.name for e in group if e is not primary]
            logger.debug(
                f"  cross-type merge: kept {primary.name!r} ({primary.type}), "
                f"discarded {discarded}"
            )
            merged.append(primary)

        return merged

    def filter_entity_types(self, entities: List[Entity]) -> List[Entity]:
        return [e for e in entities if e.type in self.keep_types]

    def resolve_type_conflicts(self, entities: List[Entity]) -> List[Entity]:
        for entity in entities:
            if len(entity.name.split()) <= 2:
                entity.attributes['uncertain_type'] = True
        return entities

    def process(self, entities: List[Entity], verbose: bool = True) -> List[Entity]:
        logger.info(f"  Input: {len(entities)} raw entities")

        entities = self.filter_entity_types(entities)
        if verbose:
            logger.info(f"  After filtering: {len(entities)} entities")

        entities = self.merge_duplicate_entities(entities)
        if verbose:
            logger.info(f"  After same-type deduplication: {len(entities)} entities")

        entities = self.merge_cross_type_duplicates(entities)
        if verbose:
            logger.info(f"  After cross-type deduplication: {len(entities)} entities")

        entities = self.resolve_type_conflicts(entities)
        if verbose:
            logger.info(f" After type resolution: {len(entities)} entities")

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