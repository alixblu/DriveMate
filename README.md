# DriveMate

DriveMate AI is an AI driving companion integrated into VETC.

The goal is to evolve VETC from a toll-payment utility into a daily-use mobility assistant.

The current MVP is built around one daily decision loop:

`when to leave + which route to take + when to refuel`

Instead of competing with navigation apps on ETA alone, DriveMate optimizes for `time + toll + fuel cost` using a VETC-native product story.

## Project Layout

- `MVP/` - React + Vite MVP
- `build_spec.txt` - original product build spec
- `convo.txt` - early voice demo copy

## Run locally (dev mode)

Open **3 separate terminals** in repo root (`D:\GitRepo\DriveMate\`).

### 1) TimesFM sidecar

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r timesfm_service\requirements.txt
.venv\Scripts\python -m uvicorn timesfm_service.app:app --host 127.0.0.1 --port 8008
```

First run downloads the TimesFM model (~1.5 GB), which can take 5-15 minutes.

### 2) Qwen assistant service

```powershell
.venv\Scripts\python -m pip install -r assistant_service\requirements.txt
.venv\Scripts\python -m uvicorn assistant_service.app:app --host 127.0.0.1 --port 8009
```

### 3) React frontend

```powershell
cd MVP
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:4173`.

## Run locally with Docker

You can run the full stack (frontend + TimesFM + assistant) with Docker Compose.

### 1) Prepare env file

```powershell
copy .env.example .env
# edit .env and set:
# HUGGINGFACE_API_KEY=...
# DASHSCOPE_API_KEY=...
```

### 2) Build and start services

```powershell
docker compose up --build -d
```

### 3) Open app + check health

- App: `http://localhost`
- TimesFM health: `http://localhost/api/forecast/health`
- Assistant health: `http://localhost/api/assistant/health`

### 4) Stop services

```powershell
docker compose down
```

## Environment setup

```powershell
copy .env.example .env
# edit .env and set:
# HUGGINGFACE_API_KEY=...
# DASHSCOPE_API_KEY=...
```

## Docs

- `MVP/docs/PITCH.md`
- `MVP/docs/DEMO_SCRIPT.md`
- `MVP/docs/FINAL_CHECKLIST.md`
