# DriveMate MVP — Implementation Plan & Setup Guide

## What Was Built

Three pieces were added to the existing MVP codebase:

1. **Live TimesFM wiring** — Frontend now calls the TimesFM sidecar on startup; seeded data upgrades to live predictions automatically when the model finishes loading.
2. **Qwen AI chat** — A new `assistant_service/` FastAPI microservice connects to Alibaba Cloud DashScope and powers the real chat thread in AssistantPage.
3. **Docker + Nginx deployment** — Full stack can be built and run on Alibaba Cloud ECS with one `docker compose up` command.

---

## Files Changed or Created

### Edited
| File | What changed |
|------|-------------|
| `MVP/src/lib/forecastAdapter.js` | Added `loadLiveForecast()` + `pollTimesFMHealth()` exports |
| `MVP/src/lib/predictionEngine.js` | `createDriveMateSnapshot()` accepts live `fuelTrend`/`commuteWindow`; adds `fuelAlert` field |
| `MVP/src/App.jsx` | Health poll + forecast load effects; `handleQwenAsk`; passes live props to pages |
| `MVP/src/pages/Dashboard.jsx` | "Warming up..." badge; live departure dot; ETA range strip |
| `MVP/src/pages/AssistantPage.jsx` | Traffic selector (Normal/Rain/Incident); real Qwen chat thread + composer |
| `MVP/src/pages/NotificationsPage.jsx` | Live fuel alert at top of list when surge > 200 VND/L |
| `MVP/src/App.css` | 6 new CSS utility classes |
| `.env.example` | Added `DASHSCOPE_API_KEY`, `QWEN_MODEL`, tuning vars |

### Created
| File | Purpose |
|------|---------|
| `assistant_service/__init__.py` | Python package marker |
| `assistant_service/settings.py` | Reads `DASHSCOPE_API_KEY` from `.env` |
| `assistant_service/app.py` | FastAPI — `GET /health` + `POST /chat` via DashScope Qwen |
| `assistant_service/requirements.txt` | fastapi, uvicorn, httpx, pydantic, python-dotenv |
| `assistant_service/Dockerfile` | python:3.12-slim, port 8009 |
| `timesfm_service/Dockerfile` | python:3.11-slim + torch CPU, port 8008 |
| `Dockerfile.frontend` | Multi-stage Node 20 → nginx:alpine |
| `nginx.conf` | `/api/forecast/*` → TimesFM, `/api/chat` → Qwen, SPA fallback |
| `docker-compose.yml` | 3-service stack with persistent model cache volumes |

---

## Step-by-Step: What You Need to Do Now

### Step 0 — Prerequisites on your machine

You need:
- **Node.js 18+** — for the React frontend
- **Python 3.11+** — for both Python services
- **Git** — already have it

---

### Step 1 — Get API Keys

#### 1a. Hugging Face token (for TimesFM model download)
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with **Read** permission
3. Copy it — looks like `hf_xxxxxxxxxxxxxxxxxxxx`

#### 1b. Alibaba Cloud DashScope key (for Qwen AI chat)
1. Go to https://dashscope.aliyun.com/
2. Sign up / log in with an Alibaba Cloud account
3. Go to **API Keys** in the console
4. Create a new API key
5. Copy it — looks like `sk-xxxxxxxxxxxxxxxxxxxx`

---

### Step 2 — Set Up Your `.env` File

