from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


@dataclass(frozen=True)
class ServiceSettings:
    service_name: str = "DriveMate TimesFM Forecast Service"
    model_name: str = os.getenv(
        "TIMESFM_MODEL_NAME", "google/timesfm-2.5-200m-pytorch"
    )
    forecast_timeout_ms: int = int(
        os.getenv("TIMESFM_FORECAST_TIMEOUT_MS", "8000")
    )
    model_max_context: int = int(os.getenv("TIMESFM_MAX_CONTEXT", "1024"))
    model_max_horizon: int = int(os.getenv("TIMESFM_MAX_HORIZON", "64"))
    min_commute_history_points: int = int(
        os.getenv("TIMESFM_MIN_COMMUTE_HISTORY_POINTS", "30")
    )
    min_fuel_history_points: int = int(
        os.getenv("TIMESFM_MIN_FUEL_HISTORY_POINTS", "12")
    )
    fuel_confidence_threshold: int = int(
        os.getenv("TIMESFM_FUEL_CONFIDENCE_THRESHOLD", "78")
    )
    enable_live_fuel: bool = os.getenv("TIMESFM_ENABLE_LIVE_FUEL", "1") != "0"
    data_path: Path = Path(__file__).resolve().parent / "data" / "scenarios.json"
    cache_dir: Path = Path(__file__).resolve().parent / ".hf-cache"
    hf_home: Path = Path(__file__).resolve().parent / ".hf-home"
    hf_xet_cache: Path = Path(__file__).resolve().parent / ".hf-home" / "xet"


settings = ServiceSettings()
