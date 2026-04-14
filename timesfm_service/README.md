# DriveMate TimesFM Sidecar

This service keeps TimesFM behind stable, product-shaped endpoints so the Vite frontend can stay focused on the commute-card experience.

## Endpoints

- `GET /health`
- `POST /forecast/commute-window`
- `POST /forecast/fuel-trend`

## Local setup

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r timesfm_service\requirements.txt
.venv\Scripts\python -m uvicorn timesfm_service.app:app --reload --port 8008
```

Optional frontend env var:

```powershell
$env:VITE_TIMESFM_SERVICE_URL="http://127.0.0.1:8008"
```

## Notes

- `commute-window` is the must-have live-model path.
- `fuel-trend` is confidence-gated and may intentionally fall back to seeded values.
- If TimesFM or PyTorch is unavailable, the service still boots and reports a degraded `/health` response so the frontend can safely fall back.
