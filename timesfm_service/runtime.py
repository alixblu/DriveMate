from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError
from contextlib import contextmanager
from dataclasses import dataclass
import json
import os
from pathlib import Path
from statistics import mean, pstdev
from typing import Any

from .fallbacks import build_commute_fallback, build_fuel_fallback, utc_now_iso
from .settings import ServiceSettings


class ForecastTimeoutError(RuntimeError):
    """Raised when a model forecast exceeds the demo-safe timeout budget."""


@dataclass
class ModelState:
    loaded: bool
    loading: bool = False
    last_error: str | None = None
    loaded_at: str | None = None


def clamp_int(value: float, low: int, high: int) -> int:
    return max(low, min(high, int(round(value))))


def round_to_nearest_hundred(value: float) -> int:
    return int(round(value / 100.0) * 100)


@contextmanager
def bypass_dead_proxy_env():
    proxy_keys = [
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "ALL_PROXY",
        "http_proxy",
        "https_proxy",
        "all_proxy",
        "GIT_HTTP_PROXY",
        "GIT_HTTPS_PROXY",
    ]
    original = {key: os.environ.get(key) for key in proxy_keys}

    for key in proxy_keys:
        os.environ.pop(key, None)

    hf_home = Path(__file__).resolve().parent / ".hf-home"
    hf_xet_cache = hf_home / "xet"
    hf_home.mkdir(parents=True, exist_ok=True)
    hf_xet_cache.mkdir(parents=True, exist_ok=True)

    original_hf_home = os.environ.get("HF_HOME")
    original_hf_xet_cache = os.environ.get("HF_XET_CACHE")

    os.environ["HF_HOME"] = str(hf_home)
    os.environ["HF_XET_CACHE"] = str(hf_xet_cache)
    os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

    try:
        yield
    finally:
        if original_hf_home is not None:
            os.environ["HF_HOME"] = original_hf_home
        else:
            os.environ.pop("HF_HOME", None)

        if original_hf_xet_cache is not None:
            os.environ["HF_XET_CACHE"] = original_hf_xet_cache
        else:
            os.environ.pop("HF_XET_CACHE", None)

        for key, value in original.items():
            if value is not None:
                os.environ[key] = value


class TimesFMRuntime:
    def __init__(self, settings: ServiceSettings):
        self.settings = settings
        self.executor = ThreadPoolExecutor(max_workers=1)
        self.model: Any | None = None
        self.timesfm_module: Any | None = None
        self.state = ModelState(loaded=False)
        self.load_future = None

    @property
    def display_name(self) -> str:
        return self.settings.model_name if self.state.loaded else "seeded-fallback"

    def startup(self) -> None:
        self.state = ModelState(loaded=False, loading=True)
        self.load_future = self.executor.submit(self._load_model)

    def shutdown(self) -> None:
        if self.load_future is not None and not self.load_future.done():
            self.load_future.cancel()
        self.executor.shutdown(wait=False, cancel_futures=True)

    def forecast(self, history: list[float], horizon: int) -> tuple[list[float], list[list[float]] | None]:
        self.refresh_state()

        if self.state.loading:
            raise RuntimeError("TimesFM runtime is still warming up.")

        if not self.state.loaded or self.model is None:
            raise RuntimeError(self.state.last_error or "TimesFM runtime is not loaded.")

        future = self.executor.submit(self._run_forecast, history, horizon)

        try:
            return future.result(timeout=self.settings.forecast_timeout_ms / 1000)
        except TimeoutError as exc:
            future.cancel()
            raise ForecastTimeoutError(
                f"TimesFM forecast exceeded {self.settings.forecast_timeout_ms} ms."
            ) from exc

    def refresh_state(self) -> None:
        if self.load_future is None or not self.load_future.done():
            return

        if self.state.loaded or (self.state.last_error and not self.state.loading):
            return

        try:
            model, timesfm_module = self.load_future.result()
            self.model = model
            self.timesfm_module = timesfm_module
            self.state = ModelState(
                loaded=True,
                loading=False,
                loaded_at=utc_now_iso(),
            )
        except Exception as exc:  # pragma: no cover - exercised in real startup
            self.model = None
            self.timesfm_module = None
            self.state = ModelState(
                loaded=False,
                loading=False,
                last_error=f"{type(exc).__name__}: {exc}",
            )

    def _load_model(self):
        with bypass_dead_proxy_env():
            self.settings.cache_dir.mkdir(parents=True, exist_ok=True)

            import numpy as np  # noqa: F401
            import torch
            import timesfm

            torch.set_float32_matmul_precision("high")
            local_snapshot_dir = self._find_local_snapshot_dir()

            if local_snapshot_dir is not None:
                model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
                    str(local_snapshot_dir)
                )
            else:
                model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
                    self.settings.model_name,
                    cache_dir=str(self.settings.cache_dir),
                )
            model.compile(
                timesfm.ForecastConfig(
                    max_context=self.settings.model_max_context,
                    max_horizon=self.settings.model_max_horizon,
                    normalize_inputs=True,
                    use_continuous_quantile_head=True,
                    force_flip_invariance=True,
                    infer_is_positive=True,
                    fix_quantile_crossing=True,
                )
            )
            return model, timesfm

    def _find_local_snapshot_dir(self) -> Path | None:
        repo_key = self.settings.model_name.replace("/", "--")
        snapshots_root = (
            self.settings.cache_dir / f"models--{repo_key}" / "snapshots"
        )

        if not snapshots_root.exists():
            return None

        for snapshot_dir in sorted(snapshots_root.iterdir(), reverse=True):
            if not snapshot_dir.is_dir():
                continue

            config_path = snapshot_dir / "config.json"
            model_path = snapshot_dir / "model.safetensors"

            if config_path.exists() and model_path.exists():
                return snapshot_dir

        return None

    def _run_forecast(
        self, history: list[float], horizon: int
    ) -> tuple[list[float], list[list[float]] | None]:
        import numpy as np

        point_forecast, quantile_forecast = self.model.forecast(
            horizon=horizon,
            inputs=[np.asarray(history, dtype=np.float32)],
        )
        point_values = [float(value) for value in point_forecast[0].tolist()]
        quantile_values = (
            [[float(value) for value in row] for row in quantile_forecast[0].tolist()]
            if quantile_forecast is not None
            else None
        )
        return point_values, quantile_values


