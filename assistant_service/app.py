from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal

from pydantic import BaseModel, Field
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

MAX_HISTORY_MESSAGES = 24

SYSTEM_PROMPT = (
    "You are DriveMate AI, a conversational assistant inside the VETC toll and mobility app. "
    "You help with commute timing, routes, toll wallet, fuel or charging, parking, and related trip decisions. "
    "Be natural and concise (usually 2-5 short sentences). Match the user's language when they write in Vietnamese or English. "
    "Use the Trip context block only as hints; it may be incomplete. Do not invent wallet balances, prices, ETAs, or routes not implied there. "
    "If the user's question is vague or missing a destination, time, or goal, ask one or two specific clarifying questions before giving advice. "
    "If you cannot answer from context or general mobility knowledge, say you are not sure and suggest what detail would help, or what they can check in the app (Home, Routes, Wallet). "
    "Do not dump a long marketing paragraph or repeat the entire trip summary unless the user asked for a summary."
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
    vehicleName: str | None = None
    vehicleType: str | None = None       # "ev" | "ice"
    destination: str | None = None
    walletBalance: int | None = None
    selectedRoute: RouteCtx | None = None
    fuelTrend: FuelTrendCtx | None = None
    commuteWindow: CommuteWindowCtx | None = None


class ChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=12000)


class ChatRequest(BaseModel):
    message: str
    context: ChatContext | None = None
    history: list[ChatHistoryMessage] | None = None


class ChatResponse(BaseModel):
    reply: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_context_text(ctx: ChatContext | None) -> str:
    if not ctx:
        return ""
    parts: list[str] = []
    if ctx.destination:
        parts.append(f"Destination (from app): {ctx.destination}")
    if ctx.vehicleName and ctx.vehicleType:
        parts.append(f"Vehicle: {ctx.vehicleName} ({ctx.vehicleType.upper()})")
    elif ctx.vehicleName:
        parts.append(f"Vehicle: {ctx.vehicleName}")
    elif ctx.vehicleType:
        parts.append(f"Powertrain: {ctx.vehicleType.upper()}")
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


def _is_compatible_mode_url(url: str) -> bool:
    return "compatible-mode" in url


def _build_dashscope_payload(messages: list[dict[str, str]]) -> dict:
    if _is_compatible_mode_url(settings.dashscope_url):
        return {
            "model": settings.model_name,
            "messages": messages,
            "max_tokens": settings.max_tokens,
        }

    return {
        "model": settings.model_name,
        "input": {
            "messages": messages,
        },
        "parameters": {
            "max_tokens": settings.max_tokens,
            "result_format": "message",
        },
    }


def _extract_reply(response_json: dict) -> str:
    # DashScope classic format
    output_reply = (
        response_json.get("output", {})
        .get("choices", [{}])[0]
        .get("message", {})
        .get("content")
    )
    if isinstance(output_reply, str) and output_reply.strip():
        return output_reply

    # DashScope OpenAI-compatible format
    compatible_reply = (
        response_json.get("choices", [{}])[0]
        .get("message", {})
        .get("content")
    )
    if isinstance(compatible_reply, str) and compatible_reply.strip():
        return compatible_reply

    raise KeyError("reply")


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

    messages: list[dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    if req.history:
        for item in req.history[-MAX_HISTORY_MESSAGES:]:
            messages.append({"role": item.role, "content": item.content})
    messages.append({"role": "user", "content": user_content})

    payload = _build_dashscope_payload(messages)
    headers = {
        "Authorization": f"Bearer {settings.dashscope_api_key}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=float(settings.timeout_s)) as client:
            response = await client.post(settings.dashscope_url, json=payload, headers=headers)
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail_text = exc.response.text[:300] if exc.response is not None else ""
        raise HTTPException(
            status_code=502,
            detail=f"DashScope returned {exc.response.status_code}: {detail_text}",
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"DashScope unreachable: {exc}",
        ) from exc

    try:
        reply = _extract_reply(response.json())
    except (KeyError, IndexError) as exc:
        raise HTTPException(
            status_code=502,
            detail="Unexpected DashScope response format",
        ) from exc

    return ChatResponse(reply=reply)
