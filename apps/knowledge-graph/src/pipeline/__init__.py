__all__ = [
    "extract_entities_layer1",
    "postprocess_entities_layer2",
    "enrich_and_extract_batch",
    "NarrativeAnalysisPipeline",
    "process_scene",
]


def __getattr__(name):
    if name == "extract_entities_layer1":
        from src.pipeline.layer1_spacy import extract_entities_layer1

        return extract_entities_layer1
    if name == "postprocess_entities_layer2":
        from src.pipeline.layer2_postprocess import postprocess_entities_layer2

        return postprocess_entities_layer2
    if name == "enrich_and_extract_batch":
        from src.pipeline.layer3_enrichment import enrich_and_extract_batch

        return enrich_and_extract_batch
    if name in {"NarrativeAnalysisPipeline", "process_scene"}:
        from src.pipeline.orchestrator import NarrativeAnalysisPipeline, process_scene

        return {
            "NarrativeAnalysisPipeline": NarrativeAnalysisPipeline,
            "process_scene": process_scene,
        }[name]

    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
