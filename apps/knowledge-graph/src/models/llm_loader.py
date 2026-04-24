from typing import Optional

from src.config import settings
from src.utils.logger import setup_logger


logger = setup_logger(__name__)


class LLMModelLoader:

    _instance: Optional['LLMModelLoader'] = None
    _model = None
    _tokenizer = None
    _device = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model is None:
            self._load_model()

    def _load_model(self):
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

        logger.info("=" * 60)
        logger.info("Loading LLM Model")
        logger.info("=" * 60)
        logger.info(f"Model: {settings.MODEL_NAME}")

        try:
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self._device}")

            logger.info("Loading tokenizer...")
            self._tokenizer = AutoTokenizer.from_pretrained(
                settings.MODEL_NAME,
                trust_remote_code=True
            )
            logger.info("Tokenizer loaded")

            if self._device == "cuda":
                vram_total = torch.cuda.get_device_properties(0).total_memory / 1e9
                logger.info(f"GPU VRAM available: {vram_total:.1f}GB")
                logger.info("Loading model with nf4 4-bit quantization...")

                bnb_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,  
                    bnb_4bit_use_double_quant=True,        
                    bnb_4bit_quant_type="nf4",            
                )

                self._model = AutoModelForCausalLM.from_pretrained(
                    settings.MODEL_NAME,
                    quantization_config=bnb_config,
                    device_map="auto",
                    low_cpu_mem_usage=True,
                    trust_remote_code=True,
                )

                vram_used = torch.cuda.memory_allocated() / 1e9
                logger.info(f"Model loaded — VRAM used: {vram_used:.1f}GB / {vram_total:.1f}GB ({100*vram_used/vram_total:.0f}%)")

            else:
                logger.warning("No CUDA available — loading in fp32 on CPU (will be slow)")
                self._model = AutoModelForCausalLM.from_pretrained(
                    settings.MODEL_NAME,
                    torch_dtype=torch.float32,
                    low_cpu_mem_usage=True,
                    trust_remote_code=True,
                )
                self._model = self._model.to(self._device)

            logger.info("Model loaded successfully")
            logger.info("=" * 60)

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    @property
    def model(self):
        if self._model is None:
            self._load_model()
        return self._model

    @property
    def tokenizer(self):
        if self._tokenizer is None:
            self._load_model()
        return self._tokenizer

    @property
    def device(self):
        if self._device is None:
            self._load_model()
        return self._device

    def generate(self, prompt: str, max_tokens: int = 512) -> str:
        import torch

        formatted_prompt = (
            "<|im_start|>system\n"
            "You are an expert literary analyst. "
            "Extract structured information in valid JSON format only. "
            "No markdown, no explanation.<|im_end|>\n"
            "<|im_start|>user\n"
            f"{prompt}<|im_end|>\n"
            "<|im_start|>assistant\n"
        )

        inputs = self._tokenizer(formatted_prompt, return_tensors="pt").to(self._device)

        with torch.no_grad():
            outputs = self._model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=False,          # greedy decoding — deterministic, faster, better for JSON
                repetition_penalty=1.1,
                pad_token_id=self._tokenizer.eos_token_id,
                eos_token_id=self._tokenizer.eos_token_id,
            )

        generated_tokens = outputs[0][inputs['input_ids'].shape[1]:]
        response = self._tokenizer.decode(generated_tokens, skip_special_tokens=True)
        return response.strip()


def get_llm_loader() -> LLMModelLoader:
    return LLMModelLoader()