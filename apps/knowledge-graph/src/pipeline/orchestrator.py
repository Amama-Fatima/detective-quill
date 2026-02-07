from typing import List
from src.models.schemas import Entity, Relationship, PipelineResult, PipelineMetadata
from src.pipeline.layer1_spacy import extract_entities_layer1
from src.pipeline.layer2_postprocess import postprocess_entities_layer2
from src.pipeline.layer3_enrichment import enrich_entities_layer3
from src.pipeline.layer4_relationships import extract_relationships_layer4
from src.utils.logger import setup_logger


logger = setup_logger(__name__)


class NarrativeAnalysisPipeline:

    
    def __init__(self):
        pass
    
    def process_scene(self, scene_text: str, verbose: bool = True) -> PipelineResult:
        
        if verbose:
            logger.info("=" * 60)
            logger.info("PROCESSING SCENE")
            logger.info("=" * 60)
        
        if verbose:
            logger.info("\n[1/4] Extracting entities with spaCy...")
        
        raw_entities = extract_entities_layer1(scene_text)
        num_raw_entities = len(raw_entities)
        
        if verbose:
            logger.info(f"✓ Found {num_raw_entities} raw entities")
        
        if verbose:
            logger.info("\n[2/4] Post-processing entities...")
        
        clean_entities = postprocess_entities_layer2(raw_entities)
        
        if verbose:
            logger.info(f"✓ Clean entities:")
            for e in clean_entities:
                logger.info(f"  - {e.name} ({e.type})")
        
        if verbose:
            logger.info("\n[3/4] Enriching entities with LLM...")
        
        enriched_entities = enrich_entities_layer3(clean_entities, scene_text)
        
        if verbose:
            logger.info(f"Enriched {len(enriched_entities)} entities")
        
        if verbose:
            logger.info("\n[4/4] Extracting relationships with LLM...")
        
        relationships = extract_relationships_layer4(enriched_entities, scene_text)
        
        if verbose:
            logger.info(f"Found {len(relationships)} relationships")
        
        metadata = PipelineMetadata(
            num_entities=len(enriched_entities),
            num_relationships=len(relationships),
            num_raw_entities=num_raw_entities
        )
        
        result = PipelineResult(
            entities=enriched_entities,
            relationships=relationships,
            metadata=metadata
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