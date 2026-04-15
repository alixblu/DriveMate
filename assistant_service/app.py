from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

from .settings import settings

app = FastAPI(title=settings.service_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = (
    "You are DriveMate AI assistant integrated into the VETC toll and mobility app. "
    "Help users with route planning, toll payments, fuel or charging decisions, "
    "parking reservations, and wallet top-up decisions. "
    "Be concise and action-oriented. Respond in 2-4 sentences. "
    "If you recommend an action, name the specific tab or feature to use in the app."
)


# ── Request / Response models ─────────────────────────────────────────────────

class FuelTrendCtx(BaseModel):
    direction: str | None = None
    delta: int | None = None
    confidence: int | None = None


class CommuteWindowCtx(BaseModel):
    bestDepartureTime: str | None = None
    confidencePct: int | None = None


class RouteCtx(BaseModel):
    name: str | None = None
    eta: int | None = None
    toll: int | None = None


class ChatContext(BaseModel):
    vehicleType: str | None = None       # "ev" | "ice"
    walletBalance: int | None = None
    selectedRoute: RouteCtx | None = None
    fuelTrend: FuelTrendCtx | None = None
    commuteWindow: CommuteWindowCtx | None = None


class ChatRequest(BaseModel):
    message: str
    context: ChatContext | None = None


class ChatResponse(BaseModel):
    reply: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_context_text(ctx: ChatContext | None) -> str:
    if not ctx:
        return ""
    parts: list[str] = []
    if ctx.vehicleType:
        parts.append(f"Vehicle type: {ctx.vehicleType.upper()}")
    if ctx.walletBalance is not None:
        parts.append(f"VETC wallet balance: {ctx.walletBalance:,} VND")
    if ctx.selectedRoute:
        r = ctx.selectedRoute
        route_parts: list[str] = []
        if r.name:
            route_parts.append(r.name)
        if r.eta is not None:
            route_parts.append(f"ETA {r.eta} min")
        if r.toll is not None:
            route_parts.append(f"toll {r.toll:,} VND")
        if route_parts:
            parts.append(f"Selected route: {', '.join(route_parts)}")
    if ctx.fuelTrend and ctx.fuelTrend.direction:
        delta_str = f"{ctx.fuelTrend.delta:+,}" if ctx.fuelTrend.delta is not None else "?"
        conf_str = f"{ctx.fuelTrend.confidence}%" if ctx.fuelTrend.confidence is not None else "?"
        parts.append(f"Fuel trend: {ctx.fuelTrend.direction} ({delta_str} VND/L, {conf_str} confidence)")
    if ctx.commuteWindow and ctx.commuteWindow.bestDepartureTime:
        conf_str = (
            f"{ctx.commuteWindow.confidencePct}%" if ctx.commuteWindow.confidencePct is not None else "?"
        )
        parts.append(
            f"Best departure: {ctx.commuteWindow.bestDepartureTime} ({conf_str} confidence)"
        )
    if not parts:
        return ""
    return "\n\nTrip context:\n" + "\n".join(parts)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    return {
        "status": "ready",
        "model": settings.model_name,
        "apiKeyConfigured": bool(settings.dashscope_api_key),
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    if not settings.dashscope_api_key:
        raise HTTPException(status_code=503, detail="DASHSCOPE_API_KEY is not configured.")

    user_content = req.message + _build_context_text(req.context)

    payload = {
        "model": settings.model_name,
        "input": {
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ]
        },
        "parameters": {
            "max_tokens": settings.max_tokens,
            "result_format": "message",
        },
    }
    headers = {
        "Authorization": f"Bearer {settings.dashscope_api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=float(settings.timeout_s)) as client:
            response = await client.post(settings.dashscope_url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"DashScope returned {exc.response.status_code}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"DashScope unreachable: {exc}",
        ) from exc

    try:
        reply: str = response.json()["output"]["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Unexpected DashScope response format",
        ) from exc

    return ChatResponse(reply=reply)
