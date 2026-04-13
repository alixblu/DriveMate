from __future__ import annotations

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    modelLoaded: bool
    modelName: str
    generatedAt: str
    source: str
    lastError: str | None = None
    scenarioCount: int


class CommuteWindowRequest(BaseModel):
    scenarioId: str = Field(default="fuel-hike")
    history: list[float] | None = None
    horizon: int | None = None
    granularityMinutes: int | None = None
    date: str | None = None
    userId: str | None = None


class FuelTrendRequest(BaseModel):
    scenarioId: str = Field(default="fuel-hike")
    history: list[float] | None = None
    horizonDays: int = Field(default=1, ge=1, le=7)
    date: str | None = None
    area: str | None = None


class CommuteWindowResponse(BaseModel):
    destination: str
    etaRangeMin: list[int]
    trafficBand: str
    bestDepartureWindow: str
    bestDepartureTime: str
    confidencePct: int
    source: str
    fallbackUsed: bool
    modelName: str
    generatedAt: str
    historyPointsUsed: int
    fallbackReason: str | None = None


class FuelTrendResponse(BaseModel):
    fuelType: str
    currentPriceVndPerLitre: int
    nextPriceVndPerLitre: int
    deltaVnd: int
    trendDirection: str
    confidence: int
    estimatedWeeklyImpactVnd: int
    source: str
    fallbackUsed: bool
    modelName: str
    generatedAt: str
    historyPointsUsed: int
    fallbackReason: str | None = None
