# Knowledge Graph Creation Pipeline — Extensive Report

This document provides an exhaustive description of the Detective Quill knowledge-graph pipeline: how narrative text becomes a persisted knowledge graph, each layer in detail, the activity diagram, parallelization strategy, and every relevant implementation detail.

---

## 1. Executive Overview

The pipeline transforms **scene text** (e.g. a story chapter or file content from a commit snapshot) into a **knowledge graph** stored in **Neo4j**, with a copy of the analysis (entities and relationships) also stored in **Supabase** for job tracking and API access. The flow is:

1. **Backend** enqueues a job (job_id, scene_text, user_id) to **RabbitMQ** when a commit is created.
2. A **scheduled Modal function** polls the queue, chunks the scene text, and runs **Layers 1–4** in parallel per chunk on GPU workers.
3. Chunk results are **merged** (entities by name, relationships by (source, type, target)).
4. **Layer 5** runs once per original job, writing the merged graph to Neo4j.
5. The merged result is published to a **results queue**; the **backend consumer** receives it and persists entities/relationships to Supabase and updates the job status.

The pipeline is implemented in **five conceptual layers**, with Layers 1–4 running **per chunk** and Layer 5 running **once per job** after merging.

| Layer | Name | Purpose |
|-------|------|--------|
| **1** | spaCy + fastcoref | Entity extraction and pronoun/coreference resolution |
| **2** | Post-processing | Filter entity types, merge duplicates, resolve type hints |
| **3** | LLM enrichment | Add description, role, and optional attributes per entity |
| **4** | LLM relationships | Extract evidence-based relationships between entity pairs |
| **5** | Neo4j persistence | Write Scene, entity nodes, and relationship edges to the graph |

---

## 2. The Activity Diagram (NLP Job to Knowledge Graph)

The diagram `docs/activity-diagram-nlp-to-knowledge-graph.drawio` describes the end-to-end flow across four **swimlanes**: Backend, RabbitMQ, Python pipeline, and Database.

### 2.1 Swimlanes and Responsibilities

- **Backend (blue)**  
  - **Start** → **Commit module: enqueue KG jobs** (after commit created): get file snapshots, insert `nlp_analysis_jobs` with status QUEUED, insert `commit_knowledge_graphs`, call `sendSceneAnalysisJob()`.  
  - **QueueService: sendSceneAnalysisJob**: connect to RabbitMQ, publish to `scene_analysis_queue` with payload `(job_id, scene_text, user_id)`.  
  - **NLP Consumer: receive result** from `scene_analysis_results_queue`.  
  - **saveAnalysisResult**: update `nlp_analysis_jobs` to COMPLETED, insert `nlp_entities` and `nlp_relationships`.  
  - **channel.ack(message)** → **End**.

- **RabbitMQ (grey)**  
  - **scene_analysis_queue**: stores the job message until consumed.  
  - **scene_analysis_results_queue**: stores the result message until consumed by the backend.

- **Python pipeline (green)**  
  - **Consume** from `scene_analysis_queue` (poll_queue / RabbitMQ worker).  
  - **basic_ack** on the input message (so the message is removed from the queue before heavy processing).  
  - **process_scene (Narrative pipeline)**: Layer 1 (spaCy + coreference), Layer 2 (post-process entities), Layer 3 (LLM enrichment), Layer 4 (LLM relationships).  
  - **Layer 5: save_graph_layer5**: write entities and relationships to Neo4j.  
  - **Publish** result to `scene_analysis_results_queue` (job_id, status, result).

- **Database (red)**  
  - **Supabase: nlp_analysis_jobs** (insert QUEUED, later updated to COMPLETED).  
  - **Supabase: commit_knowledge_graphs** (links commit ↔ job).  
  - **Neo4j**: knowledge graph (Scene, Entity nodes, Relationship edges).  
  - **Supabase**: nlp_analysis_jobs update, nlp_entities, nlp_relationships insert (when backend consumes the result).

### 2.2 Cross-Lane Flow in the Diagram

- **Backend → RabbitMQ**: dashed edge “publish” from QueueService to `scene_analysis_queue`.  
- **RabbitMQ → Python**: consume from `scene_analysis_queue` to “Consume” in the Python lane.  
- **Python internal**: vertical flow from Consume → ack → process_scene → Layer 5 → Publish.  
- **Python → RabbitMQ**: Publish to `scene_analysis_results_queue`.  
- **RabbitMQ → Backend**: result flows to “NLP Consumer: receive result”.  
- **Database edges (dashed grey)**:  
  - Commit-enqueue → Supabase (nlp_analysis_jobs, commit_knowledge_graphs).  
  - Layer 5 → Neo4j.  
  - Consumer save → Supabase (job update, nlp_entities, nlp_relationships).

