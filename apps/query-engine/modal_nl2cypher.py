import re
import modal

APP_NAME = "detective-quill-nl2cypher"
MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
MAX_NEW_TOKENS = 256     
TOKENIZER_MAX_LENGTH = 2048

volume = modal.Volume.from_name(
    "qwen-cache",
    create_if_missing=True,
)

# Persistent cross-container cache — survives cold starts and is shared across concurrent containers
query_cache = modal.Dict.from_name("nl2cypher-query-cache", create_if_missing=True)

image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "torch==2.4.1",
    "transformers==4.44.2",
    "accelerate>=0.33.0"
)

app = modal.App(APP_NAME)


def _extract_cypher(text: str) -> str:
    cleaned = text.strip()

    # Model outputs sometimes keep generating the next prompt turn.
    # Cut that off before any other cleanup so Neo4j only sees the query.
    leakage_markers = ["Human:", "USER QUESTION:", "Assistant:"]
    cut_points = [cleaned.find(marker) for marker in leakage_markers if marker in cleaned]
    if cut_points:
        cleaned = cleaned[: min(cut_points)].strip()

    cleaned = re.sub(r"```(?:cypher)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()

    if ";" in cleaned:
        cleaned = cleaned.split(";", maxsplit=1)[0].strip()

    # Stop at first blank line — explanations always start after a blank line
    cleaned = re.split(r"\n\s*\n", cleaned, maxsplit=1)[0].strip()

    # Stop at the first line that looks like prose
    lines = cleaned.splitlines()
    cypher_lines = []
    prose_starters = re.compile(
        r"^\s*(This|The|Note|Please|However|Here|It |In |As |Also|Adjust|Remember)",
        re.IGNORECASE,
    )
    for line in lines:
        if prose_starters.match(line):
            break
        cypher_lines.append(line)

    return "\n".join(cypher_lines).strip()


@app.cls(
    image=image,
    gpu="T4",       
    timeout=180,
    scaledown_window=200,
    volumes={"/model_cache": volume},
)
class NL2CypherModel:

    @modal.enter()
    def load(self) -> None:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self._tokenizer = AutoTokenizer.from_pretrained(
            MODEL_ID,
            cache_dir="/model_cache",
        )

        self._model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            cache_dir="/model_cache",
            torch_dtype=torch.float16,
            device_map="auto", 
        )

        self._model.eval()

    @modal.method()
    def generate(self, prompt: str) -> str:
        import torch

        # Check persistent shared cache first (survives cold starts)
        try:
            cached = query_cache.get(prompt)
            if cached is not None:
                cleaned_cached = _extract_cypher(cached)
                if cleaned_cached != cached:
                    query_cache[prompt] = cleaned_cached
                    return cleaned_cached
                return cached
        except Exception:
            pass  # cache miss or transient error, proceed to inference

        encoded = self._tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=TOKENIZER_MAX_LENGTH,
        )

        # Move tensors to the same device as the model (GPU)
        device = next(self._model.parameters()).device
        input_ids = encoded["input_ids"].to(device)
        attention_mask = encoded.get("attention_mask")
        if attention_mask is not None:
            attention_mask = attention_mask.to(device)

        with torch.inference_mode():
            output_ids = self._model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=MAX_NEW_TOKENS,
                do_sample=False,    # greedy decoding, deterministic, correct for Cypher generation
                pad_token_id=self._tokenizer.eos_token_id,
                eos_token_id=self._tokenizer.eos_token_id,
            )

        new_tokens = output_ids[0, input_ids.shape[1]:]
        raw_text = self._tokenizer.decode(new_tokens, skip_special_tokens=True)

        cypher = _extract_cypher(raw_text)

        # Persist result to shared cache
        try:
            query_cache[prompt] = cypher
        except Exception:
            pass 

        return cypher


def _execute_cypher_query(cypher: str):
    from neo4j import GraphDatabase

    from app.core.config import settings

    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    try:
        with driver.session() as session:
            result = session.run(cypher)
            return result.data()
    finally:
        driver.close()


@app.local_entrypoint()
def main(question: str = "Find all interactions between Mary Maloney and Patrick Maloney") -> None:
    from app.core.prompts import CYPHER_PROMPT_TEMPLATE, GRAPH_CYPHER_EXAMPLES_BLOCK, GRAPH_SCHEMA_TEXT

    prompt = CYPHER_PROMPT_TEMPLATE.format(
        schema=GRAPH_SCHEMA_TEXT,
        question=question,
        limit=10,
        examples_block=GRAPH_CYPHER_EXAMPLES_BLOCK,
    )

    cypher = NL2CypherModel().generate.remote(prompt)

    print("\nExtracted Cypher:\n")
    print(cypher)

    answer = _execute_cypher_query(cypher)

    print("\nQuery Result:\n")
    print(answer)