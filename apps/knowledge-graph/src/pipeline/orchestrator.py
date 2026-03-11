import time
from typing import List
import spacy
from src.models.schemas import Entity, Relationship, PipelineResult, PipelineMetadata
from src.pipeline.layer1_spacy import extract_entities_layer1
from src.pipeline.layer2_postprocess import postprocess_entities_layer2
from src.pipeline.layer3_enrichment import enrich_entities_layer3
from src.pipeline.layer4_relationships import extract_relationships_layer4
from src.utils.logger import setup_logger

logger = setup_logger(__name__)

def _truncate(s: str, max_len: int = 500) -> str:
    if not s or len(s) <= max_len:
        return s or ""
    return s[:max_len] + "..."


class NarrativeAnalysisPipeline:

    def __init__(self, nlp=None, coref_model=None):
        if nlp is not None:
            self.nlp = nlp
        else:
            self.nlp = spacy.load("en_core_web_lg")
        self.coref_model = coref_model 

    def process_scene(self, scene_text: str, verbose: bool = True) -> PipelineResult:
        pipeline_start = time.time()
        input_word_count = len(scene_text.split()) if scene_text else 0

        if verbose:
            logger.info("=" * 60)
            logger.info("PROCESSING SCENE")
            logger.info("=" * 60)

        if verbose:
            logger.info("\n[1/4] Extracting entities with spaCy...")
        layer1_start = time.time()
        raw_entities, resolved_text = extract_entities_layer1(
            scene_text,
            nlp=self.nlp,
            coref_model=self.coref_model,
        )
        layer1_elapsed = time.time() - layer1_start
        num_raw_entities = len(raw_entities)
        logger.info(
            f"Layer 1 (spaCy + coref) completed: input_word_count={input_word_count}, "
            f"output_entity_count={num_raw_entities}, elapsed_seconds={layer1_elapsed:.2f}"
        )
        if verbose:
            logger.info(f"resolved_text (truncated): {_truncate(resolved_text)}")
            for i, e in enumerate(raw_entities):
                logger.info(f"  layer1_entity[{i}]: name={e.name}, type={e.type}, mentions={e.mentions}")

        if resolved_text != scene_text and verbose:
            logger.info(f"✓ Coreference resolution applied")
            logger.info(f"  Original: {scene_text}")
            logger.info(f"  Resolved: {resolved_text}")

        if verbose:
            logger.info(f"✓ Found {num_raw_entities} raw entities")

        if verbose:
            logger.info("\n[2/4] Post-processing entities...")
        layer2_start = time.time()
        clean_entities = postprocess_entities_layer2(raw_entities)
        layer2_elapsed = time.time() - layer2_start
        num_clean = len(clean_entities)
        logger.info(
            f"Layer 2 (postprocess) completed: input_entity_count={num_raw_entities}, "
            f"output_entity_count={num_clean}, elapsed_seconds={layer2_elapsed:.2f}"
        )
        if verbose:
            logger.info("✓ Clean entities:")
            for e in clean_entities:
                logger.info(f"  - {e.name} ({e.type})")

        if verbose:
            logger.info("\n[3/4] Enriching entities with LLM...")
        layer3_start = time.time()
        enriched_entities = enrich_entities_layer3(clean_entities, resolved_text)
        layer3_elapsed = time.time() - layer3_start
        num_enriched = len(enriched_entities)
        logger.info(
            f"Layer 3 (LLM enrichment) completed: input_entity_count={num_clean}, "
            f"output_entity_count={num_enriched}, elapsed_seconds={layer3_elapsed:.2f}"
        )
        if verbose:
            for e in enriched_entities:
                logger.info(
                    f"  enriched_entity: name={e.name}, type={e.type}, "
                    f"attributes={e.attributes}, mentions={e.mentions}"
                )

        if verbose:
            logger.info("\n[4/4] Extracting relationships with LLM...")
        layer4_start = time.time()
        relationships = extract_relationships_layer4(enriched_entities, resolved_text, nlp=self.nlp)
        layer4_elapsed = time.time() - layer4_start
        num_relationships = len(relationships)
        logger.info(
            f"Layer 4 (LLM relationships) completed: input_entity_count={num_enriched}, "
            f"output_relationship_count={num_relationships}, elapsed_seconds={layer4_elapsed:.2f}"
        )
        if verbose:
            logger.info("Extracted relationships:")
            for r in relationships:
                logger.info(
                    f"  relationship: source={r.source}, relation_type={r.relation_type}, "
                    f"target={r.target}, description={_truncate(r.description, 120)}, confidence={r.confidence}"
                )

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

        total_elapsed = time.time() - pipeline_start
        if verbose:
            logger.info("\n" + "=" * 60)
            logger.info("PIPELINE COMPLETE")
            logger.info("=" * 60)
            logger.info(f"Raw entities: {metadata.num_raw_entities}")
            logger.info(f"Final entities: {metadata.num_entities}")
            logger.info(f"Relationships: {metadata.num_relationships}")
        logger.info(
            f"process_scene total pipeline elapsed_seconds={total_elapsed:.2f} "
            f"(layer1={layer1_elapsed:.2f}, layer2={layer2_elapsed:.2f}, layer3={layer3_elapsed:.2f}, layer4={layer4_elapsed:.2f})"
        )

        return result


def process_scene(scene_text: str, verbose: bool = True) -> PipelineResult:
    pipeline = NarrativeAnalysisPipeline()
    return pipeline.process_scene(scene_text, verbose=verbose)