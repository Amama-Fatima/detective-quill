import re
import spacy
from typing import List, Tuple, Dict, Optional
from collections import defaultdict
from src.models.schemas import Entity, RawEntity
from src.config import settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

# Span types worth using as canonical coreference anchors
_ANCHOR_TYPES = {'PERSON', 'ORG', 'FAC', 'GPE', 'LOC'}

# Pronouns and short function words we want to resolve
_POSSESSIVES = {"his", "her", "their", "its", "hers", "theirs"}


def _find_canonical_for_cluster(
    cluster: List[Tuple[int, int]],
    text: str,
    spacy_entities: Dict[Tuple[int, int], str],
) -> Optional[str]:
    """
    Given a coreference cluster (list of char-offset spans) and the spaCy named
    entities extracted from the same text, return the clean entity name that
    anchors this cluster.

    Strategy: iterate every span in the cluster; if any span fully contains (or
    exactly matches) a spaCy named entity of an anchor type, use that entity's
    text as the canonical name.  If multiple named entities are found in the
    cluster, prefer the longest one (most specific).

    Returns None if no anchor is found — callers should skip the cluster.
    """
    candidates = []

    for span_start, span_end in cluster:
        for (ent_start, ent_end), ent_text in spacy_entities.items():
            # The cluster span must contain the entity span
            if span_start <= ent_start and span_end >= ent_end:
                candidates.append(ent_text)

    if not candidates:
        return None

    # Prefer the longest (most specific) name, e.g. "Marcus Chen" over "Marcus"
    return max(candidates, key=len)


def _resolve_coreferences_fastcoref(
    text: str,
    coref_model,
    spacy_entities: Dict[Tuple[int, int], str],
) -> str:
    """
    Use fastcoref to resolve pronouns and short mentions to their canonical
    proper name, anchored by spaCy-identified named entities.

    For each coreference cluster:
      1. Find the canonical name by locating the spaCy named entity within the
         cluster.  If none exists, skip the cluster entirely.
      2. Replace short, non-possessive mentions (pronouns, partial names) with
         the canonical name.

    This avoids all hardcoded heuristics — the canonical is always a name that
    spaCy has already validated, never raw span text.
    """
    preds = coref_model.predict(texts=[text])
    clusters = preds[0].get_clusters(as_strings=False)  # list of lists of (start, end)

    if not clusters:
        return text

    replacements = []

    for cluster in clusters:
        if len(cluster) < 2:
            continue

        canonical = _find_canonical_for_cluster(cluster, text, spacy_entities)

        if not canonical:
            logger.debug(
                f"  coref: skipping cluster — no spaCy anchor found. "
                f"First mention: {text[cluster[0][0]:cluster[0][1]]!r}"
            )
            continue

        logger.debug(f"  coref: cluster canonical={canonical!r}, spans={len(cluster)}")

        for start, end in cluster:
            mention_text = text[start:end]

            # Skip possessives — replacing "his" with "Marcus Chen" breaks grammar
            if mention_text.lower() in _POSSESSIVES:
                continue

            # Skip if the mention already is (or contains) the canonical name
            if canonical.lower() in mention_text.lower():
                continue

            # Only replace short mentions: pronouns and partial names (<=3 words)
            if len(mention_text.split()) > 3:
                continue

            replacements.append((start, end, canonical))

    if not replacements:
        return text

    # Apply right-to-left so earlier char offsets stay valid
    replacements.sort(key=lambda x: x[0], reverse=True)
    chars = list(text)
    for start, end, replacement in replacements:
        chars[start:end] = list(replacement)

    return "".join(chars)


class SpacyEntityExtractor:

    def __init__(self, nlp=None, coref_model=None):
        self.coref_model = coref_model
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
            logger.warning(
                f"spaCy model '{settings.SPACY_MODEL}' not found. Attempting to download..."
            )
            self.nlp = spacy.load(settings.SPACY_MODEL, exclude=["parser", "tagger", "lemmatizer"])
            logger.info("spaCy model downloaded and loaded successfully.")

    def _extract_spacy_anchors(self, doc) -> Dict[Tuple[int, int], str]:
        """
        Return a dict of {(start_char, end_char): ent_text} for all spaCy
        entities whose label is in _ANCHOR_TYPES.  These are used to identify
        canonical names within coreference clusters.
        """
        return {
            (ent.start_char, ent.end_char): ent.text
            for ent in doc.ents
            if ent.label_ in _ANCHOR_TYPES
        }

    def resolve_and_extract(self, text: str) -> Tuple[List[RawEntity], str]:

        # initial NER pass to get anchor entities for coreference
        doc = self.nlp(text)

        if self.coref_model is not None:
            try:
                # Build anchor map from the first NER pass
                spacy_entities = self._extract_spacy_anchors(doc)
                logger.debug(f"  coref anchors available: {len(spacy_entities)}")

                resolved_text = _resolve_coreferences_fastcoref(
                    text, self.coref_model, spacy_entities
                )

                if resolved_text != text:
                    logger.info(
                        "fastcoref resolution changed the text — re-running NER on resolved version"
                    )
                    doc = self.nlp(resolved_text)
                else:
                    logger.info("fastcoref ran but found nothing to replace")
                    resolved_text = text

            except Exception as e:
                logger.warning(f"fastcoref resolution failed ({e}) — using original text")
                resolved_text = text
        else:
            resolved_text = text

        raw_entities = [
            RawEntity(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char,
            )
            for ent in doc.ents
        ]

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
                attributes={},
            )
            entities.append(entity)

        logger.debug(
            f"Converted {len(raw_entities)} raw entities into {len(entities)} unique entities."
        )
        return entities


def extract_entities_layer1(
    scene_text: str, nlp=None, coref_model=None
) -> Tuple[List[Entity], str]:
    logger.info("=" * 60)
    logger.info("LAYER 1: spaCy Entity Extraction")
    logger.info("=" * 60)

    extractor = SpacyEntityExtractor(nlp=nlp, coref_model=coref_model)

    raw_entities, resolved_text = extractor.resolve_and_extract(scene_text)
    logger.info(f"Found {len(raw_entities)} raw entities")

    entities = extractor.convert_to_entities(raw_entities)
    logger.info(f"Converted to {len(entities)} entities")

    for entity in entities:
        logger.debug(f"  - {entity.name} ({entity.type})")

    logger.info(f"Layer 1 complete: {len(entities)} entities extracted")

    return entities, resolved_text