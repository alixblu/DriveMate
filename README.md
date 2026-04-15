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

## Run (Full stack)

```bash
npm run dev
```

That single command now starts both:

- the TimesFM FastAPI sidecar on `http://127.0.0.1:8008`
- the Vite frontend in `MVP/`

If you want to start it from inside the frontend folder instead:

```bash
cd MVP
npm run dev:stack
```

## Python setup (TimesFM sidecar)

If this is your first run, create a virtual environment and install the sidecar dependencies:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r timesfm_service\requirements.txt
```

Then copy env file and set your Hugging Face key:

```powershell
copy .env.example .env
# edit .env and set HUGGINGFACE_API_KEY
```

## Docs

- `MVP/docs/PITCH.md`
- `MVP/docs/DEMO_SCRIPT.md`
- `MVP/docs/FINAL_CHECKLIST.md`
