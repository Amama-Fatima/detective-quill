import spacy
import modal
import sys
import traceback
import time

from src.utils.logger import setup_logger
from src.pipeline.layer5_graph import save_graph_layer5


from .modal_app import app, image, secrets

@app.cls(
    image=image,
    gpu="T4",
    secrets=secrets,
    scaledown_window=300,
    timeout=1800,
)
class KnowledgeGraphWorker:

    @modal.enter()
    def load_models(self):
    
        # Runs only once when container starts. Each job can then reuse these loaded models
        # src/ is already at /root/src/ via the image mount.
        
        sys.path.insert(0, "/root") 

        self.logger = setup_logger(__name__)
        self.logger.info("Container started - loading models...")

        self.logger.info("Loading spaCy model...")
        self.nlp = spacy.load("en_core_web_lg")
        self.nlp.add_pipe("coreferee")
        self.logger.info("spaCy loaded")

        self.logger.info("Loading OpenHermes LLM - this takes a few minutes...")
        from src.models.llm_loader import get_llm_loader
        self.llm_loader = get_llm_loader()
        self.logger.info("LLM loaded and ready")

        from src.pipeline.orchestrator import NarrativeAnalysisPipeline
        self.pipeline = NarrativeAnalysisPipeline(nlp=self.nlp)
        self.logger.info("Pipeline ready")

    @modal.method()
    def process_job(self, job_id: str, scene_text: str, user_id: str) -> dict:
        self.logger.info(f"Processing job {job_id}")
        self.logger.info(f"Scene length: {len(scene_text)} characters")
        start_time = time.time()

        try:
            result = self.pipeline.process_scene(scene_text=scene_text)
            self.logger.info(f"Pipeline complete — {len(result.entities)} entities, {len(result.relationships)} relationships")

            self.logger.info("Starting Layer 5: saving graph to Neo4j...")
            graph_result = save_graph_layer5(
                scene_id=job_id,
                user_id=user_id,
                scene_text=scene_text,
                resolved_text=result.resolved_text,
                entities=result.entities,
                relationships=result.relationships,
            )
            self.logger.info(f"Layer 5 complete: {graph_result}")

            elapsed = time.time() - start_time
            self.logger.info(f"Job {job_id} completed in {elapsed:.2f}s")

            return {
                "job_id": job_id,
                "status": "completed",
                "result": result.dict(),
                "error": None,
                "processing_time": f"{elapsed:.2f}s"
            }

        except Exception as e:
            elapsed = time.time() - start_time
            self.logger.error(f"Job {job_id} failed after {elapsed:.2f}s: {e}")
            self.logger.error(traceback.format_exc())  # full stack trace
            return {
                "job_id": job_id,
                "status": "failed",
                "result": None,
                "error": str(e),
                "processing_time": f"{elapsed:.2f}s"
            }
