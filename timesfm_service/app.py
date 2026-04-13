from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .runtime import ForecastService
from .schemas import (
    CommuteWindowRequest,
    CommuteWindowResponse,
    FuelTrendRequest,
    FuelTrendResponse,
    HealthResponse,
)
from .settings import settings


service = ForecastService(settings)


@asynccontextmanager
async def lifespan(_: FastAPI):
    service.startup()
    yield
    service.shutdown()


app = FastAPI(title=settings.service_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse.model_validate(service.health())


@app.post("/forecast/commute-window", response_model=CommuteWindowResponse)
def forecast_commute_window(
    request: CommuteWindowRequest,
) -> CommuteWindowResponse:
    return CommuteWindowResponse.model_validate(service.forecast_commute_window(request))


@app.post("/forecast/fuel-trend", response_model=FuelTrendResponse)
def forecast_fuel_trend(request: FuelTrendRequest) -> FuelTrendResponse:
    return FuelTrendResponse.model_validate(service.forecast_fuel_trend(request))