The diagram does not show chunking and parallelization; that is described below in the parallelization section.

---

## 3. Parallelization: Chunking, Spawn, Gather, Merge, and Single Layer 5

### 3.1 Why Chunking

The only scenario where chunking is used is when scene text can grow significantly beyond a few hundred words. Short scenes are processed as a **single chunk** to avoid merge overhead and context loss. When the text is long, the pipeline splits it into fixed-size chunks (with sentence overlap at boundaries), runs **Layers 1–4** on each chunk in parallel, then **merges** results and runs **Layer 5 once** for the whole job.

### 3.2 Chunking Algorithm (`src/utils/chunking.py`)

- **Single-chunk threshold**: If the scene has **≤600 words**, it is **not split** — the function returns `[text]` so the whole scene is processed as one chunk.  
- **When splitting** (word count &gt; 600):  
  - **Chunk size**: ~**300 words** per chunk, broken at sentence boundaries.  
  - **Sentence overlap**: The last **2 sentences** of each chunk are repeated at the start of the next chunk so entity and relationship context is preserved at boundaries.  
- **Input parameters**: `single_chunk_max_words=600`, `words_per_chunk=300`, `overlap_sentences=2`.  
- **Sentence splitting**: regex `(?<=[.!?])\s+|\n+` splits on sentence-ending punctuation followed by whitespace, or newlines.  
- **Output**: list of chunk strings. Empty or whitespace-only input yields `[""]`.

So: process as a single chunk if ≤600 words; otherwise split with 300-word chunks and sentence overlap.

### 3.3 Poller and Spawn (Modal `poll_queue`)

- **Schedule**: `poll_queue` runs every **60 seconds** (`modal.Period(seconds=60)`).  
- **Consume**: up to **6 messages** from `scene_analysis_queue` via `channel.basic_get(..., auto_ack=False)`.  
- **Per message**:  
  - Parse JSON; support both raw payload and NestJS-style `{ pattern, data }`.  
  - Extract `job_id`, `scene_text`, `user_id`.  
  - **Ack the message** immediately after parsing (so it is not redelivered if processing fails later).  
  - Call `chunk_text(scene_text)` → list of chunk strings (single chunk if ≤600 words; else 300-word chunks with 2-sentence overlap).  
  - For each chunk index `idx`, form `chunk_id = f"{job_id}_chunk_{idx}"` and call  
    `worker.process_job.spawn(job_id=chunk_id, scene_text=chunk_text_str, user_id=user_id)`.  
  - Collect all **handles** and a parallel list of **metadata** `(job_id, user_id, scene_text)` for later merge and Layer 5.

So **all chunks across all 6 messages** are processed in parallel: each `process_job` runs Layers 1–4 on one chunk inside a GPU-enabled Modal container.

### 3.4 Gather and Merge

- **FunctionCall.gather(*all_handles)** blocks until every spawned `process_job` has returned. Wall-clock time is recorded.  
- Results are grouped **by original job_id** (strip `_chunk_0`, etc.). For each job, chunk outputs are **sorted by chunk index** (e.g. by the number after `_chunk_`).  
- **merge_chunk_results_for_job(chunk_outputs_sorted, wall_clock_seconds)** produces a single result per job:
  - **Status**: if all chunks failed → `failed`; if any failed → `partial`; else `completed`.  
  - **Entities**: merged by **name (lowercase)**. First occurrence defines the entity; later chunks can add/merge mentions and attributes (e.g. keep the longer `description` when merging duplicates).  
  - **Relationships**: deduplicated by `(source.lower(), relation_type, target.lower)`; first occurrence kept.  
  - **resolved_text**: concatenation of each chunk’s `resolved_text` in chunk order.  
  - **metadata**: e.g. total entity/relationship counts and sum of `num_raw_entities` from chunks.  
- Return shape: `job_id`, `status`, `result` (entities, relationships, metadata, resolved_text), `error`, `processing_time`.

### 3.5 Single Layer 5 and Results Publish

