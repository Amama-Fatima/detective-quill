import modal
import os
import sys

# ─────────────────────────────────────────────
# Merge chunk results (used by poll_queue; no GPU, no Modal)
# ─────────────────────────────────────────────


def merge_chunk_results_for_job(chunk_outputs: list[dict], wall_clock_seconds: float) -> dict:
    """
    Merge chunk results for a single original job_id.
    chunk_outputs must be sorted by chunk index (e.g. by job_id suffix _chunk_0, _chunk_1).
    Returns one result dict in the same shape as process_job (job_id, status, result, error, processing_time).
    """
    if not chunk_outputs:
        return {
            "job_id": "",
            "status": "failed",
            "result": None,
            "error": "No chunk results",
            "processing_time": f"{wall_clock_seconds:.2f}s",
        }

    base_job_id = chunk_outputs[0]["job_id"].rsplit("_chunk_", 1)[0]
    statuses = [o.get("status") for o in chunk_outputs]
    if all(s == "failed" for s in statuses):
        overall_status = "failed"
    elif any(s == "failed" for s in statuses):
        overall_status = "partial"
    else:
        overall_status = "completed"

    merged_entities: list[dict] = []
    seen_entities: dict[str, dict] = {}  # key: name lower

    merged_relationships: list[dict] = []
    seen_rels: set[tuple[str, str, str]] = set()  # (source_lower, relation_type, target_lower)

    resolved_parts: list[str] = []

    for out in chunk_outputs:
        res = out.get("result")
        if res:
            resolved_parts.append(res.get("resolved_text", ""))
            for e in res.get("entities") or []:
                name = e.get("name", "")
                key = name.lower()
                if key not in seen_entities:
                    seen_entities[key] = dict(e)
                    merged_entities.append(seen_entities[key])
                else:
                    existing = seen_entities[key]
                    desc_new = (e.get("attributes") or {}).get("description") or ""
                    desc_old = (existing.get("attributes") or {}).get("description") or ""
                    if len(desc_new) > len(desc_old):
                        existing.setdefault("attributes", {})["description"] = desc_new
                    for k, v in (e.get("attributes") or {}).items():
                        if v and (existing.get("attributes") or {}).get(k) != v:
                            existing.setdefault("attributes", {})[k] = v
                    existing.setdefault("mentions", []).extend(e.get("mentions") or [])
            for r in res.get("relationships") or []:
                src, rt, tgt = r.get("source", ""), r.get("relation_type", ""), r.get("target", "")
                key = (src.lower(), rt, tgt.lower())
                if key not in seen_rels:
                    seen_rels.add(key)
                    merged_relationships.append(r)

    resolved_text = " ".join(resolved_parts).strip()

    merged_result = {
        "entities": merged_entities,
        "relationships": merged_relationships,
        "metadata": {
            "num_entities": len(merged_entities),
            "num_relationships": len(merged_relationships),
            "num_raw_entities": sum(
                (o.get("result") or {}).get("metadata", {}).get("num_raw_entities", 0)
                for o in chunk_outputs
            ),
        },
        "resolved_text": resolved_text,
    }

    errors = [o.get("error") for o in chunk_outputs if o.get("error")]
    return {
        "job_id": base_job_id,
        "status": overall_status,
        "result": merged_result,
        "error": "; ".join(errors) if errors else None,
        "processing_time": f"{wall_clock_seconds:.2f}s",
    }


# ─────────────────────────────────────────────
# Modal App Definition
# ─────────────────────────────────────────────

app = modal.App("detective-quill-knowledge-graph")

# ─────────────────────────────────────────────
# Container Image
# ─────────────────────────────────────────────

image = (
    modal.Image.debian_slim(python_version="3.10")
    .pip_install(["numpy<2.0"])
    .pip_install([
        "torch==2.6.0",
        "transformers==4.46.3",
        "accelerate>=0.26.0",
        "bitsandbytes>=0.43.0",
        "scipy",
        "sentencepiece",
        "pika==1.3.2",
        "spacy==3.5.4",
        "pydantic==1.10.13",
        "supabase==1.2.0",
        "neo4j==5.14.0",
        "fastcoref==2.1.6",
    ])
    .pip_install([
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_lg-3.5.0/en_core_web_lg-3.5.0-py3-none-any.whl",
        "https://github.com/explosion/spacy-models/releases/download/"
        "en_core_web_sm-3.5.0/en_core_web_sm-3.5.0-py3-none-any.whl",
    ])
    .add_local_dir("src", remote_path="/root/src")
)

# ─────────────────────────────────────────────
# Modal Secrets
# ─────────────────────────────────────────────

secrets = [
    modal.Secret.from_name("detective-quill-secrets"),
    modal.Secret.from_name("neo4j-secret")
]

# ─────────────────────────────────────────────
# The Worker Class
# ─────────────────────────────────────────────

