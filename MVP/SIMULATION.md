# DriveMate MVP Simulation Guide

## What Was Implemented

This MVP now focuses on two product surfaces:

1. `Routes` tab
2. `DriveMate AI` experience

The implementation is simulation-first, but it is designed to feel like a real mobility product:

- The `Routes` tab now uses a real Leaflet + OpenStreetMap map instead of the old SVG-only route view.
- Users can type a destination into the route search box or tap one of the supported destination chips.
- The map shows nearby simulation POIs that DriveMate can reference in recommendations:
  - toll stations
  - gas stations
  - charging stations
  - parking lots
  - car wash locations
  - coffee stop
- The floating DriveMate AI overlay keeps the POC-style interaction pattern:
  - floating AI button opens the overlay
  - voice capture starts from the mic button
  - user and assistant transcripts render as side-by-side chat bubbles
  - live listening / transcribing state appears directly in the conversation thread
- Assistant replies are simulation-first:
  - try local scripted response first
  - fall back to the Qwen-backed assistant service when no simulation intent matches

## How It Works

### Routes Tab

The real map is powered by:

- `leaflet`
- `react-leaflet`
- OpenStreetMap tiles

Route rendering behavior:

- Three route variants are shown on the map:
  - `Best Value`
  - `Fastest`
  - `Cheapest`
- Clicking a route line selects that route.
- Destination changes update which polyline endpoint is shown for the simulation.
- Nearby POIs are filtered to match the active destination cluster, so the map stays relevant instead of showing unrelated markers everywhere.

### DriveMate AI

The assistant behavior is split into two layers:

1. Simulation layer
2. Qwen fallback layer

Simulation layer:

- Uses `src/lib/simulationEngine.js`
- Handles the common scripted demo flows instantly
- Keeps the experience stable even if the remote assistant is unavailable

Qwen fallback layer:

- Runs only when the user asks something outside the scripted simulation intents
- Uses the assistant service configured by `VITE_ASSISTANT_SERVICE_URL`

### Voice and Transcripts

Voice input behavior in the current MVP:

- User voice capture uses the browser speech recognition API already present in the app
- The recognized live transcript is shown while listening/transcribing
- Final text is sent through the simulation-first assistant flow
- The assistant response is added into the same transcript thread

## Supported Destinations

These are the supported simulation destinations for text entry and voice prompts:

1. `People's Committee Office`
   - keywords: `committee`, `office`, `district 1`, `nguyen hue`
2. `Highlands Coffee Landmark`
   - keywords: `highlands`, `coffee`, `cafe`
3. `Central Toll Plaza`
   - keywords: `central toll`, `toll plaza`
4. `Thu Duc Toll Gate`
   - keywords: `thu duc toll`, `thu duc gate`
5. `Nguyen Hue Smart Parking`
   - keywords: `parking`, `smart parking`, `nguyen hue parking`

If the user enters an unsupported destination, the simulation falls back to:

- `People's Committee Office`

## Supported POIs On The Map

The simulation currently shows these nearby categories:

- toll stations
- gas stations
- charging stations
- parking lots
- car wash locations
- destination markers
- coffee stop

Example POIs included in the simulation:

- `Thu Duc Toll Gate`
- `Central Toll Plaza`
- `Petrolimex Station 25`
- `VETC Charging Thu Duc`
- `Saigon Centre EV Hub`
- `Nguyen Hue Smart Parking`
- `Le Loi Public Parking`
- `Bach Dang Express Wash`
- `Highlands Coffee Landmark`

## Supported Conversation Flows

The simulation assistant currently recognizes these intent groups:

1. Greeting
   - examples: `hi`, `hello`, `good morning`
2. Vehicle selection
   - examples: `VinFast`, `VF 8`, `electric`, `Volvo`, `diesel`
3. Route query
   - examples: `best route`, `which way`, `how do I get there`
4. Start navigation
   - examples: `start`, `navigate`, `let's go`
5. Coffee stop reminder
   - examples: `coffee`, `highlands`, `remind me`
6. Traffic question
   - examples: `traffic`, `jam`, `congestion`
7. EV energy / charging cost
   - examples: `energy cost`, `electricity`, `charging cost`
8. ICE fuel cost
   - examples: `fuel cost`, `petrol cost`
9. Parking reservation
   - examples: `parking`, `reserve a spot`
10. Wallet / top-up
   - examples: `wallet`, `top up`, `balance`
11. Rewards / loyalty
   - examples: `points`, `voucher`, `reward`
12. Weekly recap
   - examples: `this week`, `weekly recap`
13. Destination inference
   - examples: `I'm heading to Nguyen Hue`, `going to the committee office`

## Files Added / Updated

Main implementation files:

- `src/components/LeafletMap.jsx`
- `src/data/mapData.js`
- `src/pages/RoutesPage.jsx`
- `src/components/VoiceChatOverlay.jsx`
- `src/pages/AssistantPage.jsx`
- `src/lib/simulationEngine.js`
- `src/App.jsx`
- `src/App.css`

## Demo Notes

Best demo path:

1. Open `Routes`
2. Search for `People's Committee Office` or `Highlands Coffee Landmark`
3. Tap between `Best Value`, `Fastest`, and `Cheapest`
4. Open the floating `DriveMate AI` button
5. Ask:
   - `What's the best route today?`
   - `I'm taking the VinFast VF 8`
   - `Any traffic I should know about?`
   - `Reserve parking for me`
   - `Do I need to top up my wallet?`

## Current Simulation Constraint

This MVP is intentionally scoped:

- location search only supports the destinations listed above
- POIs are curated and nearby, not fetched live from a maps API
- route geometry is simulated but rendered on a real map
- voice recognition uses in-browser recognition, while assistant replies are simulation-first with Qwen fallback
