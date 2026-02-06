import spacy
from typing import List
from collections import defaultdict
from src.models.schemas import Entity, RawEntity
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

class SpacyEntityExtractor:
    def __init__(self):
        self.nlp = None
        self._load_model()

    def _load_model(self):
        try:
            logger.info(f"Loading spaCy model: {settings.SPACY_MODEL}")
            self.nlp = spacy.load(settings.SPACY_MODEL)
            logger.info("spaCy model loaded successfully.")
        except OSError:
            logger.warning(f"spaCy model '{settings.SPACY_MODEL}' not found. Attempting to download...")
            self.nlp = spacy.load(settings.SPACY_MODEL, exclude=["parser", "tagger", "lemmatizer"])
            logger.info("spaCy model downloaded and loaded successfully.")
    
    def extract_entities(self, text: str) -> List[RawEntity]:
        doc = self.nlp(text)

        raw_entities = []
        for ent in doc.ents:
            raw_entity = RawEntity(
                text = ent.text,
                label = ent.label_,
                start = ent.start_char,
                end = ent.end_char
            )
            raw_entities.append(raw_entity)
        logger.debug(f"Extracted {len(raw_entities)} raw entities from text.")
        return raw_entities
    
    def convert_to_entities(self, raw_entities: List[RawEntity]) -> List[Entity]:
        
        entity_groups = defaultdict(list)

        for raw_ent in raw_entities:
            key = (raw_ent.text, raw_ent.label)
            entity_groups[key].append(raw_ent)

        entities = []
        for(name, entity_type), mentions in entity_groups.items():
            entity = Entity(
                name=name,
                type=entity_type,
                mentions=list(set(mentions)),
                attributes={}
            )
            entities.append(entity)

        logger.debug(f"Converted {len(raw_entities)} raw entities into {len(entities)} unique entities.")
        return entities
    

def extract_entities_layer1(scene_text: str) -> List[Entity]:
    logger.info("=" * 60)
    logger.info("LAYER 1: spaCy Entity Extraction")
    logger.info("=" * 60)

    extractor = SpacyEntityExtractor()
    raw_entities = extractor.extract_raw_entities(scene_text)
    logger.info(f"Found {len(raw_entities)} raw entities")

    entities = extractor.convert_to_entities(raw_entities)
    logger.info(f"Converted to {len(entities)} entities")

    for entity in entities:
        logger.debug(f"  - {entity.name} ({entity.type})")
    
    logger.info(f"Layer 1 complete: {len(entities)} entities extracted")
    
    return entities