- For each job whose merged status is not `failed`, the poller calls  
  `worker.save_graph.remote(scene_id=job_id, user_id=..., scene_text=..., resolved_text=..., entities=..., relationships=...)`.  
  So **Layer 5 runs once per original job**, not per chunk.  
- Then the merged result (for every job) is **published** to `scene_analysis_results_queue` as JSON.  
- The **backend consumer** (`ManualRabbitMQConsumer`) reads from that queue and calls `saveAnalysisResult` or `markJobAsFailed`, which updates Supabase (`nlp_analysis_jobs`, `nlp_entities`, `nlp_relationships`).

### 3.6 Summary of Parallelization

| Step | What runs | Where |
|------|-----------|--------|
| Chunking | Single chunk if ≤600 words; else ~300-word chunks with sentence overlap | Poller (Modal, no GPU) |
| Layers 1–4 | One `process_job` per chunk | Modal GPU workers (parallel via spawn) |
| Gather | Wait for all chunk jobs | Poller |
| Merge | Combine entities/relationships per job | Poller |
| Layer 5 | One `save_graph` per job | Modal (remote call) |
| Publish | One result message per job to results queue | Poller |
| Backend | Consume result, write to Supabase | NestJS consumer |

---

## 4. Layer 1 — spaCy Entity Extraction and Coreference (fastcoref)

**Module**: `src/pipeline/layer1_spacy.py`  
**Entry**: `extract_entities_layer1(scene_text, nlp=..., coref_model=...)`  
**Outputs**: `Tuple[List[Entity], str]` — list of entities and **resolved_text** (pronouns replaced by referents where applicable).

### 4.1 Components

- **spaCy model**: `en_core_web_lg` (configurable via `settings.SPACY_MODEL`). Loaded in the worker’s `@modal.enter()` or passed in for tests.  
- **fastcoref**: `FCoref(device="cuda:0")` in production. Used to resolve pronouns and short mentions to a canonical mention (e.g. “he” → “Marcus Chen”).  
- **SpacyEntityExtractor**: holds `nlp` and optional `coref_model`; implements `resolve_and_extract` and `convert_to_entities`.

### 4.2 Step-by-Step (resolve_and_extract)

1. **Run spaCy on raw text**  
   `doc = self.nlp(text)`  
   Produces tokens and NER spans (`doc.ents`). No coreference is done by spaCy here.

2. **Coreference resolution (if coref_model is present)**  
   - `_resolve_coreferences_fastcoref(text, coref_model)` is called with the **raw string**.  
   - fastcoref returns clusters of mention spans (character offsets).  
   - For each cluster with at least two mentions:  
     - **Canonical mention**: first span in the cluster; its text is normalized with `_extract_proper_name` (e.g. “The victim, Robert Sullivan” → “Robert Sullivan”; strip leading “the/a/an”).  
     - **Replacements**: for every other span in the cluster, if the mention text is not possessive (“his”, “her”, “their”, etc.), and has ≤3 words and differs from the canonical text, record `(start, end, canonical_text)`.  
   - **Possessives** are intentionally **not** replaced to avoid ungrammatical text.  
   - Replacements are applied **right-to-left** by character offset so earlier indices remain valid.  
   - If any replacement was made, the result is `resolved_text`; otherwise original `text` is used.

3. **Re-run NER if text changed**  
   If `resolved_text != text`, spaCy is run again on `resolved_text`:  
   `doc = self.nlp(resolved_text)`.  
   So **entities are extracted from the coreference-resolved text** when resolution changed something.

4. **Extract raw entities**  
   For each `doc.ents` span: append `RawEntity(text=ent.text, label=ent.label_, start=ent.start_char, end=ent.end_char)`.

5. **Convert to Entity objects**  
   In `convert_to_entities`: group raw entities by `(text, label)`. For each group, one `Entity` is created with:  
   - `name`: span text  
   - `type`: NER label (e.g. PERSON, GPE, ORG)  
   - `mentions`: list of distinct mention strings in that group  
   - `attributes`: `{}` (filled in Layer 3)

So **Layer 1 = optional fastcoref resolution → (if changed) re-run spaCy NER on resolved text → raw spans → group by (text, label) → Entity list + resolved_text.**

### 4.3 Helper: _extract_proper_name

Used to get a clean name from a verbose canonical mention: split on comma and take the last segment if it starts with an uppercase letter; otherwise strip leading “the/a/an” and return the trimmed string.

---

## 5. Layer 2 — Entity Post-Processing

