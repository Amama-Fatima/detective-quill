"""Custom wrapper around the Modal Qwen NL -> Cypher deployment."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

import modal

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class ModalQwenLLM:
    def __init__(self, timeout_seconds: int | None = None) -> None:
        self._timeout_seconds = timeout_seconds or settings.modal_timeout_seconds

        try:
            modal_model_class = modal.Cls.from_name(
                settings.modal_app_name,
                settings.modal_model_class_name,
            )
            self._model_instance = modal_model_class()
        except Exception as exc:
            raise RuntimeError(
                "Failed to resolve Modal model class. Deploy modal_nl2cypher.py first."
            ) from exc

        self._executor = ThreadPoolExecutor(max_workers=1)

    def generate(self, prompt: str) -> str:
        future = self._executor.submit(self._model_instance.generate.remote, prompt)

        try:
            output = future.result(timeout=self._timeout_seconds)
        except FuturesTimeoutError as exc:
            logger.error("Modal LLM timed out after %s seconds", self._timeout_seconds)
            raise RuntimeError(
                f"Modal LLM timed out after {self._timeout_seconds} seconds"
            ) from exc
        except Exception as exc:
            logger.exception("Modal LLM generation failed")
            raise RuntimeError("Modal LLM generation failed") from exc

        return str(output).strip()

    def __call__(self, prompt: str) -> str:
        return self.generate(prompt)
