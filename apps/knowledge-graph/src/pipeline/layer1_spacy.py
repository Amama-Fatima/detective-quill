import spacy
from typing import List, Tuple
from collections import defaultdict
from src.models.schemas import Entity, RawEntity
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

PERSON_ROLE_NOUNS = {
    'husband', 'wife',
    'father', 'mother', 'brother', 'sister', 'son', 'daughter','officer','sergeant', 'constable', 'visitor', 'patient', 'doctor', 'nurse', 'guard',
    'partner', 'colleague', 'friend',
}

ITEM_NOUNS = {
    'knife', 'dagger', 'blade', 'gun', 'pistol', 'revolver', 'rifle', 'bullet', 'bullets', 'rope',
    'letter', 
     'evidence', 'lanyard',
}

ITEM_PHRASES = {
    'suicide note', 'handwritten letter', 'bloody knife', 'kitchen knife','sealed envelope', 'murder weapon', 'fingerprint card', 'leg of a lamb'
}

LOCATION_NOUNS = {
"room", "office", "lab"
}


def _token_in_mention(token_i: int, mention) -> bool:
    return token_i in mention


def _has_named_alias_in_coref_chain(token) -> bool:
    doc = token.doc
    if not hasattr(doc._, "coref_chains") or not doc._.coref_chains:
        return False

    for chain in doc._.coref_chains:
        token_is_in_chain = any(_token_in_mention(token.i, mention) for mention in chain)
        if not token_is_in_chain:
            continue

        for mention in chain:
            if any(doc[i].pos_ == "PROPN" for i in mention):
                return True

    return False


def _sentence_has_named_entity(chunk, labels: set) -> bool:
    sent = chunk.sent
    for ent in sent.ents:
        if ent.label_ in labels and any(tok.pos_ == "PROPN" for tok in ent):
            return True
    return False

def _extract_location_references(doc) -> List[RawEntity]:
    found = []
    seen_spans: set = set()

    for chunk in doc.noun_chunks:
        head = chunk.root
        head_lemma = head.lemma_.lower()
        chunk_lemma_text = " ".join(tok.lemma_.lower() for tok in chunk if tok.is_alpha)

        if head_lemma not in LOCATION_NOUNS and chunk_lemma_text not in LOCATION_NOUNS:
            continue

        # If this noun is coref-linked to a named place, keep only the named place.
        if _has_named_alias_in_coref_chain(head):
            continue

        # Fallback: if sentence already has a named location, skip generic noun.
        if _sentence_has_named_entity(chunk, {"FAC", "LOC", "GPE"}):
            continue

        text = chunk.text.strip()
        key = text.lower()
        if key in seen_spans:
            continue

        seen_spans.add(key)
        found.append(RawEntity(
            text=text,
            label="FAC",
            start=chunk.start_char,
            end=chunk.end_char,
        ))

    return found


def _extract_item_references(doc) -> List[RawEntity]:
    found = []
    seen_spans: set = set()

    for chunk in doc.noun_chunks:
        head = chunk.root
        head_lemma = head.lemma_.lower()
        chunk_lemma_text = " ".join(tok.lemma_.lower() for tok in chunk if tok.is_alpha)

        if head_lemma not in ITEM_NOUNS and chunk_lemma_text not in ITEM_NOUNS and chunk_lemma_text not in ITEM_PHRASES:
            continue

        text = chunk.text.strip()
        key = text.lower()
        if key in seen_spans:
            continue

        seen_spans.add(key)
        found.append(RawEntity(
            text=text,
            label="PRODUCT",
            start=chunk.start_char,
            end=chunk.end_char,
        ))

    return found


def _resolve_coreferences(doc) -> str:
    if not doc._.coref_chains:
        logger.debug("No coreference chains found — returning original text")
        return doc.text

    replacements = {}

    for chain in doc._.coref_chains:
        best_mention = chain[chain.most_specific_mention_index]
        primary_text = " ".join(doc[i].text for i in best_mention)

        primary_is_proper = any(doc[i].pos_ == "PROPN" for i in best_mention)
        if not primary_is_proper:
            continue

        for mention in chain:
            mention_start = mention[0]
            first_token = doc[mention_start]

            if mention == best_mention:
                continue

            is_pronoun = first_token.pos_ == "PRON"
            is_possessive = "Poss=Yes" in str(first_token.morph)

            if is_pronoun and not is_possessive:
                replacements[mention_start] = primary_text
                for idx in mention[1:]:
                    replacements[idx] = None

    if not replacements:
        logger.debug("Coreference chains found but no pronouns to replace")
        return doc.text

    result = []
    for token in doc:
        if token.i not in replacements:
            result.append(token.text_with_ws)
        elif replacements[token.i] is None:
            pass
        else:
            result.append(replacements[token.i] + token.whitespace_)

    return "".join(result)