**Module**: `src/pipeline/layer2_postprocess.py`  
**Entry**: `postprocess_entities_layer2(entities)`  
**Input**: List of `Entity` from Layer 1.  
**Output**: Filtered, merged, and type-annotated list of `Entity`.

### 5.1 EntityPostProcessor

- **keep_types**: PERSON, ORG, GPE, LOC, FAC, PRODUCT, EVENT, WORK_OF_ART, LAW.  
- **skip_types**: TIME, DATE, CARDINAL, ORDINAL, QUANTITY, PERCENT, MONEY.  
  Any other type is kept (no explicit skip).

### 5.2 Filter by type (filter_entity_types)

Entities whose `type` is not in `keep_types` are removed. This drops numeric and temporal entities that are usually not useful as graph nodes.

### 5.3 Merge duplicates (merge_duplicate_entities)

- Sort entities by **name length descending** (longest first) so “Marcus Chen” is considered before “Marcus”.  
- For each entity, check all others with `is_substring_match(other, entity)`:  
  - Same type required.  
  - Normalize names to lowercase; match if the short name is a word in the long name or equal (e.g. “Marcus” in “Marcus Chen”, “Sullivan” in “Robert Sullivan”).  
- When several entities match the same primary (longest), merge into one: combine and deduplicate **mentions**; keep the primary’s name and type; drop the others.

### 5.4 Type handling (resolve_type_conflicts)

- For `type == 'GPE'` and name of at most two words, set `entity.attributes['uncertain_type'] = True`.  
- A `type_priority` dict exists but is not used to reassign types; it could be used in the future for conflict resolution.

Order of operations in `process()`: filter → merge → resolve_type_conflicts. The result is a cleaner, deduplicated entity list for Layer 3.

---

## 6. Layer 3 — LLM Entity Enrichment

**Module**: `src/pipeline/layer3_enrichment.py`  
**Entry**: `enrich_entities_layer3(entities, scene_text)`  
**Input**: Clean entities from Layer 2 and the **resolved_text** (from Layer 1).  
**Output**: Same entities with `attributes` populated (description, role, and any extra keys).

### 6.1 LLM Loader

- **Singleton**: `get_llm_loader()` returns `LLMModelLoader()`.  
- **Model**: `settings.MODEL_NAME` (default `teknium/OpenHermes-2.5-Mistral-7B`).  
- **Device**: CUDA if available; 4-bit quantization (BitsAndBytesConfig, nf4) on GPU; otherwise fp32 on CPU.  
- **Prompt format**: OpenHermes-style `<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`. System instructs: expert literary analyst, JSON only, no markdown.

### 6.2 Enrichment Strategy: Pairs

Enrichment is done in **pairs** of entities per LLM call to reduce API cost and latency:

- `enrich_entities(entities, scene_text)` iterates `i = 0, 2, 4, ...` and passes `entities[i:i+2]` to `enrich_entity_pair(batch, scene_text)`.  
- So 1 or 2 entities are enriched per call; the prompt asks for a JSON **array** with exactly that many objects.

### 6.3 Prompt (enrich_entity_pair)

- **Scene**: the (resolved) scene text.  
- **Entities**: numbered list “1. \"name\" (type: TYPE)”, etc.  
- **Instructions**: for each entity, write what the scene says about them; be descriptive; do not return null for description unless the entity is not mentioned.  
- **Output**: only a JSON array of objects in the same order, each with `name`, `description`, `role` (detective|suspect|victim|witness|object|location|other), and `attributes` (only if the scene explicitly states them).  
- **max_tokens**: 300.

### 6.4 Response Parsing

- Strip markdown code fences (` ```json `, ` ``` `).  
- Extract JSON array with regex `\[.*\]` (DOTALL).  
- If the result is a single dict, wrap in a list.  
- For each entity in the batch, if there is a corresponding dict in the response:  
  - `entity.attributes['description']` = `data.get('description', '')`  
  - `entity.attributes['role']` = `data.get('role', '')`  
  - `entity.attributes.update(data.get('attributes', {}))`  
- On parse error, log and return entities unchanged (no crash).

After Layer 3, each entity has at least **description** and **role** (and possibly more attributes) for relationship extraction and Neo4j.

---

## 7. Layer 4 — LLM Relationship Extraction

**Module**: `src/pipeline/layer4_relationships.py`  
**Entry**: `extract_relationships_layer4(entities, scene_text, nlp)`  
**Input**: Enriched entities, **resolved_text**, and spaCy `nlp` (for sentence tokenization).  
**Output**: List of `Relationship` (source, target, relation_type, description, confidence).

