# DriveMate AI - Devpost Draft

## Inspiration

Most mobility apps are still opened only when users need a single utility, like paying tolls, checking a route, or topping up a wallet. We wanted to change that behavior by turning VETC from a transactional app into something drivers would want to open every day.

Our core question was simple:

**What if a toll-payment app could think ahead for the driver?**

That idea became **DriveMate AI**: an intelligent driving companion that helps users decide when to leave, which route gives the best overall value, and when to refuel or top up before friction happens.

Instead of optimizing only for ETA, DriveMate is built around a more realistic daily decision model: **time + toll cost + fuel/energy cost + service convenience**.

---

## What It Does

DriveMate AI transforms VETC from a toll-payment utility into a more proactive daily mobility assistant.

### Key Features

- **Predictive Commute Planning**  
  Forecasts commute windows and helps users decide the best time to leave before congestion builds up.

- **Smart Route Recommendations**  
  Frames route choices around fastest, cheapest, and best-value options using travel time, toll cost, and fuel/energy trade-offs.

- **Wallet Protection and Top-Up Guidance**  
  Predicts trip-related spending risk and prompts users to top up before toll interruptions happen.

- **Fuel Trend Intelligence**  
  Detects fuel price movement and turns it into practical advice for trip timing and spending awareness.

- **AI Driving Assistant**  
  Lets drivers ask natural questions like:
  - What is the best route today?
  - Should I top up before leaving?
  - What is causing the delay on my commute?

- **Mobility Ecosystem Recommendations**  
  Extends beyond routing into nearby parking, charging, and other VETC-relevant services so the assistant can recommend the next best action, not just show information.

- **Graceful AI Fallback**  
  Even when live forecasting is still warming up or temporarily unavailable, the product continues working with seeded recommendations so the experience stays reliable.

---

## How We Built It

### Frontend

We built the MVP as a **React + Vite** web app with a mobile-first product flow. The UI includes key surfaces like the dashboard, route comparison experience, assistant page, notifications, and wallet-oriented decision prompts.

We also used **Leaflet** and **React Leaflet** to support route and map-based experiences.

### Backend

We used a lightweight **FastAPI** microservice architecture:

- a forecasting sidecar for predictive trip signals
- a separate assistant service for conversational AI
- frontend integration that upgrades from seeded values to live outputs when the model is ready

### AI Layer

The intelligence layer combines forecasting and assistant behavior:

- **TimesFM** powers predictive forecasting for commute windows and fuel trends
- **Qwen via Alibaba Cloud DashScope** powers the AI chat assistant
- product logic turns predictions into recommended actions such as leaving earlier, choosing a better-value route, or topping up wallet balance

### Data

To make the prototype realistic, we used structured demo and synthetic data representing:

- trip patterns
- route options
- toll-related context
- fuel trend signals
- parking and charging touchpoints
- wallet usage behavior
- recommendation states across the user journey

This let us simulate a believable daily driving assistant without needing a large live production dataset.

---

## Challenges We Ran Into

- Designing AI that felt genuinely useful instead of decorative
- Turning prediction into action instead of just showing another dashboard
- Combining route, wallet, fuel, and assistant flows into one simple user experience
- Building a believable mobility dataset quickly for demo purposes
- Keeping the app resilient while live AI services warm up or fail
- Balancing hackathon speed with a product direction that could scale beyond the demo

---

## Accomplishments That We're Proud Of

- Built a clear product story for turning VETC into a daily-use mobility assistant
- Integrated live forecasting into the MVP instead of stopping at static mock recommendations
- Added a real conversational assistant powered by Qwen
- Connected prediction with practical actions like route choice and wallet top-up guidance
- Designed a product direction that expands naturally into parking, charging, and other ecosystem services
- Created a prototype that is both demo-friendly and aligned with a realistic enterprise rollout path

---

## What We Learned

- AI feels most valuable when it helps users make a decision, not just consume information
- Daily habit formation comes from reducing friction in recurring moments
- Product framing matters as much as model capability
- Reliability and fallback behavior are essential for trust in AI-assisted experiences
- Even with synthetic data, a strong decision loop can make the product feel concrete and credible
- The strongest hackathon demos connect technical implementation to measurable business value

---

## What's Next for DriveMate

- Improve parking and charging recommendations with more location-specific constraints
- Strengthen wallet protection logic based on route risk and predicted spend
- Expand post-commute recommendations such as car wash and convenience stops
- Improve personalization using repeat driving behavior and prior user actions
- Deepen real-time traffic and ecosystem integrations
- Evolve DriveMate into a broader VETC intelligence layer for daily mobility decisions

**Long-term vision:**  
From toll-payment utility to an intelligent mobility ecosystem built around predictive, action-oriented driving assistance.

---

## Tech Stack

| Category | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 19 | Main user interface |
| Frontend Build | Vite | Fast local development and production builds |
| Mapping UI | Leaflet, React Leaflet | Route and map-based experiences |
| Backend API | FastAPI | Forecast and assistant microservices |
| AI Forecasting | TimesFM | Commute-window and fuel-trend prediction |
| AI Assistant | Qwen via Alibaba Cloud DashScope | Conversational driving assistant |
| Language | JavaScript, Python | Frontend and backend implementation |
| Data Modeling | Synthetic mobility datasets | Demo trip, route, wallet, and service behavior |
| Infra / Proxy | Docker, Nginx | Containerization and service routing |
| Cloud Direction | Alibaba Cloud ECS / Function Compute | Deployment path for scalable production rollout |
