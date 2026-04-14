# DriveMate AI Prototype

DriveMate AI is a React + Vite hackathon MVP for a VETC-integrated driving assistant.

## Core Story

The app helps Vietnamese drivers decide:

- when to leave
- which route to take
- when to refuel

The hero workflow is:

`Fuel rises tomorrow -> warn tonight -> open the Daily Decision Card -> choose the best-value route -> see expected weekly savings`

## Commands

```bash
npm install
npm run dev
npm run dev:stack
npm run lint
npm run build
```

`npm run dev` now starts the frontend on `http://127.0.0.1:4173` using Vite's native config loader for better Windows reliability.

`npm run dev:stack` starts both the frontend and the TimesFM sidecar. The sidecar boots on `http://127.0.0.1:8008`, and the app will automatically promote itself from seeded startup data to live TimesFM forecasts once the model finishes warming.

## Demo Links

The app supports query params for pitch-friendly deep links:

- `/?tab=home&scenario=fuel-hike`
- `/?tab=routes&scenario=fuel-hike`
- `/?tab=assistant&scenario=fuel-hike`
- `/?tab=wallet&scenario=fuel-hike`
- `/?tab=home&scenario=fallback`

## Repo Assets

- `docs/PITCH.md` - pitch framing
- `docs/DEMO_SCRIPT.md` - live demo walkthrough
- `docs/FINAL_CHECKLIST.md` - launch checklist
- `scripts/capture-demo-assets.ps1` - helper to capture backup screenshots with Edge/Chrome headless
