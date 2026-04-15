# DriveMate - Claude Project Context

## Product Definition (Authoritative)

DriveMate AI is an **AI driving companion integrated into VETC**.
The goal is to evolve VETC from a toll-payment utility into a **daily-use mobility assistant**.

Business intent:
- TASCO wants to increase engagement/DAU in the VETC app.
- Predictive AI is a core mechanism to create repeat daily usage.

Core decision loop:
- when to leave
- which route to take
- when to refuel/top up

Optimization lens:
- not only ETA
- optimize `time + toll + fuel/energy cost + service convenience`

## Service Ecosystem In Scope

DriveMate should connect and guide users across these VETC-relevant services:

1. Toll payments (including proactive top-up popups/reminders)
2. Toll stations
3. Parking lots
4. Charging stations
5. Car wash locations

Important: these are not side features. They are part of the product value chain and should appear in recommendations, nudges, and assistant responses.

## Predictive AI Role

Predictive AI exists to drive useful actions, not just show insights.

Expected pipeline:
1. Predict trip and cost conditions (traffic window, toll impact, fuel/charging trend).
2. Score route and service options.
3. Recommend next best action (leave time, lane, top-up, stop).
4. Trigger conversion UI (open route, reserve parking, top up wallet, etc.).

Live model + resilience:
- TimesFM sidecar serves forecast endpoints.
- If model is unavailable, app degrades gracefully to seeded behavior.

## POC UI Features (Current Full Feature Direction)

POC reflects broader product scope beyond a simple MVP card.

Main surfaces:
- `home` dashboard with VETC services grid and AI commute card
- `routes` compare/select flow with map, toll view, coffee stop, parking support
- `assistant` action hub (route, charging stops, parking lot, wallet top-up, departure optimization)
- `wallet` smart top-up + loyalty and wallet services
- `notifications` proactive alerts (price/commute/wallet)
- voice overlay for scripted + live voice interaction

Functional behaviors seen in POC:
- AI route comparison (best value / fastest / cheapest) with toll and charging cost trade-offs
- traffic scenario simulation (normal/rain/incident) that changes ETA and leave-time advice
- proactive AI nudges with one-tap actions (top-up, leave earlier, reserve parking, reminders)
- parking lot support near destination
- charging stop visibility along route
- wallet protection logic (recommended top-up before trip interruption)
- loyalty and rewards tie-in

## MVP Status (Implemented From POC Direction)

The MVP is already wired to real forecasting infrastructure while keeping the POC product logic.

What is live in MVP now:
- TimesFM forecasting sidecar is active in `timesfm_service/`.
- Frontend + sidecar can run together from root with `npm run dev`.
- Forecast API endpoints are available:
  - `GET /health`
  - `POST /forecast/commute-window`
  - `POST /forecast/fuel-trend`
- MVP promotes from seeded startup values to live TimesFM output after model warm-up.

Hugging Face authentication (important):
- Hugging Face token is loaded from repo `.env`, not Windows machine env.
- Key expected: `HUGGINGFACE_API_KEY`
- Runtime maps this token to HF auth env vars used by model loading.
- This supports consistent setup across developer machines and demo devices.

How MVP maps to POC idea:
- `POC` defines full interaction scope (services + journeys + assistant behavior).
- `MVP` focuses on highest-impact daily decision flow first:
  - commute window prediction
  - fuel trend prediction
  - route/value recommendation framing
  - wallet/top-up decision support
- Additional POC services (parking, charging stops, car wash depth) are part of the roadmap and should be integrated into the same predict-to-action loop.

## Codebase Map

Product tracks:
- `POC/` = full-feature UI concept and interaction breadth
- `MVP/` = current streamlined implementation track
- `timesfm_service/` = forecasting sidecar (FastAPI + TimesFM)

POC files to read first for product understanding:
- `POC/src/App.jsx`
- `POC/src/pages/Dashboard.jsx`
- `POC/src/pages/RoutesPage.jsx`
- `POC/src/pages/AssistantPage.jsx`
- `POC/src/pages/WalletPage.jsx`
- `POC/src/pages/NotificationsPage.jsx`
- `POC/src/data/mockData.js`

Forecast service files:
- `timesfm_service/app.py`
- `timesfm_service/runtime.py`
- `timesfm_service/settings.py`

## Guardrails For Claude When Editing

1. Keep the product centered on daily driving decisions and DAU growth.
2. Preserve service ecosystem integration (toll, parking, charging, car wash, wallet).
3. Prefer action-oriented AI outputs over passive text.
4. Maintain explainability (why this route/leave-time/top-up).
5. Never break graceful fallback behavior when live forecasting fails.

## Environment Notes

- Hugging Face key is loaded from repo `.env`.
- Use `HUGGINGFACE_API_KEY` in `.env`.
- Do not depend on Windows machine-level env vars for HF auth.

## One-Screen Summary For Claude

DriveMate is a VETC-integrated daily mobility assistant.
Its job is to convert prediction into action across route, toll, charging, parking, and wallet flows so TASCO can grow DAU and engagement.
