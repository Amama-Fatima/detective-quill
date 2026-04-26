from typing import List
import spacy
from src.config import settings
from src.models.schemas import Entity, Relationship, PipelineResult, PipelineMetadata
from src.pipeline.layer1_spacy import extract_entities_layer1
from src.pipeline.layer2_postprocess import postprocess_entities_layer2
from src.pipeline.layer3_enrichment import enrich_and_extract_batch
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


class NarrativeAnalysisPipeline:

    def __init__(self, nlp=None):
        if nlp is not None:
            self.nlp = nlp
        else:
            self.nlp = spacy.load(settings.SPACY_MODEL)

    def process_scene(self, scene_text: str, verbose: bool = True) -> PipelineResult:

        if verbose:
            logger.info("=" * 60)
            logger.info("PROCESSING SCENE")
            logger.info("=" * 60)

        if verbose:
            logger.info("\n[1/3] Extracting entities with spaCy...")

        raw_entities, resolved_text = extract_entities_layer1(scene_text, nlp=self.nlp)
        num_raw_entities = len(raw_entities)

        if resolved_text != scene_text and verbose:
            logger.info(f"✓ Coreference resolution applied")
            logger.info(f"  Original: {scene_text}")
            logger.info(f"  Resolved: {resolved_text}")

        if verbose:
            logger.info(f"✓ Found {num_raw_entities} raw entities")

        if verbose:
            logger.info("\n[2/3] Post-processing entities...")

        clean_entities = postprocess_entities_layer2(raw_entities)

        if verbose:
            logger.info(f"✓ Clean entities:")
            for e in clean_entities:
                logger.info(f"  - {e.name} ({e.type})")

        if verbose:
            logger.info("\n[3/3] Batch LLM: enriching entities + extracting relationships...")

        enriched_entities, relationships = enrich_and_extract_batch(clean_entities, resolved_text)

        if verbose:
            logger.info(f"Enriched {len(enriched_entities)} entities, found {len(relationships)} relationships")

        metadata = PipelineMetadata(
            num_entities=len(enriched_entities),
            num_relationships=len(relationships),
            num_raw_entities=num_raw_entities
        )

        result = PipelineResult(
            entities=enriched_entities,
            relationships=relationships,
            metadata=metadata,
            resolved_text=resolved_text
        )

        if verbose:
            logger.info("\n" + "=" * 60)
            logger.info("PIPELINE COMPLETE")
            logger.info("=" * 60)
            logger.info(f"Raw entities: {metadata.num_raw_entities}")
            logger.info(f"Final entities: {metadata.num_entities}")
            logger.info(f"Relationships: {metadata.num_relationships}")

        return result


def process_scene(scene_text: str, verbose: bool = True) -> PipelineResult:
    pipeline = NarrativeAnalysisPipeline()
    return pipeline.process_scene(scene_text, verbose=verbose)