### 7.1 Sentence Co-occurrence

- **`_build_sentence_token_sets(scene_text, nlp)`**: run spaCy, get `doc.sents`; for each sentence, build a set of token strings (lowercased, non-space).  
- **`_entities_co_occur(entity_a, entity_b, sentence_sets)`**: tokenize each entity name into words (lowercase). Return True iff at least one sentence’s token set contains tokens from **both** entity names.  
So relationships are only considered for pairs that **co-occur in the same sentence**.

### 7.2 Pair Filters

All unordered pairs `(entity_a, entity_b)` with `i < j` are iterated. A pair is **skipped** if:

- **Same-type skip**: both have type in `SAME_TYPE_SKIP` (FAC, LOC, GPE, NORP) — avoids many location–location pairs.  
- **Meaningful types**: neither type is in `MEANINGFUL_TYPES` (PERSON, ORG, GPE).  
- **Skip as actor**: both types are in `SKIP_AS_ACTOR` (NORP, FAC, LOC, DATE, TIME, MONEY, QUANTITY, CARDINAL, ORDINAL).  
- **No co-occurrence**: `_entities_co_occur(...)` is False (log and skip).

### 7.3 Pairwise LLM Call (extract_pairwise_relationship)

- **Context strings**: e.g. `"Marcus Chen (PERSON, detective)"` using name, type, and optional role from attributes.  
- **Prompt**: scene text + “A: …” and “B: …”. Ask whether the scene **explicitly** shows a relationship; use direct quote or clear paraphrase; do not infer; if uncertain, output null.  
- **Expected output**: either  
  `{"source":"<name>","target":"<name>","type":"<verb>","evidence":"<exact quote>"}`  
  or `null`.  
- **max_tokens**: 60.

### 7.4 Validation and Relationship Creation

- If response is `null` or empty → return `[]`.  
- Parse JSON (strip fences, extract `{...}`).  
- Check that `source` and `target` (case-insensitive) are the two entity names and differ.  
- Create one `Relationship` with `source`, `target`, `relation_type` from `type`, `description` from `evidence`, `confidence=0.9`.  
- On parse error, return `[]`.

So **Layer 4 = sentence co-occurrence filter + type filters + one LLM call per candidate pair → evidence-based relationships only.**

---

## 8. Layer 5 — Saving to Neo4j

**Module**: `src/pipeline/layer5_graph.py`  
**Entry**: `save_graph_layer5(scene_id, user_id, scene_text, resolved_text, entities, relationships)`  
**When**: Called **once per original job** from the Modal poller after merging chunk results, via `KnowledgeGraphWorker.save_graph`.

### 8.1 Connection

- Neo4j driver from env: `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`.  
- One session; all writes in `session.execute_write` transactions.

### 8.2 Scene Node

- `MERGE (s:Scene {scene_id: $scene_id})`  
- `SET s.user_id, s.scene_text, s.resolved_text`

### 8.3 Entity Nodes and APPEARS_IN

- **Label**: from `TYPE_LABEL_MAP` (e.g. PERSON → Character, GPE/LOC/FAC → Location, ORG → Organisation, WORK_OF_ART → Artefact, EVENT → Event, NORP → Group); default `"Entity"`.  
- `MERGE (e:Label {name: $name})` so the same name yields one node across scenes.  
- `SET e.type, e.description, e.role` from entity and `entity.attributes`.  
- `MATCH (s:Scene {scene_id: $scene_id})` then `MERGE (e)-[r:APPEARS_IN]->(s) SET r.mentions = $mentions`.

### 8.4 Relationship Edges

- **Relation type**: `_to_rel_type(relation_type)` — strip non-alphanumerics, uppercase, join with underscores (e.g. “last seen by” → `LAST_SEEN_BY`).  
- `MATCH (a {name: $source}), (b {name: $target})`  
- `MERGE (a)-[r:REL_TYPE]->(b) SET r.description, r.confidence, r.scene_id`

So the graph has one Scene per job, shared entity nodes by name, and directed edges with type, description, confidence, and scene_id.

### 8.5 Read Path (get_scene_graph)

- Used by the backend to serve the graph to the frontend.  
- Matches `(e)-[r:APPEARS_IN]->(s:Scene {scene_id})` and optional `(e)-[rel]->(e2)` where `e2` also appears in the same scene and `rel` is not APPEARS_IN.  
- Returns nodes (id, label, role) and edges (source, target, type, description, confidence).

