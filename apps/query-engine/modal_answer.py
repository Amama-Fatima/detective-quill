import modal

APP_NAME = "detective-quill-answer"
MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
MAX_NEW_TOKENS = 512
TOKENIZER_MAX_LENGTH = 4096
LEAKAGE_MARKERS = ("\nHuman:", "\nUSER:", "\nUser:", "\nAssistant:", "```json")

volume = modal.Volume.from_name("qwen-answer-cache", create_if_missing=True)
answer_cache = modal.Dict.from_name("answer-generation-cache", create_if_missing=True)

image = modal.Image.debian_slim(python_version="3.10").pip_install(
    "torch==2.4.1",
    "transformers==4.44.2",
    "accelerate>=0.33.0",
)

app = modal.App(APP_NAME)


def _extract_first_json_object(text: str) -> str:
    start = text.find("{")
    if start == -1:
        return text.strip()

    depth = 0
    in_string = False
    escaped = False

    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start : index + 1].strip()

    return text.strip()


def _clean_answer_output(text: str) -> str:
    cleaned = text.strip()
    for marker in LEAKAGE_MARKERS:
        marker_index = cleaned.find(marker)
        if marker_index != -1:
            cleaned = cleaned[:marker_index].strip()

    return _extract_first_json_object(cleaned)


@app.cls(
    image=image,
    gpu="T4",
    timeout=180,
    scaledown_window=200,
    volumes={"/model_cache": volume},
)
class AnswerModel:
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

        try:
            cached = answer_cache.get(prompt)
            if cached is not None:
                return cached
        except Exception:
            pass

        encoded = self._tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=TOKENIZER_MAX_LENGTH,
        )

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
                do_sample=False,
                pad_token_id=self._tokenizer.eos_token_id,
                eos_token_id=self._tokenizer.eos_token_id,
            )

        new_tokens = output_ids[0, input_ids.shape[1] :]
        output = self._tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
        output = _clean_answer_output(output)

        try:
            answer_cache[prompt] = output
        except Exception:
            pass

        return output


@app.local_entrypoint()
def main(prompt: str = "Return JSON: {\"answer\":\"hello\",\"supporting_job_ids\":[]}") -> None:
    model = AnswerModel()
    print(model.generate.remote(prompt))
