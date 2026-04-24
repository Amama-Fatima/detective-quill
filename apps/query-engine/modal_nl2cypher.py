import re
import modal

APP_NAME = "detective-quill-nl2cypher"
MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
MAX_NEW_TOKENS = 120
TEMPERATURE = 0.1
TOKENIZER_MAX_LENGTH = 512

volume = modal.Volume.from_name(
    "qwen-cache",
    create_if_missing=True
)

image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "torch==2.4.1",
    "transformers==4.44.2",
)

app = modal.App(APP_NAME)


def _extract_cypher(text: str) -> str:
    cleaned = text.strip()

    cleaned = re.sub(r"```(?:cypher)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace("```", "").strip()

    match = re.search(r"\bOPTIONAL\s+MATCH\b|\bMATCH\b", cleaned, flags=re.IGNORECASE)
    if match:
        cleaned = cleaned[match.start():].strip()

    cleaned = re.split(r"\n\s*\n", cleaned, maxsplit=1)[0].strip()

    if ";" in cleaned:
        cleaned = cleaned.split(";", maxsplit=1)[0].strip()

    return cleaned


@app.cls(
    image=image,
    cpu=2,
    timeout=180,
    volumes={"/model_cache": volume},
)
class NL2CypherModel:

    @modal.enter()
    def load(self) -> None:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        self._cache = {}

        self._tokenizer = AutoTokenizer.from_pretrained(
            MODEL_ID,
            cache_dir="/model_cache"
        )

        self._model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            cache_dir="/model_cache",
            torch_dtype=torch.float32,
            device_map="cpu",
            low_cpu_mem_usage=True,
        )

        self._model.eval()

    @modal.method()
    def generate(self, prompt: str) -> str:
        import torch

        cached = self._cache.get(prompt)
        if cached is not None:
            return cached

        encoded = self._tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=TOKENIZER_MAX_LENGTH,
        )

        input_ids = encoded["input_ids"]
        attention_mask = encoded.get("attention_mask")

        with torch.inference_mode():
            output_ids = self._model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,
                max_new_tokens=MAX_NEW_TOKENS,
                temperature=TEMPERATURE,
                do_sample=False,
                pad_token_id=self._tokenizer.eos_token_id,
                eos_token_id=self._tokenizer.eos_token_id,
            )

        new_tokens = output_ids[0, input_ids.shape[1]:]
        raw_text = self._tokenizer.decode(new_tokens, skip_special_tokens=True)

        cypher = _extract_cypher(raw_text)

        self._cache[prompt] = cypher
        return cypher


@app.local_entrypoint()
def main(question: str = "Find all interactions between Mary Maloney and Patrick Maloney") -> None:
    from app.core.prompts import CYPHER_PROMPT_TEMPLATE, GRAPH_CYPHER_EXAMPLES_BLOCK, GRAPH_SCHEMA_TEXT

    prompt = CYPHER_PROMPT_TEMPLATE.format(
        schema=GRAPH_SCHEMA_TEXT + "\n\n",
        question=question,
        limit=10,
        GRAPH_CYPHER_EXAMPLES_BLOCK=GRAPH_CYPHER_EXAMPLES_BLOCK,
    )

    print(NL2CypherModel().generate.remote(prompt))