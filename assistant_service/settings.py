from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import dotenv_values

ROOT_DIR = Path(__file__).resolve().parent.parent
_env_file = ROOT_DIR / ".env"
ENV_VALUES: dict[str, str | None] = dotenv_values(_env_file) if _env_file.exists() else {}


@dataclass(frozen=True)
class AssistantSettings:
    service_name: str = "DriveMate Assistant Service"
    dashscope_api_key: str | None = None
    dashscope_url: str = (
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    )
    model_name: str = "qwen-plus"
    timeout_s: int = 30
    max_tokens: int = 512

    def __new__(cls) -> "AssistantSettings":  # type: ignore[override]
        obj = object.__new__(cls)
        object.__setattr__(
            obj,
            "dashscope_api_key",
            ENV_VALUES.get("DASHSCOPE_API_KEY") or os.getenv("DASHSCOPE_API_KEY"),
        )
        object.__setattr__(
            obj,
            "model_name",
            os.getenv("QWEN_MODEL", "qwen-plus"),
        )
        object.__setattr__(
            obj,
            "timeout_s",
            int(os.getenv("ASSISTANT_TIMEOUT_S", "30")),
        )
        object.__setattr__(
            obj,
            "max_tokens",
            int(os.getenv("ASSISTANT_MAX_TOKENS", "512")),
        )
        return obj


settings = AssistantSettings()