@app.cls(
    image=image,
    gpu="T4",
    secrets=secrets,
    scaledown_window=300,
    timeout=1800,
    max_containers=10,
)
class KnowledgeGraphWorker:

    @modal.enter()
    def load_models(self):
        """
        Runs ONCE when container starts.
        src/ is already at /root/src/ via the image mount.
        """
        import sys
        sys.path.insert(0, "/root")  # makes 'from src.xxx import yyy' work

        from src.utils.logger import setup_logger
        self.logger = setup_logger(__name__)
        self.logger.info("Container started - loading models...")

        import spacy
        from fastcoref import FCoref

        self.logger.info("Loading spaCy model...")
        self.nlp = spacy.load("en_core_web_lg")
        self.logger.info("spaCy loaded")

        self.logger.info("Loading fastcoref model for coreference resolution...")
        self.coref_model = FCoref(device="cuda:0")
        self.logger.info("fastcoref loaded")

        self.logger.info("Loading OpenHermes LLM - this takes a few minutes...")
        from src.models.llm_loader import get_llm_loader
        self.llm_loader = get_llm_loader()
        self.logger.info("LLM loaded and ready")

        from src.pipeline.orchestrator import NarrativeAnalysisPipeline
        self.pipeline = NarrativeAnalysisPipeline(
            nlp=self.nlp,
            coref_model=self.coref_model,
        )
        self.logger.info("Pipeline ready")

    @modal.method()
    def process_job(self, job_id: str, scene_text: str, user_id: str) -> dict:
        """Layers 1–4 only. Layer 5 (Neo4j) is called once per file via save_graph after merging chunks."""
        import time
        from datetime import datetime
        start_time = time.time()
        scene_word_count = len(scene_text.split()) if scene_text else 0
        job_start_ts = datetime.utcnow().isoformat() + "Z"
        self.logger.info(f"process_job start: job_id={job_id}, scene_text word_count={scene_word_count}, timestamp={job_start_ts}")

        try:
            result = self.pipeline.process_scene(scene_text=scene_text)
            elapsed = time.time() - start_time
            num_entities = len(result.entities)
            num_relationships = len(result.relationships)
            self.logger.info(
                f"process_job pipeline.process_scene completed: elapsed_seconds={elapsed:.2f}, "
                f"entities={num_entities}, relationships={num_relationships}"
            )
            self.logger.info(f"process_job end: job_id={job_id}, status=completed, total_elapsed_seconds={elapsed:.2f}")
            return {
                "job_id": job_id,
                "status": "completed",
                "result": result.dict(),
                "error": None,
                "processing_time": f"{elapsed:.2f}s"
            }
        except Exception as e:
            import traceback
            elapsed = time.time() - start_time
            self.logger.error(f"Job {job_id} failed after {elapsed:.2f}s: {e}")
            self.logger.error(traceback.format_exc())
            self.logger.info(f"process_job end: job_id={job_id}, status=failed, total_elapsed_seconds={elapsed:.2f}")
            return {
                "job_id": job_id,
                "status": "failed",
                "result": None,
                "error": str(e),
                "processing_time": f"{elapsed:.2f}s"
            }

    @modal.method()
    def save_graph(
        self,
        scene_id: str,
        user_id: str,
        scene_text: str,
        resolved_text: str,
        entities: list,
        relationships: list,
    ) -> dict:
        """Layer 5 only: persist merged graph to Neo4j. Called once per file after merging chunks."""
        import time
        from src.models.schemas import Entity, Relationship
        from src.pipeline.layer5_graph import save_graph_layer5

        start_time = time.time()
        num_entities = len(entities)
        num_relationships = len(relationships)
        self.logger.info(
            f"save_graph start: scene_id={scene_id}, entities_count={num_entities}, relationships_count={num_relationships}"
        )
        entity_objs = [Entity(**e) if isinstance(e, dict) else e for e in entities]
        rel_objs = [Relationship(**r) if isinstance(r, dict) else r for r in relationships]
        graph_result = save_graph_layer5(
            scene_id=scene_id,
            user_id=user_id,
            scene_text=scene_text,
            resolved_text=resolved_text,
            entities=entity_objs,
            relationships=rel_objs,
        )
        elapsed = time.time() - start_time
        self.logger.info(f"save_graph end: scene_id={scene_id}, result={graph_result}, elapsed_seconds={elapsed:.2f}")
        return graph_result
# ─────────────────────────────────────────────
# Scheduled Queue Poller
# ─────────────────────────────────────────────

