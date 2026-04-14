# DriveMate

DriveMate AI is a fuel-first mobility assistant prototype for VETC.

The current MVP is built around one daily decision:

`when to leave + which route to take + when to refuel`

Instead of competing with navigation apps on ETA alone, DriveMate optimizes for `time + toll + fuel cost` using a VETC-native product story.

## Project Layout

- `MVP/` - React + Vite MVP
- `build_spec.txt` - original product build spec
- `convo.txt` - early voice demo copy

## Run

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

## Docs

- `MVP/docs/PITCH.md`
- `MVP/docs/DEMO_SCRIPT.md`
- `MVP/docs/FINAL_CHECKLIST.md`
