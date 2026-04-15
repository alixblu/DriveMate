# DriveMate Predictive Runtime (TimesFM + Qwen)

## Goal

Keep UI unchanged while making predictive behavior reliable:

- Use `TimesFM` for forecast tasks (commute + fuel trend) whenever available.
- If TimesFM is unavailable or returns invalid payloads, fall back to seeded forecast data.
- For assistant chat tasks outside simulation intents, use `Qwen` model.

This design gives both:

- demo stability (seeded fallback),
- and live intelligence (TimesFM + Qwen).

---

## Runtime Architecture

## 1) Forecast layer (TimesFM first)

Frontend file:

- `MVP/src/lib/forecastAdapter.js`

Forecast endpoints:

- `POST /forecast/commute-window` (TimesFM sidecar, port `8008`)
- `POST /forecast/fuel-trend` (TimesFM sidecar, port `8008`)
- `GET /health` (TimesFM sidecar)

Behavior:

1. Frontend tries live TimesFM forecast.
2. If call fails, times out, or payload is invalid, adapter returns seeded fallback.
3. UI continues with prediction data (no hard crash).

Key fallback helpers already implemented:

- `buildFuelFallback(...)`
- `buildCommuteFallback(...)`
- `ForecastAdapter.getFuelTrend(...)`
- `ForecastAdapter.getCommuteWindow(...)`

## 2) Assistant layer (Simulation first, then Qwen)

Frontend files:

- `MVP/src/lib/simulationEngine.js`
- `MVP/src/App.jsx` (`handleQwenAsk`)

Backend files:

- `assistant_service/app.py`
- `assistant_service/settings.py`

Behavior:

1. User asks a question.
2. `simulationReply(...)` tries scripted intent first.
3. If no script match, frontend calls assistant service (`/chat`) using Qwen.
4. If Qwen service fails, frontend still falls back to local deterministic response (`buildAssistantReply`).

So the stack is:

- simulation intent -> Qwen -> local deterministic fallback

---

## Qwen Model Selection

Configure in `.env` or shell env:

```env
QWEN_MODEL=qwen-plus
```

Common options:

- `qwen-plus` (balanced default)
- `qwen-turbo` (faster/cheaper)
- `qwen-max` (stronger quality)

Also required:

```env
DASHSCOPE_API_KEY=your_key_here
```

Assistant service reads these in:

- `assistant_service/settings.py`

---

## Mock Data You Can Safely Adjust

To tune predictive behavior without UI changes:

## Forecast seed scenarios

Edit:

- `MVP/src/lib/forecastAdapter.js` -> `scenarioData`

Useful fields:

- `fuelTrend.deltaVnd`
- `fuelTrend.confidence`
- `commuteWindow.etaRangeMin`
- `commuteWindow.bestDepartureTime`
- `status.fallbackMode`

## Route and vehicle behavior

Edit:

- `MVP/src/lib/predictionEngine.js`
- `MVP/src/data/mockData.js`

Useful fields:

- route consumption (`litresUsed`, `kwhUsed`)
- scenario prices (`fuelPriceVndPerLitre`, `chargePriceVndPerKwh`)
- route ETA adjustments (`etaAdjustments`)

---

## Test Plan

## A) Happy path: TimesFM + Qwen both online

1. Start TimesFM service on `8008`.
2. Start assistant service on `8009`.
3. Start frontend (`MVP`) on `4173`.
4. Open app and verify:
   - commute/fuel values load,
   - assistant can answer non-scripted prompt via Qwen.

Quick checks:

- TimesFM health:
  - `http://127.0.0.1:8008/health`
- Assistant health:
  - `http://127.0.0.1:8009/health`

## B) TimesFM failure fallback (Qwen still online)

1. Stop TimesFM service.
2. Keep assistant service running.
3. Refresh app.
4. Verify:
   - no crash,
   - forecast values still appear (seeded fallback),
   - assistant still responds through Qwen for non-scripted prompts.

Expected behavior source:

- `ForecastAdapter.getFuelTrend/getCommuteWindow` fallback branches.

## C) Qwen failure fallback

1. Keep frontend running.
2. Stop assistant service or remove `DASHSCOPE_API_KEY`.
3. Ask a non-scripted question.
4. Verify:
   - app does not break,
   - local deterministic fallback response is shown.

Expected behavior source:

- `MVP/src/App.jsx` -> `handleQwenAsk()` catch block (`buildAssistantReply`).

## D) Full degraded mode (TimesFM + Qwen both unavailable)

1. Stop TimesFM service.
2. Stop assistant service.
3. Refresh app and test chat.
4. Verify:
   - forecast still from seeded fallback,
   - assistant still works with simulation + local deterministic fallback.

---

## Verification Checklist

- [ ] Routes/Dashboard still render with no runtime errors.
- [ ] TimesFM outage does not break prediction UX.
- [ ] Non-scripted chat uses Qwen when available.
- [ ] Qwen outage does not break chat UX.
- [ ] No UI changes required for these runtime modes.

---

## Recommended Environment (.env)

```env
# TimesFM / model loading
HUGGINGFACE_API_KEY=your_hf_token

# Qwen assistant
DASHSCOPE_API_KEY=your_dashscope_key
QWEN_MODEL=qwen-plus

# Optional frontend overrides
VITE_TIMESFM_SERVICE_URL=http://127.0.0.1:8008
VITE_ASSISTANT_SERVICE_URL=http://127.0.0.1:8009
```

---

## Notes

- TimesFM is designed for forecast tasks, not generic chat.
- Qwen is designed for natural-language assistant responses.
- The current implementation already supports robust fallback chaining; this runbook documents how to operate and test it reliably.