---

## 9. Chunk Merge Logic (merge_chunk_results_for_job)

**Location**: `modal_worker.py`, top-level function (no GPU, no Modal image dependency).

- **Input**: `chunk_outputs` (list of per-chunk result dicts), **sorted by chunk index**; `wall_clock_seconds`.  
- **Base job_id**: from first chunk’s `job_id` by stripping `_chunk_*`.  
- **Status**: all failed → failed; any failed → partial; else completed.  
- **Entities**: keyed by `name.lower()`. First occurrence is kept; for duplicates: longer `description` wins; mentions and other attributes are merged (e.g. extend mentions, add non-empty attribute values).  
- **Relationships**: set of `(source.lower(), relation_type, target.lower)`; first occurrence kept.  
- **resolved_text**: `" ".join(resolved_text per chunk)`.  
- **metadata**: num_entities, num_relationships, sum of num_raw_entities from chunks.  
- **Return**: `{ job_id, status, result, error, processing_time }` in the shape expected by `save_graph` and the results queue.

---

## 10. Data Schemas and Configuration

### 10.1 Schemas (`src/models/schemas.py`)

- **Entity**: name, type, mentions (list), attributes (dict).  
- **Relationship**: source, target, relation_type, description, confidence (default 0.9).  
- **PipelineMetadata**: num_entities, num_relationships, num_raw_entities.  
- **PipelineResult**: entities, relationships, metadata, resolved_text.  
- **RawEntity**: text, label, start, end (character offsets).  
- **SceneAnalysisRequest**: job_id, scene_text, user_id (optional).  
- **SceneAnalysisResponse**: job_id, status (pending|processing|completed|failed), result, error_message.

### 10.2 Config (`src/config.py`)

- **Queues**: SCENE_ANALYSIS_QUEUE, SCENE_ANALYSIS_RESULTS_QUEUE, RABBITMQ_* (host, port, user, password, vhost, prefetch).  
- **Model**: MODEL_NAME, MODEL_DEVICE, MODEL_MAX_LENGTH, MODEL_TEMPERATURE.  
- **spaCy**: SPACY_MODEL (default en_core_web_lg).  
- **Neo4j**: NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD (optional at config load).  
- **Logging**: LOG_LEVEL, API_* for local server.

---

## 11. Modal Worker and Image

### 11.1 App and Image

- **App name**: `detective-quill-knowledge-graph`.  
- **Image**: Debian slim, Python 3.10; pip installs: numpy<2.0, torch 2.6.0, transformers 4.46.3, accelerate, bitsandbytes, scipy, sentencepiece, pika, spacy 3.5.4, pydantic 1.10.13, supabase, neo4j 5.14.0, fastcoref 2.1.6; spaCy models en_core_web_lg and en_core_web_sm from GitHub releases; `add_local_dir("src", remote_path="/root/src")`.

### 11.2 KnowledgeGraphWorker Class

- **Decorator**: `@app.cls(image=..., gpu="T4", secrets=[...], scaledown_window=300, timeout=1800, max_containers=10)`.  
- **Secrets**: `detective-quill-secrets`, `neo4j-secret` (e.g. CLOUDAMQP_URL, NEO4J_*).  
- **@modal.enter() load_models**: prepend `/root` to sys.path; load spaCy `en_core_web_lg`, fastcoref `FCoref(device="cuda:0")`, LLM via `get_llm_loader()`, and `NarrativeAnalysisPipeline(nlp, coref_model)`.  
- **process_job(job_id, scene_text, user_id)**: runs `pipeline.process_scene(scene_text)` (Layers 1–4 only), returns `{ job_id, status, result (dict from result.dict()), error, processing_time }`.  
- **save_graph(scene_id, user_id, scene_text, resolved_text, entities, relationships)**: converts dicts to Entity/Relationship if needed, calls `save_graph_layer5(...)` (Layer 5 only), returns graph save result.

### 11.3 poll_queue Function

- **Decorator**: `@app.function(image=..., secrets=..., schedule=modal.Period(seconds=60), timeout=1800)` — no GPU.  
- Uses `chunk_text` from `src.utils.chunking`; connects to RabbitMQ via `CLOUDAMQP_URL`; declares both queues; fetches up to 6 messages; for each, chunks and spawns `process_job`; gathers; groups by job; merges; calls `save_graph.remote` for successful jobs; publishes merged results to `scene_analysis_results_queue`.

