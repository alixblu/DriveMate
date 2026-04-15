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

### Step 5 — Deploy to Alibaba Cloud ECS

#### 5a. Provision an ECS instance

In the Alibaba Cloud console:
1. Go to **ECS → Instances → Create Instance**
2. Recommended spec: `ecs.c7.2xlarge` (8 vCPU / 16 GB RAM) — TimesFM needs ~4 GB RAM
3. OS: **Ubuntu 22.04 LTS**
4. Storage: 40 GB system disk + 50 GB data disk (for the model cache)
5. In **Security Group**, open:
   - Port **80** (HTTP) — inbound from `0.0.0.0/0`
   - Port **22** (SSH) — inbound from your IP only
   - Ports 8008, 8009 stay closed to public (Nginx handles them internally)

#### 5b. Install Docker on ECS

SSH into your ECS instance, then:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version   # should print Docker Compose version
```

#### 5c. Copy project files to ECS

From your local machine:

```bash
# Option A: SCP
scp -r D:\GitRepo\DriveMate ubuntu@YOUR_ECS_IP:~/drivemate

# Option B: Git clone (if repo is on GitHub)
ssh ubuntu@YOUR_ECS_IP
git clone https://github.com/YOUR_USERNAME/DriveMate ~/drivemate
```

#### 5d. Set up `.env` on ECS

```bash
ssh ubuntu@YOUR_ECS_IP
cd ~/drivemate
cp .env.example .env
nano .env
# Fill in HUGGINGFACE_API_KEY and DASHSCOPE_API_KEY
```

#### 5e. Build and start all services

```bash
cd ~/drivemate
docker compose build       # takes 5–10 min first time (builds 3 images)
docker compose up -d       # starts all 3 containers in background
```

Watch TimesFM warm up:

```bash
docker compose logs -f timesfm_service
# Wait for: "Application startup complete."
# First run downloads ~1.5 GB model from Hugging Face
```

#### 5f. Verify deployment

```bash
# All containers running?
docker compose ps

# TimesFM health
curl http://localhost/api/forecast/health

# Assistant health
curl http://localhost/api/assistant/health

# Test Qwen chat
curl -X POST http://localhost/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Which route should I take today?","context":null}'
```

Then open `http://YOUR_ECS_IP/` in a browser — the full app should load.

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