class ForecastService:
    def __init__(self, settings: ServiceSettings):
        self.settings = settings
        self.runtime = TimesFMRuntime(settings)
        self.scenarios = self._load_scenarios(settings.data_path)

    def _load_scenarios(self, path: Path) -> dict[str, dict]:
        with path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        return payload

    def startup(self) -> None:
        self.runtime.startup()

    def shutdown(self) -> None:
        self.runtime.shutdown()

    def _get_scenario(self, scenario_id: str) -> dict:
        return self.scenarios.get(scenario_id, self.scenarios["fuel-hike"])

    def health(self) -> dict:
        self.runtime.refresh_state()

        if self.runtime.state.loaded:
            status = "ready"
        elif self.runtime.state.loading:
            status = "warming"
        else:
            status = "degraded"

        return {
            "status": status,
            "modelLoaded": self.runtime.state.loaded,
            "modelName": self.settings.model_name,
            "generatedAt": utc_now_iso(),
            "source": "timesfm-live" if self.runtime.state.loaded else "seeded-fallback",
            "lastError": self.runtime.state.last_error,
            "scenarioCount": len(self.scenarios),
        }

    def forecast_commute_window(self, request) -> dict:
        scenario = self._get_scenario(request.scenarioId)
        history = request.history or scenario["commuteHistory"]["series"]
        departure_slots = scenario["commuteHistory"]["departureSlots"]
        horizon = request.horizon or len(departure_slots)

        if request.scenarioId == "fallback":
            return build_commute_fallback(
                scenario,
                reason="forced-fallback-scenario",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        if len(history) < max(self.settings.min_commute_history_points, horizon * 2):
            return build_commute_fallback(
                scenario,
                reason="not-enough-history",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        try:
            point_forecast, _ = self.runtime.forecast(history, len(departure_slots))
        except Exception as exc:
            return build_commute_fallback(
                scenario,
                reason=type(exc).__name__.replace("Error", "").lower() or "model-failure",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        predicted = [max(18.0, value) for value in point_forecast[: len(departure_slots)]]

        if len(predicted) < len(departure_slots):
            return build_commute_fallback(
                scenario,
                reason="short-forecast",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        best_index = min(range(len(predicted)), key=predicted.__getitem__)
        focus_values = predicted[max(0, best_index - 1) : min(len(predicted), best_index + 2)]
        low_eta = clamp_int(min(focus_values), 18, 70)
        high_eta = clamp_int(max(focus_values) + 7, low_eta + 5, 90)
        jam_threshold = min(predicted) + 6
        peak_start_index = next(
            (
                index
                for index, eta in enumerate(predicted)
                if index > best_index and eta >= jam_threshold
            ),
            min(best_index + 2, len(departure_slots) - 2),
        )
        peak_end_index = min(len(departure_slots) - 1, peak_start_index + 2)
        stability_score = 1 - (
            pstdev(history[-len(departure_slots) :]) / max(mean(history[-len(departure_slots) :]), 1)
        )
        best_gap = sorted(predicted)[1] - sorted(predicted)[0] if len(predicted) > 1 else 0
        confidence = clamp_int(70 + best_gap * 3 + stability_score * 18, 72, 92)

        return {
            "destination": scenario["commuteHistory"]["destination"],
            "etaRangeMin": [low_eta, high_eta],
            "trafficBand": (
                f"Peak traffic builds after {departure_slots[peak_start_index]} "
                f"and stays heavy until {departure_slots[peak_end_index]}"
            ),
            "bestDepartureWindow": (
                f"{departure_slots[max(0, best_index - 1)]} - "
                f"{departure_slots[min(len(departure_slots) - 1, best_index + 1)]}"
            ),
            "bestDepartureTime": departure_slots[best_index],
            "confidencePct": confidence,
            "source": "timesfm-live",
            "fallbackUsed": False,
            "modelName": self.runtime.display_name,
            "generatedAt": utc_now_iso(),
            "historyPointsUsed": len(history),
            "fallbackReason": None,
        }

    def forecast_fuel_trend(self, request) -> dict:
        scenario = self._get_scenario(request.scenarioId)
        history = request.history or scenario["fuelHistory"]["series"]
        horizon = request.horizonDays
        current_price = scenario["fuelHistory"]["currentPriceVndPerLitre"]

        if request.scenarioId == "fallback":
            return build_fuel_fallback(
                scenario,
                reason="forced-fallback-scenario",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        if not self.settings.enable_live_fuel:
            return build_fuel_fallback(
                scenario,
                reason="live-fuel-disabled",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        if len(history) < self.settings.min_fuel_history_points:
            return build_fuel_fallback(
                scenario,
                reason="not-enough-history",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        try:
            point_forecast, _ = self.runtime.forecast(history, horizon)
        except Exception as exc:
            return build_fuel_fallback(
                scenario,
                reason=type(exc).__name__.replace("Error", "").lower() or "model-failure",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        next_price = round_to_nearest_hundred(point_forecast[0])
        delta_vnd = next_price - current_price
        recent_deltas = [
            history[index + 1] - history[index]
            for index in range(len(history) - 1)
        ]
        trend_consistency = (
            sum(1 for delta in recent_deltas[-6:] if delta >= 0) / max(len(recent_deltas[-6:]), 1)
        )
        movement_penalty = min(abs(delta_vnd) / 600, 1)
        confidence = clamp_int(
            62 + trend_consistency * 20 + movement_penalty * 14,
            65,
            90,
        )

        if confidence < self.settings.fuel_confidence_threshold:
            return build_fuel_fallback(
                scenario,
                reason="confidence-gated",
                model_name=self.runtime.display_name,
                history_points_used=len(history),
            )

        weekly_litres = scenario["fuelHistory"].get("weeklyLitres", 160)
        estimated_weekly_impact = max(0, delta_vnd) * weekly_litres

        return {
            "fuelType": scenario["fuelHistory"]["fuelType"],
            "currentPriceVndPerLitre": current_price,
            "nextPriceVndPerLitre": next_price,
            "deltaVnd": delta_vnd,
            "trendDirection": (
                "up" if delta_vnd > 0 else "down" if delta_vnd < 0 else "flat"
            ),
            "confidence": confidence,
            "estimatedWeeklyImpactVnd": estimated_weekly_impact,
            "source": "timesfm-live",
            "fallbackUsed": False,
            "modelName": self.runtime.display_name,
            "generatedAt": utc_now_iso(),
            "historyPointsUsed": len(history),
            "fallbackReason": None,
        }
