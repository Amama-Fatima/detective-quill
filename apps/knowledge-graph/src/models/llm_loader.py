

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
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
        logger.info("=" * 60)
        logger.info("Loading LLM Model")
        logger.info("=" * 60)
        logger.info(f"Model: {settings.MODEL_NAME}")
        logger.info(f"Device: {settings.MODEL_DEVICE}")
        
        try:
            self._device = settings.MODEL_DEVICE
            if self._device == "cuda" and not torch.cuda.is_available():
                logger.warning("CUDA not available, falling back to CPU")
                self._device = "cpu"
            
            logger.info(f"Using device: {self._device}")
            
            logger.info("Loading tokenizer...")
            self._tokenizer = AutoTokenizer.from_pretrained(
                settings.MODEL_NAME,
                trust_remote_code=True
            )
            logger.info("Tokenizer loaded successfully")
            
            logger.info("Loading model (this may take a few minutes)...")
            self._model = AutoModelForCausalLM.from_pretrained(
                settings.MODEL_NAME,
                torch_dtype=torch.float16 if self._device == "cuda" else torch.float32,
                device_map="auto" if self._device == "cuda" else None,
                trust_remote_code=True
            )
            
            if self._device == "cpu":
                self._model = self._model.to(self._device)
            
            logger.info("Model loaded successfully")
            logger.info(f"Model device: {self._model.device}")
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
    
    def generate(self, prompt: str, max_tokens: int = 512, temperature: float = None) -> str:

        formatted_prompt = f"""<|im_start|>system
        You are an expert literary analyst. Extract structured information in valid JSON format only. No markdown, no explanation.<|im_end|>
        <|im_start|>user
        {prompt}<|im_end|>
        <|im_start|>assistant
        """
        
        inputs = self.tokenizer(formatted_prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature or settings.MODEL_TEMPERATURE,
                top_p=0.9,
                repetition_penalty=1.1,
                pad_token_id=self.tokenizer.eos_token_id,
                do_sample=True
            )
        
        generated_tokens = outputs[0][inputs['input_ids'].shape[1]:]
        response = self.tokenizer.decode(generated_tokens, skip_special_tokens=True)
        
        return response.strip()


def get_llm_loader() -> LLMModelLoader:

    return LLMModelLoader()