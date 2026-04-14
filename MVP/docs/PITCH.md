# DriveMate AI Pitch Notes

## One-liner
DriveMate AI turns VETC from a low-frequency toll-payment utility into a daily driving companion that helps Vietnamese drivers decide when to leave, which route to take, and when to refuel to minimize total trip cost.

## Problem
- VETC is useful but low frequency. Users open it when they need to pay tolls, not every day.
- Vietnamese drivers care about fuel prices, toll spend, and traffic timing every morning.
- Current navigation apps optimize mostly for time, but they do not deeply own toll wallet and payment behavior.

## Wedge
- Google Maps and Waze optimize time.
- DriveMate optimizes `time + toll + fuel cost`.
- VETC already owns the toll and wallet context, so this recommendation layer is more native and defensible.

## Hero Demo Story
1. Fuel is forecast to rise by `+500 VND/L` tomorrow.
2. DriveMate warns the user tonight.
3. The user opens the app and sees one `Daily Decision Card`.
4. The card recommends when to leave, which route to take, and whether to refuel now.
5. The user sees expected weekly savings in VND.

## Why This Fits The Judging Criteria
- `Problem relevance`: solves a real DAU and retention problem for a real toll/payment product.
- `Quality of solution`: clear user workflow, easy to demo, grounded in daily habits.
- `Use of AI`: AI is specific, not decorative.
- `Use of Qwen / Alibaba Cloud`: Qwen explains structured recommendations in natural language for the commute card, assistant, and weekly recap.
- `Execution`: the MVP is already a working prototype with scenario switching and fallback mode.
- `Pitch clarity`: one story, one hero workflow, one emotional hook.

## AI Architecture
- `ForecastAdapter.getFuelTrend(date, area)`:
  returns tomorrow's fuel price direction, confidence, and weekly impact.
- `ForecastAdapter.getCommuteWindow(userProfile, date)`:
  returns ETA range, traffic band, and best departure window.
- `Recommendation engine`:
  scores exactly 3 routes using time + toll + fuel.
- `Qwen narrative layer on Alibaba Cloud`:
  turns structured outputs into the explanation shown in the Daily Decision Card and assistant.
- `Fallback mode`:
  if live forecasting is unavailable, seeded outputs preserve the same demo story.

## What To Emphasize Out Loud
- We are not building “AI everywhere.”
- We are building one daily decision moment that makes VETC worth opening every morning.
- Fuel intelligence is the emotional hook.
- Wallet and rewards are support systems, not the main event.