In the repo root (`D:\GitRepo\DriveMate\`), create a `.env` file:

```bash
# Copy the example first
cp .env.example .env
```

Then open `.env` and fill in your real keys:

```
HUGGINGFACE_API_KEY=hf_your_actual_token_here
DASHSCOPE_API_KEY=sk_your_actual_key_here
QWEN_MODEL=qwen-plus
TIMESFM_ENABLE_LIVE_FUEL=1
```

> **Important:** Never commit `.env` to git. It is already in `.gitignore`.

---

### Step 3 — Run Locally (Dev Mode)

Open **3 separate terminals** in `D:\GitRepo\DriveMate\`:

#### Terminal 1 — TimesFM sidecar

```bash
cd timesfm_service
pip install -r requirements.txt
cd ..
uvicorn timesfm_service.app:app --host 127.0.0.1 --port 8008
```

> First run downloads the TimesFM model (~1.5 GB). This takes 5–15 minutes.
> Watch for: `Application startup complete.`
> The frontend will show "Warming up..." on the Dashboard badge and auto-promote once the model is ready.

#### Terminal 2 — Qwen assistant service

```bash
cd D:\GitRepo\DriveMate
pip install -r assistant_service/requirements.txt
uvicorn assistant_service.app:app --host 127.0.0.1 --port 8009
```

> Should start in seconds. Verify with:
> `curl http://127.0.0.1:8009/health`
> Expected: `{"status":"ready","model":"qwen-plus","apiKeyConfigured":true}`

#### Terminal 3 — React frontend

```bash
cd D:\GitRepo\DriveMate\MVP
npm install
npm run dev
```

> Opens on `http://127.0.0.1:4173`

---

### Step 4 — Verify It Works

Open `http://127.0.0.1:4173` in your browser and check:

| Feature | What to look for |
|---------|-----------------|
| **Dashboard badge** | Shows "Warming up..." → changes to "82% likely" after TimesFM loads |
| **Dashboard departure time** | Shows green dot `●` next to leave time once TimesFM is live |
| **AssistantPage traffic selector** | Normal / Rain / Incident buttons — Rain adds +5 min to ETA |
| **AssistantPage chat** | Type a message → Qwen reply appears within ~5 seconds |
| **AssistantPage quick prompts** | Chips pre-fill the chat input |
| **NotificationsPage** | "Live fuel alert" appears at top if fuel delta > 200 VND/L |

If TimesFM is still loading, the app still works with seeded data — no blank screens.

---

### Step 5 — Deploy to Alibaba Cloud Function Compute (FC)

This stack has 3 deployable parts:

1. `timesfm_service` (forecast API)
2. `assistant_service` (Qwen chat API)
3. `MVP` frontend (static site)

Recommended production shape:

- Backend APIs on **Function Compute 3.0 (Custom Container Runtime)**
- Frontend on **OSS static website** (or FC web function if you prefer)
- Unified public entry via **API Gateway** + custom domain

#### 5a. Prepare Alibaba Cloud resources

In Alibaba Cloud console:

1. Create a **Resource Group** for DriveMate.
2. Create a **Container Registry (ACR)** namespace + repo:
   - `drivemate/timesfm-service`
   - `drivemate/assistant-service`
3. Create a **Function Compute 3.0** service, for example `drivemate-prod`.
4. (Recommended) Create a **NAS file system** and mount target for model cache.
   - TimesFM first load downloads ~1.5 GB; NAS avoids repeated cold downloads.
5. Create an **API Gateway** HTTP API (or use FC built-in HTTP trigger first).

#### 5b. Build and push backend images

From repo root on your local/dev machine:

```bash
# Login to Alibaba ACR
docker login --username=<your_account> <your_registry>.cn-<region>.cr.aliyuncs.com

# Build TimesFM image
docker build -f Dockerfile.timesfm -t <your_registry>.cn-<region>.cr.aliyuncs.com/drivemate/timesfm-service:latest .
docker push <your_registry>.cn-<region>.cr.aliyuncs.com/drivemate/timesfm-service:latest

# Build Assistant image
docker build -f Dockerfile.assistant -t <your_registry>.cn-<region>.cr.aliyuncs.com/drivemate/assistant-service:latest .
docker push <your_registry>.cn-<region>.cr.aliyuncs.com/drivemate/assistant-service:latest
```

#### 5c. Create FC function: `timesfm_service`

In **Function Compute → Service `drivemate-prod` → Create Function**:

1. Runtime type: **Custom Container**.
2. Image: `.../drivemate/timesfm-service:latest`.
3. Memory/CPU suggestion:
   - Start with **4 vCPU / 8 GB** (increase if latency is high).
4. Timeout: **120s** (or higher for warm-up tolerance).
5. Environment variables:
   - `HUGGINGFACE_API_KEY=<your_key>`
6. (Recommended) Mount NAS:
   - mount path example: `/mnt/nas`
   - set cache env for huggingface model directory if needed.
7. Enable HTTP trigger (temporary direct test).

Health check after deploy:

```bash
curl https://<timesfm_fc_public_url>/health
```

#### 5d. Create FC function: `assistant_service`

In the same FC service, create another function:

1. Runtime type: **Custom Container**.
2. Image: `.../drivemate/assistant-service:latest`.
3. Memory/CPU suggestion:
   - **1 vCPU / 2 GB** is usually enough.
4. Timeout: **30s**.
5. Environment variables:
   - `DASHSCOPE_API_KEY=<your_key>`
   - `QWEN_MODEL=qwen-plus` (or `qwen-turbo` / `qwen-max`)
6. Enable HTTP trigger.

Health check:

```bash
curl https://<assistant_fc_public_url>/health
```

#### 5e. Configure API Gateway routes (single public API domain)

Create routes and map to FC functions:

- `GET /api/forecast/health` -> `timesfm_service` `/health`
- `POST /api/forecast/commute-window` -> `timesfm_service` `/forecast/commute-window`
- `POST /api/forecast/fuel-trend` -> `timesfm_service` `/forecast/fuel-trend`
- `GET /api/assistant/health` -> `assistant_service` `/health`
- `POST /api/chat` -> `assistant_service` `/chat`

Make sure CORS is enabled for your frontend domain.

#### 5f. Deploy frontend (MVP) as static site

Build frontend:

```bash
cd MVP
npm install
npm run build
```

Upload `MVP/dist` to OSS bucket (example: `drivemate-web-prod`) and enable static website hosting:

- Index document: `index.html`
- Error document: `index.html` (for SPA routes)

Set frontend env before build (or in CI):

```env
VITE_TIMESFM_SERVICE_URL=https://<your_api_domain>/api/forecast
VITE_ASSISTANT_SERVICE_URL=https://<your_api_domain>/api
```

#### 5g. Validate end-to-end behavior

```bash
# TimesFM API (through API gateway)
curl https://<your_api_domain>/api/forecast/health

# Assistant API (through API gateway)
curl https://<your_api_domain>/api/assistant/health

# Qwen chat test
curl -X POST https://<your_api_domain>/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Which route should I take today?","context":null}'
```

Open frontend URL and verify:

- Dashboard forecast appears (TimesFM live or fallback seeded)
- Assistant returns Qwen answer for non-scripted prompts
- App still works if TimesFM is temporarily unavailable (seeded fallback path)

#### 5h. Recommended FC settings for stability

- Enable provisioned concurrency for TimesFM function (reduce cold starts).
- Keep TimesFM model cache on NAS.
- Use logs/metrics alarms for:
  - function timeout
  - 5xx rate
  - cold start latency
- Set gradual rollout by version/alias when updating images.

---

### Step 6 — Optional: Add a Domain + HTTPS

1. Buy a domain in Alibaba Cloud **DNS** console
2. Point an A record to your ECS IP
3. Install Certbot on ECS for a free SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Dashboard stuck on "Warming up..." | TimesFM model is still loading. Wait 5–15 min on first run. Check `docker compose logs timesfm_service`. |
| Chat returns fallback/generic answer | `DASHSCOPE_API_KEY` not set or wrong. Check `curl /api/assistant/health`. |
| `apiKeyConfigured: false` | `.env` file missing or key not set. Re-run `cp .env.example .env` and fill keys. |
| TimesFM container exits immediately | Not enough RAM. Upgrade ECS to 16 GB. |
| Port 80 refused | Security group rule missing. Add inbound TCP port 80 in Alibaba Cloud console. |

---

## Quick Command Reference

```bash
# Local dev — start everything
# Terminal 1: uvicorn timesfm_service.app:app --port 8008
# Terminal 2: uvicorn assistant_service.app:app --port 8009
# Terminal 3: cd MVP && npm run dev

# Docker — full stack
docker compose build
docker compose up -d
docker compose logs -f
docker compose down

# Check service health
curl http://localhost/api/forecast/health
curl http://localhost/api/assistant/health
```