@app.function(
    image=image,
    secrets=secrets,
    schedule=modal.Period(seconds=60),
    timeout=1800,
)
def poll_queue():
    import json
    import os
    import sys
    import time
    from datetime import datetime
    import pika
    from modal import FunctionCall

    sys.path.insert(0, "/root")
    from src.utils.chunking import chunk_text
    from src.utils.logger import setup_logger

    logger = setup_logger(__name__)
    poll_start = datetime.utcnow().isoformat() + "Z"
    logger.info(f"poll_queue started at {poll_start}; attempting to fetch up to 6 messages")

    rabbitmq_url = os.environ["CLOUDAMQP_URL"]
    params = pika.URLParameters(rabbitmq_url)
    params.heartbeat = 60
    params.blocked_connection_timeout = 30

    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue="scene_analysis_queue", durable=True)
    channel.queue_declare(queue="scene_analysis_results_queue", durable=True)

    all_handles = []
    all_meta = []  # (job_id, user_id, scene_text) per handle
    worker = KnowledgeGraphWorker()

    for _ in range(6):
        method_frame, _, body = channel.basic_get(queue="scene_analysis_queue", auto_ack=False)
        if method_frame is None:
            break
        try:
            raw_message = json.loads(body.decode("utf-8"))
            if "pattern" in raw_message and "data" in raw_message:
                message = raw_message["data"]
            else:
                message = raw_message
            job_id = message["job_id"]
            scene_text = message["scene_text"]
            user_id = message.get("user_id", "")
            scene_word_count = len(scene_text.split()) if scene_text else 0
            logger.info(f"Picked up message: job_id={job_id}, user_id={user_id}, scene_text word_count={scene_word_count}")
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Invalid message format: {e}")
            channel.basic_nack(delivery_tag=method_frame.delivery_tag, requeue=False)
            connection.close()
            return

        channel.basic_ack(delivery_tag=method_frame.delivery_tag)
        chunks = chunk_text(scene_text)  # single chunk if ≤600 words; else 300-word chunks with sentence overlap
        num_chunks = len(chunks)
        logger.info(f"Message job_id={job_id} split into {num_chunks} chunk(s)")
        for idx, chunk_text_str in enumerate(chunks):
            chunk_id = f"{job_id}_chunk_{idx}"
            chunk_word_count = len(chunk_text_str.split()) if chunk_text_str else 0
            logger.info(f"Spawning chunk: chunk_id={chunk_id}, word_count={chunk_word_count}")
            handle = worker.process_job.spawn(
                job_id=chunk_id,
                scene_text=chunk_text_str,
                user_id=user_id,
            )
            all_handles.append(handle)
            all_meta.append((job_id, user_id, scene_text))

    connection.close()

    if not all_handles:
        logger.info("Queue is empty. Nothing to process.")
        return

    total_handles = len(all_handles)
    logger.info(f"All spawns complete: total_handles={total_handles} across all jobs")
    logger.info(f"Waiting for FunctionCall.gather on {total_handles} handles...")
    start_wall = time.time()
    results = FunctionCall.gather(*all_handles)
    wall_clock_seconds = time.time() - start_wall
    num_results = len(results)
    logger.info(f"FunctionCall.gather completed: wall_clock_seconds={wall_clock_seconds:.2f}, results_count={num_results}")

    for res, (jid, _, _) in zip(results, all_meta):
        if res.get("status") == "failed":
            chunk_id = res.get("job_id", "?")
            err = res.get("error", "unknown")
            logger.error(f"Chunk failed: chunk_id={chunk_id}, error={err}")

    by_job = {}
    for res, (jid, uid, stext) in zip(results, all_meta):
        by_job.setdefault(jid, {"user_id": uid, "scene_text": stext, "outputs": []})["outputs"].append(res)

    merged_outputs = []
    worker = KnowledgeGraphWorker()
    for job_id, data in by_job.items():
        user_id, scene_text, outputs = data["user_id"], data["scene_text"], data["outputs"]
        outputs_sorted = sorted(outputs, key=lambda o: int(o["job_id"].rsplit("_chunk_", 1)[-1]))
        merged = merge_chunk_results_for_job(outputs_sorted, wall_clock_seconds)
        num_entities = len(merged["result"]["entities"]) if merged.get("result") else 0
        num_relationships = len(merged["result"]["relationships"]) if merged.get("result") else 0
        save_graph_called = bool(merged.get("result") and merged.get("status") != "failed")
        logger.info(
            f"Merged job result: job_id={job_id}, status={merged.get('status')}, "
            f"entities={num_entities}, relationships={num_relationships}, save_graph_called={save_graph_called}"
        )
        if merged.get("result") and merged.get("status") != "failed":
            worker.save_graph.remote(
                scene_id=job_id,
                user_id=user_id,
                scene_text=scene_text,
                resolved_text=merged["result"]["resolved_text"],
                entities=merged["result"]["entities"],
                relationships=merged["result"]["relationships"],
            )
        merged_outputs.append((job_id, merged))

    logger.info("Reconnecting to CloudAMQP to publish results...")
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue="scene_analysis_results_queue", durable=True)
    for job_id, output in merged_outputs:
        channel.basic_publish(
            exchange="",
            routing_key="scene_analysis_results_queue",
            body=json.dumps(output),
            properties=pika.BasicProperties(delivery_mode=2, content_type="application/json"),
        )
        logger.info(f"Published result for job {job_id} to results queue (status: {output['status']})")
    connection.close()
    logger.info(f"Done. {len(merged_outputs)} job(s) processed.")        