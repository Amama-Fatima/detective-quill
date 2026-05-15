from src.config import settings
from src.models.schemas import PipelineResult, PipelineMetadata
from src.pipeline.layer1_spacy import extract_entities_layer1
from src.pipeline.layer2_postprocess import postprocess_entities_layer2
from src.pipeline.layer3_enrichment import enrich_and_extract_batch, _deduplicate_relationships
from src.pipeline.layer3_candidates import generate_candidate_pairs
from src.pipeline.layer4_relation_classifier import batched_classify
from concurrent.futures import ThreadPoolExecutor, as_completed
from src.utils.logger import setup_logger
import time

logger = setup_logger(__name__)


class NarrativeAnalysisPipeline:

    def __init__(self, nlp=None):
        if nlp is not None:
            self.nlp = nlp
        else:
            import spacy

            self.nlp = spacy.load(settings.SPACY_MODEL)

    def process_scene(self, scene_text: str, verbose: bool = True) -> PipelineResult:

        if verbose:
            logger.info("=" * 60)
            logger.info("PROCESSING SCENE")
            logger.info("=" * 60)

        timings = {}

        if verbose:
            logger.info("\n[1/3] Extracting entities with spaCy...")

        t0 = time.time()
        raw_entities, resolved_text = extract_entities_layer1(scene_text, nlp=self.nlp)
        t1 = time.time()
        timings['layer1_extract'] = t1 - t0
        num_raw_entities = len(raw_entities)

        if resolved_text != scene_text and verbose:
            logger.info(f"Coreference resolution applied")
            logger.info(f"  Original: {scene_text}")
            logger.info(f"  Resolved: {resolved_text}")

        if verbose:
            logger.info(f"✓ Found {num_raw_entities} raw entities")

        if verbose:
            logger.info("\n[2/3] Post-processing entities...")

        t2s = time.time()
        clean_entities = postprocess_entities_layer2(raw_entities)
        t2e = time.time()
        timings['layer2_postprocess'] = t2e - t2s

        if verbose:
            logger.info(f"✓ Clean entities:")
            for e in clean_entities:
                logger.info(f"  - {e.name} ({e.type})")

        if verbose:
            logger.info("\n[3/3] Batch LLM: enriching entities + extracting relationships (batched)...")

        # Batch enrichment to reduce latency: split entities into batches and process in parallel.
        batch_size = getattr(settings, 'KG_BATCH_SIZE', 8)
        max_workers = getattr(settings, 'KG_MAX_WORKERS', min(4, (len(clean_entities) // batch_size) + 1))

        def _chunks(lst, n):
            for i in range(0, len(lst), n):
                yield lst[i:i+n]

        relationships = []
        enriched_map = {e.name: e for e in clean_entities}

        batches = list(_chunks(clean_entities, batch_size)) if clean_entities else []

        enrichment_start = time.time()
        if batches:
            with ThreadPoolExecutor(max_workers=max_workers) as ex:
                futures = [ex.submit(enrich_and_extract_batch, batch, resolved_text) for batch in batches]

                for fut in as_completed(futures):
                    try:
                        batch_entities, batch_rels = fut.result()
                    except Exception as exc:
                        logger.warning(f"Batch enrichment failed: {exc}")
                        continue

                    # Merge enriched entity info (overwrite/merge by name)
                    for be in batch_entities:
                        enriched_map[be.name] = be

                    relationships.extend(batch_rels)

        else:
            # No entities: fall back to single call
            enriched_entities, relationships = enrich_and_extract_batch(clean_entities, resolved_text)
            for be in enriched_entities:
                enriched_map[be.name] = be

        enrichment_end = time.time()
        timings['layer3_enrichment'] = enrichment_end - enrichment_start

        # Fast pass: generate candidate pairs and run cheap batched classifier
        try:
            cg_start = time.time()
            window_sentences = getattr(settings, 'KG_WINDOW', 1)
            candidates = generate_candidate_pairs(list(enriched_map.values()), resolved_text, self.nlp, window_sentences=window_sentences)
            cg_end = time.time()
            timings['candidate_generation'] = cg_end - cg_start

            if candidates:
                classify_start = time.time()
                fast_rels = batched_classify(candidates, batch_size=getattr(settings, 'KG_CLASSIFY_BATCH', 32))
                classify_end = time.time()
                timings['fast_classify'] = classify_end - classify_start
                relationships.extend(fast_rels)
        except Exception as e:
            logger.warning(f"Candidate-generation or fast classification failed: {e}")

        # Finalize enriched entities list and deduplicate relationships
        enriched_entities = list(enriched_map.values())
        try:
            relationships = _deduplicate_relationships(relationships)
        except Exception:
            # If dedupe helper not available for some reason, keep raw list
            pass

        if verbose:
            logger.info(f"Enriched {len(enriched_entities)} entities, found {len(relationships)} relationships")

        metadata = PipelineMetadata(
            num_entities=len(enriched_entities),
            num_relationships=len(relationships),
            num_raw_entities=num_raw_entities
        )
        # attach timings
        try:
            metadata.timings = timings
        except Exception:
            pass

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