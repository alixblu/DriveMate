from __future__ import annotations

from pathlib import Path
import os

from dotenv import dotenv_values

ROOT_DIR = Path(__file__).resolve().parent.parent
_env_file = ROOT_DIR / ".env"
ENV_VALUES: dict[str, str | None] = dotenv_values(_env_file) if _env_file.exists() else {}


class AssistantSettings:
    def __init__(self) -> None:
        self.service_name = "DriveMate Assistant Service"
        self.dashscope_url = os.getenv(
            "DASHSCOPE_URL",
            "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
        )
        self.dashscope_api_key = ENV_VALUES.get("DASHSCOPE_API_KEY") or os.getenv(
            "DASHSCOPE_API_KEY"
        )
        self.model_name = os.getenv("QWEN_MODEL", "qwen-plus")
        self.timeout_s = int(os.getenv("ASSISTANT_TIMEOUT_S", "30"))
        self.max_tokens = int(os.getenv("ASSISTANT_MAX_TOKENS", "512"))


settings = AssistantSettings()
