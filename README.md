# DriveMate

DriveMate is a VETC-oriented driving assistant MVP built around one daily decision loop:

`when to leave + which route to take + when to refuel`

The repo contains a React frontend plus two FastAPI services:

- `timesfm_service/` for forecast endpoints
- `assistant_service/` for chat via DashScope/Qwen

## Project Layout

- `MVP/` - React + Vite frontend
- `assistant_service/` - FastAPI chat service
- `timesfm_service/` - FastAPI forecasting service
- `data/` - local CSV/mock data used by the prototype
- `docker-compose.yml` - full-stack local container setup
- `Setup.md` - older implementation/setup notes

## Prerequisites

- Node.js 18+
- Python 3.11+
- Docker Desktop (optional, only for Docker flow)

## Run locally

The easiest dev flow is from the repo root:

```powershell
npm run dev
```

That root script delegates to `MVP/scripts/start-dev-stack.ps1`, which:

- creates `.venv/` on first run if needed
- installs the Python packages required by the local services
- installs `MVP/node_modules` if missing
- starts `timesfm_service` on `http://127.0.0.1:8008`
- starts `assistant_service` on `http://127.0.0.1:8009`
- launches the frontend on `http://127.0.0.1:4173`

First run can take a while because the TimesFM sidecar may need to download model files.

### Manual run

If you want separate terminals instead of the helper script, use:

```powershell
# terminal 1
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install fastapi "uvicorn[standard]" numpy pydantic python-dotenv torch httpx
.venv\Scripts\python -m uvicorn timesfm_service.app:app --host 127.0.0.1 --port 8008
```

```powershell
# terminal 2
.venv\Scripts\python -m uvicorn assistant_service.app:app --host 127.0.0.1 --port 8009
```

```powershell
# terminal 3
cd MVP
npm install
npm run dev
```

Useful local health checks:

- TimesFM: `http://127.0.0.1:8008/health`
- Assistant: `http://127.0.0.1:8009/health`
- Frontend: `http://127.0.0.1:4173`

## Docker

To run the full stack with Docker Compose:

```powershell
copy .env.example .env
docker compose up --build -d
```

Then open:

- App: `http://localhost`
- TimesFM health: `http://localhost/api/forecast/health`
- Assistant health: `http://localhost/api/assistant/health`
- Chat endpoint: `http://localhost/api/chat`

Stop the stack with:

```powershell
docker compose down
```

## Environment

Create a root `.env` file from the example:

```powershell
copy .env.example .env
```

Expected variables include:

- `HUGGINGFACE_API_KEY`
- `DASHSCOPE_API_KEY`
- `QWEN_MODEL`

## Workspace Commands

From the repo root:

```powershell
npm run dev
npm run dev:web
npm run lint
npm run build
```

From `MVP/`:

```powershell
npm run dev
npm run dev:stack
npm run lint
npm run build
```

## Docs

- `MVP/docs/PITCH.md`
- `MVP/docs/DEMO_SCRIPT.md`
- `MVP/docs/FINAL_CHECKLIST.md`
- `MVP/docs/DEVPOST.md`
- `MVP/docs/TIMESFM_QWEN_RUNTIME.md`