class SpacyEntityExtractor:

    def __init__(self, nlp=None):
        if nlp is not None:
            self.nlp = nlp
            self._owns_nlp = False
        else:
            self._load_model()
            self._owns_nlp = True

    def _load_model(self):
        try:
            logger.info(f"Loading spaCy model: {settings.SPACY_MODEL}")
            self.nlp = spacy.load(settings.SPACY_MODEL)
            logger.info("spaCy model loaded successfully.")
        except OSError:
            logger.warning(f"spaCy model '{settings.SPACY_MODEL}' not found. Attempting to download...")
            self.nlp = spacy.load(settings.SPACY_MODEL, exclude=["parser", "tagger", "lemmatizer"])
            logger.info("spaCy model downloaded and loaded successfully.")

    def resolve_and_extract(self, text: str) -> Tuple[List[RawEntity], str]:

        doc = self.nlp(text)
        coref_available = "coreferee" in self.nlp.pipe_names

        if coref_available:
            try:
                resolved_text = _resolve_coreferences(doc)
                if resolved_text != text:
                    logger.info("Coreference resolution changed the text — re-running NER on resolved version")
                    doc = self.nlp(resolved_text)
                else:
                    logger.info("Coreference ran but found nothing to replace")
                    resolved_text = text
            except Exception as e:
                logger.warning(f"Coreference resolution failed ({e}) — using original text")
                resolved_text = text
        else:
            resolved_text = text

        raw_entities = []
        for ent in doc.ents:
            raw_entity = RawEntity(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char
            )
            raw_entities.append(raw_entity)

        # Add generic locations only when no named location is available
        loc_refs = _extract_location_references(doc)
        if loc_refs:
            existing_loc_names = {
                e.text.lower() for e in raw_entities if e.label in {"FAC", "LOC", "GPE"}
            }
            for loc in loc_refs:
                if loc.text.lower() not in existing_loc_names:
                    raw_entities.append(loc)
                    logger.debug(f"  Added location reference: '{loc.text}'")

        # Add high-signal detective-story items such as knives, letters, keys, etc.
        item_refs = _extract_item_references(doc)
        if item_refs:
            existing_item_names = {
                e.text.lower() for e in raw_entities if e.label == "PRODUCT"
            }
            for item in item_refs:
                if item.text.lower() not in existing_item_names:
                    raw_entities.append(item)
                    logger.debug(f"  Added item reference: '{item.text}'")

        logger.debug(f"Extracted {len(raw_entities)} raw entities from text.")
        return raw_entities, resolved_text

    def convert_to_entities(self, raw_entities: List[RawEntity]) -> List[Entity]:
        entity_groups = defaultdict(list)

        for raw_ent in raw_entities:
            key = (raw_ent.text, raw_ent.label)
            entity_groups[key].append(raw_ent)

        entities = []
        for (name, entity_type), mentions in entity_groups.items():
            mention_texts = [m.text for m in mentions]
            entity = Entity(
                name=name,
                type=entity_type,
                mentions=list(set(mention_texts)),
            )
            entities.append(entity)

        logger.debug(f"Converted {len(raw_entities)} raw entities into {len(entities)} unique entities.")
        return entities


def extract_entities_layer1(scene_text: str, nlp=None) -> Tuple[List[Entity], str]:
    logger.info("=" * 60)
    logger.info("LAYER 1: spaCy Entity Extraction")
    logger.info("=" * 60)

    extractor = SpacyEntityExtractor(nlp=nlp)

    raw_entities, resolved_text = extractor.resolve_and_extract(scene_text)
    logger.info(f"Found {len(raw_entities)} raw entities")

    entities = extractor.convert_to_entities(raw_entities)
    logger.info(f"Converted to {len(entities)} entities")

    for entity in entities:
        logger.debug(f"  - {entity.name} ({entity.type})")

    logger.info(f"Layer 1 complete: {len(entities)} entities extracted")

    return entities, resolved_text