---

## 12. Backend Consumer and Database Diagram

### 12.1 ManualRabbitMQConsumer (NestJS)

- **Queue**: `scene_analysis_results_queue` (configurable).  
- **On message**: parse JSON; require `job_id`. If `status === 'completed'` and `result`, call `nlpAnalysisService.saveAnalysisResult(job_id, result)`; else `markJobAsFailed(job_id, error)`. Then `channel.ack(msg)`. On exception, `channel.nack(msg, false, false)`.

### 12.2 Database / Class Diagram

The **database class diagram** (`docs/database-class-diagram.drawio`) shows domain and persistence models. For the KG pipeline the relevant parts are:

- **NlpAnalysisJob**: job_id, user_id, scene_text, status, current_stage, progress, entity_count, relationship_count, result_data, created_at, started_at, completed_at, error_message; methods include submitAnalysis, getStatus, getResults, getUserHistory.  
- **NlpEntity**: id, job_id, name, type, mentions, attributes, created_at; created from pipeline result.  
- **NlpRelationship**: id, job_id, source, target, relation_type, description, confidence, created_at; created from pipeline result.  
- **Profile** has 1..* NlpAnalysisJob; NlpAnalysisJob has 1..* NlpEntity and 1..* NlpRelationship.

The **activity diagram** ties these to the flow: commit creates jobs and links (commit_knowledge_graphs); jobs are queued; after processing, the consumer updates NlpAnalysisJob and inserts NlpEntity and NlpRelationship in Supabase, while Neo4j holds the graph (Scene, entity nodes, relationship edges).

---

## 13. End-to-End Data Flow (Summary Table)

| Stage | Data in | Data out |
|-------|--------|----------|
| Backend commit | Commit + file snapshots | nlp_analysis_jobs (QUEUED), commit_knowledge_graphs, message to queue |
| Queue | job_id, scene_text, user_id | — |
| Poller consume | Message body | job_id, scene_text, user_id; ack |
| Chunking | scene_text | [chunk_0, ...] — one chunk if ≤600 words; else ~300-word chunks with overlap |
| process_job (per chunk) | chunk_id, chunk text, user_id | PipelineResult (entities, relationships, metadata, resolved_text) |
| Layer 1 (per chunk) | Chunk text | Entities (name, type, mentions), resolved_text |
| Layer 2 (per chunk) | Layer 1 entities | Filtered/merged entities |
| Layer 3 (per chunk) | Layer 2 entities + resolved_text | Enriched entities (description, role, attributes) |
| Layer 4 (per chunk) | Enriched entities + resolved_text + nlp | Relationships (source, target, type, description, confidence) |
| Merge | Chunk results (sorted by index) | One entity list, one relationship list, resolved_text, metadata |
| save_graph (Layer 5) | scene_id, user_id, scene_text, resolved_text, merged entities/relationships | Neo4j Scene + nodes + edges |
| Results queue | — | job_id, status, result, error, processing_time |
| Backend consumer | Result message | Supabase: nlp_analysis_jobs update, nlp_entities, nlp_relationships insert |

---

## 14. Summary

The knowledge graph pipeline:

1. **Layer 1**: Optionally resolves coreferences with fastcoref; re-runs spaCy NER on resolved text when needed; groups spans by (text, label) into Entity objects and returns resolved_text.  
2. **Layer 2**: Keeps only relevant entity types, merges substring-duplicate names, and marks uncertain GPEs.  
3. **Layer 3**: Uses the LLM in pairs to add description, role, and optional attributes per entity.  
4. **Layer 4**: Filters pairs by type and sentence co-occurrence, then uses the LLM to extract one evidence-based relationship per pair when present.  
5. **Layer 5**: Writes one Scene, entity nodes (with APPEARS_IN and mentions), and relationship edges to Neo4j.

**Parallelization**: Scene text is processed as one chunk if ≤600 words, otherwise split into ~300-word chunks with sentence overlap; each chunk is processed by a separate GPU worker (Layers 1–4); results are merged by job; Layer 5 runs once per job; the merged result is published and consumed by the backend to update Supabase. The **activity diagram** shows the flow across Backend, RabbitMQ, Python pipeline, and Database; the **database diagram** shows how NlpAnalysisJob, NlpEntity, and NlpRelationship fit into the broader application model.
