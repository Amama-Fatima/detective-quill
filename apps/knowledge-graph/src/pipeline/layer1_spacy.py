import spacy
from typing import List, Tuple
from collections import defaultdict
from src.models.schemas import Entity, RawEntity
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

# Nouns that refer to a person even when no name is given (e.g. "her husband")
PERSON_ROLE_NOUNS = {
    'husband', 'wife', 'man', 'woman', 'boy', 'girl',
    'father', 'mother', 'brother', 'sister', 'son', 'daughter',
    'detective', 'officer', 'inspector', 'sergeant', 'constable',
    'suspect', 'victim', 'witness', 'murderer', 'killer', 'criminal',
    'stranger', 'visitor', 'patient', 'doctor', 'nurse', 'guard',
    'partner', 'colleague', 'friend',
}


def _extract_character_references(doc) -> List[RawEntity]:
    """Find noun chunks whose head is a person-role noun (e.g. 'her husband').
    Returns one RawEntity per unique role noun so unnamed characters get a node."""
    found = []
    seen_lemmas: set = set()

    for chunk in doc.noun_chunks:
        head = chunk.root
        lemma = head.lemma_.lower()
        if lemma in PERSON_ROLE_NOUNS and lemma not in seen_lemmas:
            seen_lemmas.add(lemma)
            # Use just the head noun as the canonical name ("husband" not "her husband")
            found.append(RawEntity(
                text=head.text,
                label='PERSON',
                start=head.idx,
                end=head.idx + len(head.text),
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
        primary_is_role_noun = any(
            doc[i].pos_ == "NOUN" and doc[i].lemma_.lower() in PERSON_ROLE_NOUNS
            for i in best_mention
        )
        if not primary_is_proper and not primary_is_role_noun:
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

        # Add unnamed characters that spaCy NER misses (e.g. "her husband")
        unnamed = _extract_character_references(doc)
        if unnamed:
            # Avoid duplicating names already found by NER
            ner_names = {e.text.lower() for e in raw_entities if e.label == 'PERSON'}
            for u in unnamed:
                if u.text.lower() not in ner_names:
                    raw_entities.append(u)
                    logger.debug(f"  Added unnamed character reference: '{u.text}'")

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
                attributes={}
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