# DriveMate Dataset Guide

This folder stores demo data for routing, vehicles, users, fuel trends, and weather context.

## Data Files

- `users.csv`
  - Driver profile and commute anchors (home/work coordinates), plus wallet and reward state.
  - Key columns: `user_id`, `name`, `home_lat`, `home_lng`, `work_lat`, `work_lng`, `usual_departure_time`, `wallet_balance`, `reward_points`.

- `vehicles.csv`
  - Vehicles linked to each user.
  - Key columns: `vehicle_id`, `user_id`, `vehicle_name`, `brand`, `model`, `energy_type`, `is_primary`.

- `routes.csv`
  - Route-level summary used for route cards and recommendation labels.
  - Key columns: `route_id`, `route_name`, `eta_min`, `distance_km`, `toll_stations`, `total_toll`, `energy_cost`, `tag`.

- `route_points.csv`
  - Ordered latitude/longitude points for each route polyline.
  - Key columns: `route_id`, `seq`, `lat`, `lng`.

- `pois.csv`
  - Map points of interest used as markers (toll, gas, charging, coffee, destination).
  - Key columns: `poi_id`, `name`, `type`, `lat`, `lng`, `address`.

- `route_pois.csv`
  - POI sequence and ETA along each route (join table between routes and POIs).
  - Key columns: `route_id`, `poi_id`, `sequence`, `eta_min`.

- `fuel_price.csv`
  - Historical gasoline prices by date for cost trend context.
  - Example columns: `Date`, `Xăng RON 95-V price`, `Xăng RON 95-III price`, `Xăng E5 RON 92-II price`.

- `hcmc_weather.csv`
  - Ho Chi Minh City weather history for traffic/energy insights.
  - Key columns include temperature, humidity, visibility, wind, pressure, and weather description.

- `traffic_history.csv`
  - Historical traffic patterns by route, date, and time slot for baseline congestion prediction.
  - Key columns: `route_id`, `date`, `day_of_week`, `time_slot`, `avg_eta_min`, `avg_speed_kmh`, `traffic_level`, `rain_flag`.

- `incidents.csv`
  - Disruption events that can increase delay on top of normal traffic.
  - Key columns: `incident_id`, `date`, `time`, `route_id`, `type`, `severity`, `delay_min`.

## How To Use In Demo

### 1) Show Polyline

Use `route_points.csv` to draw route path.

Basic flow:
- Filter rows by selected `route_id` (example: `R1`).
- Sort by `seq`.
- Map each row to `[lat, lng]`.
- Render as a polyline.

### 2) Show Markers

Use `pois.csv`.

Basic flow:
- Render one marker per POI using `lat`/`lng`.
- Style marker icon by `type` (`toll_station`, `charging_station`, `gas_station`, `coffee_shop`, `destination`).

### 3) Show Stops Along Way

Use `route_pois.csv`.

Basic flow:
- Filter by selected `route_id`.
- Sort by `sequence`.
- Join each row with `pois.csv` on `poi_id` to get stop name and type.
- Display timeline using `eta_min`.

Example timeline (R1):
- Toll in 8 mins
- Charging in 10 mins
- Gas in 12 mins
- Coffee in 24 mins
- Destination in 35 mins

### 4) Predict Traffic Jam

Use `traffic_history.csv` + `incidents.csv`.

Basic flow:
- Filter `traffic_history.csv` by selected `route_id`, current `day_of_week`, and nearest `time_slot`.
- Use `avg_eta_min`, `avg_speed_kmh`, and `traffic_level` as the baseline forecast.
- If `rain_flag = 1`, raise jam risk (for demo, you can add a small delay buffer).
- Join with `incidents.csv` on `route_id` + current date/time window.
- Add incident `delay_min` to baseline ETA when incidents exist.

Example output:
- "Forecast: jam likely from 07:50 to 08:30 on R1"
- "Expected extra delay: 15 mins due to Accident"
- "Leave before 08:10 to save around 12 mins"

## Recommended Join Order

For a selected route:
- `routes.csv` -> summary card
- `route_points.csv` -> polyline
- `route_pois.csv` + `pois.csv` -> stop timeline + marker emphasis

Optional enrichments:
- `vehicles.csv` + `users.csv` -> personalize EV/Fuel wording
- `fuel_price.csv` + `hcmc_weather.csv` -> contextual cost/traffic insights
- `traffic_history.csv` + `incidents.csv` -> time-window jam forecast and leave-before suggestion
