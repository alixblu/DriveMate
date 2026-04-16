from __future__ import annotations

from datetime import datetime, timezone


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def build_commute_fallback(
    scenario: dict,
    *,
    reason: str,
    model_name: str,
    history_points_used: int,
) -> dict:
    destination = scenario["fallbackCommuteWindow"].get(
        "destination",
        scenario.get("commuteHistory", {}).get("destination", "destination"),
    )
    best_departure_time = scenario["fallbackCommuteWindow"].get(
        "bestDepartureTime", "07:40"
    )

    payload = {
        **scenario["fallbackCommuteWindow"],
        "jamPrediction": (
            f"Traffic jam risk rises after {best_departure_time} on the {destination} corridor."
        ),
        "leaveTimeSuggestion": (
            f"Best Value at {best_departure_time} keeps the {destination.lower()} trip in control."
        ),
        "fallbackUsed": True,
        "modelName": model_name,
        "generatedAt": utc_now_iso(),
        "historyPointsUsed": history_points_used,
        "fallbackReason": reason,
    }
    return payload


def build_fuel_fallback(
    scenario: dict,
    *,
    reason: str,
    model_name: str,
    history_points_used: int,
) -> dict:
    payload = {
        **scenario["fallbackFuelTrend"],
        "fallbackUsed": True,
        "modelName": model_name,
        "generatedAt": utc_now_iso(),
        "historyPointsUsed": history_points_used,
        "fallbackReason": reason,
    }
    return payload
