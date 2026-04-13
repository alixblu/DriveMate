import { DEFAULT_SCENARIO_ID, ForecastAdapter } from './forecastAdapter'

export const userProfile = {
  id: 'demo-driver-1',
  name: 'Mai Tran',
  city: 'Ho Chi Minh City',
  homeLocation: 'Thu Duc City',
  workLocation: 'District 1',
  primaryVehicle: {
    name: 'Toyota Vios',
    fuelType: 'RON95-III',
    averageFuelUseLitresPer100Km: 7.2,
  },
}

export const garage = [
  {
    id: 'toyota-vios',
    name: 'Toyota Vios',
    type: 'ICE',
    detail: 'Primary MVP vehicle for fuel-first Vietnam demo',
  },
  {
    id: 'vinfast-vf8',
    name: 'VinFast VF 8',
    type: 'EV',
    detail: 'Optional follow-up support after the hackathon MVP',
  },
]

const baseRouteTemplates = [
  {
    id: 'best-value',
    label: 'AI suggested',
    badge: 'Best Value',
    etaMin: 27,
    tollVnd: 34000,
    litresUsed: 3.43,
    rationale:
      'Balances a short ETA with materially lower toll and fuel spend than the fastest route.',
  },
  {
    id: 'fastest',
    label: 'Fast lane',
    badge: 'Fastest',
    etaMin: 24,
    tollVnd: 50000,
    litresUsed: 3.87,
    rationale:
      'Gets you in first, but the toll and higher stop-start fuel burn make it the most expensive option.',
  },
  {
    id: 'cheapest',
    label: 'Saver lane',
    badge: 'Cheapest',
    etaMin: 35,
    tollVnd: 15000,
    litresUsed: 3.27,
    rationale:
      'Lowest total cash outlay, but the longer peak traffic exposure pushes the commute time up sharply.',
  },
]

function roundToNearestThousand(value) {
  return Math.round(value / 1000) * 1000
}

function addRouteCost(routeTemplate, fuelTrend) {
  const fuelCostVnd = roundToNearestThousand(
    routeTemplate.litresUsed * fuelTrend.nextPriceVndPerLitre,
  )

  return {
    id: routeTemplate.id,
    label: routeTemplate.label,
    badge: routeTemplate.badge,
    etaMin: routeTemplate.etaMin,
    tollVnd: routeTemplate.tollVnd,
    fuelCostVnd,
    totalCostVnd: routeTemplate.tollVnd + fuelCostVnd,
    rationale: routeTemplate.rationale,
  }
}

function scoreRoutes(routeOptions) {
  const minEta = Math.min(...routeOptions.map((route) => route.etaMin))
  const maxEta = Math.max(...routeOptions.map((route) => route.etaMin))
  const minCost = Math.min(...routeOptions.map((route) => route.totalCostVnd))
  const maxCost = Math.max(...routeOptions.map((route) => route.totalCostVnd))

  return routeOptions.map((route) => {
    const etaSpread = maxEta - minEta || 1
    const costSpread = maxCost - minCost || 1
    const normalizedEta = (route.etaMin - minEta) / etaSpread
    const normalizedCost = (route.totalCostVnd - minCost) / costSpread

    return {
      ...route,
      score: normalizedEta * 0.5 + normalizedCost * 0.5,
    }
  })
}

function buildRouteOptions(fuelTrend) {
  return scoreRoutes(baseRouteTemplates.map((route) => addRouteCost(route, fuelTrend)))
}

function buildWeeklySavings(routeOptions, fuelTrend, forecastStatus) {
  const recommendedRoute =
    routeOptions.find((route) => route.badge === 'Best Value') ?? routeOptions[0]
  const baselineRoute =
    routeOptions.find((route) => route.badge === 'Fastest') ?? routeOptions[0]
  const routeSavingsVnd = (baselineRoute.totalCostVnd - recommendedRoute.totalCostVnd) * 3
  const moneySavedVnd = forecastStatus.fallbackMode
    ? 82000
    : fuelTrend.deltaVnd > 0
      ? Math.max(82000, routeSavingsVnd)
      : Math.max(54000, routeSavingsVnd - 27000)

  let summaryText =
    'DriveMate reduces your week by combining smarter route choices with better timing.'

  if (forecastStatus.fallbackMode) {
    summaryText =
      'Seeded fallback data keeps the same savings story alive if the live forecast service drops during the demo.'
  } else if (fuelTrend.deltaVnd > 0) {
    summaryText =
      'By refueling before the increase and taking the Best Value route on your weekday office runs, DriveMate projects about 82,000 VND saved this week.'
  } else {
    summaryText =
      'With fuel prices stable tomorrow, most savings come from avoiding peak congestion and unnecessary toll-heavy lanes.'
  }

  return {
    trips: 12,
    tollSpentVnd: 402000,
    fuelSpentVnd: 960000,
    minutesSaved: '44 min',
    moneySavedVnd,
    summaryText,
  }
}

function buildWalletForecast(routeOptions) {
  const recommendedRoute =
    routeOptions.find((route) => route.badge === 'Best Value') ?? routeOptions[0]

  return {
    balanceVnd: 120000,
    expectedWeeklyTollVnd: recommendedRoute.tollVnd * 4,
    suggestedTopUpVnd: 200000,
  }
}

function buildRewards() {
  return {
    points: 1240,
    recommendedRouteBonus: 20,
  }
}

function buildDailyDecision(
  date,
  commuteWindow,
  fuelTrend,
  routeOptions,
  weeklySavings,
  forecastStatus,
) {
  const recommendedRoute =
    routeOptions.find((route) => route.badge === 'Best Value') ?? routeOptions[0]

  let refuelAdvice = 'No refuel rush - focus on route savings instead'

  if (fuelTrend.deltaVnd > 0) {
    refuelAdvice = 'Refuel tonight before the increase lands'
  }

  if (forecastStatus.fallbackMode) {
    refuelAdvice = 'Fallback forecast still says refuel before the increase'
  }

  return {
    date,
    destination: commuteWindow.destination,
    leaveAt: commuteWindow.bestDepartureTime,
    etaMin: recommendedRoute.etaMin,
    routeId: recommendedRoute.id,
    tollVnd: recommendedRoute.tollVnd,
    fuelCostVnd: recommendedRoute.fuelCostVnd,
    totalCostVnd: recommendedRoute.totalCostVnd,
    fuelDeltaVndPerLitre: fuelTrend.deltaVnd,
    refuelAdvice,
    weeklySavingsVnd: weeklySavings.moneySavedVnd,
    confidencePct: commuteWindow.confidencePct,
  }
}

function buildSnapshot({
  date,
  scenarioId,
  scenario,
  forecastStatus,
  fuelTrend,
  commuteWindow,
}) {
  const routeOptions = buildRouteOptions(fuelTrend)
  const weeklySavings = buildWeeklySavings(routeOptions, fuelTrend, forecastStatus)
  const walletForecast = buildWalletForecast(routeOptions)

  return {
    scenarioId,
    scenario,
    userProfile,
    garage,
    forecastStatus,
    fuelTrend,
    commuteWindow,
    routeOptions,
    weeklySavings,
    walletForecast,
    rewards: buildRewards(),
    dailyDecision: buildDailyDecision(
      date,
      commuteWindow,
      fuelTrend,
      routeOptions,
      weeklySavings,
      forecastStatus,
    ),
  }
}

export function createDriveMateSnapshot(
  date = '2026-04-14',
  scenarioId = DEFAULT_SCENARIO_ID,
) {
  const scenario = ForecastAdapter.getScenarioMeta(scenarioId)
  const forecastStatus = ForecastAdapter.getStatus(scenarioId)
  const fuelTrend = ForecastAdapter.getSeededFuelTrend(
    date,
    userProfile.city,
    scenarioId,
  )
  const commuteWindow = ForecastAdapter.getSeededCommuteWindow(
    userProfile,
    date,
    scenarioId,
  )

  return buildSnapshot({
    date,
    scenarioId,
    scenario,
    forecastStatus,
    fuelTrend,
    commuteWindow,
  })
}

export async function loadDriveMateSnapshot(
  date = '2026-04-14',
  scenarioId = DEFAULT_SCENARIO_ID,
) {
  const scenario = ForecastAdapter.getScenarioMeta(scenarioId)

  try {
    const commuteWindow = await ForecastAdapter.getCommuteWindow(
      userProfile,
      date,
      scenarioId,
    )
    const fuelTrend = await ForecastAdapter.getFuelTrend(
      date,
      userProfile.city,
      scenarioId,
    )
    const forecastStatus = ForecastAdapter.summarizeStatus(scenarioId, {
      fuelTrend,
      commuteWindow,
    })

    return buildSnapshot({
      date,
      scenarioId,
      scenario,
      forecastStatus,
      fuelTrend,
      commuteWindow,
    })
  } catch {
    return createDriveMateSnapshot(date, scenarioId)
  }
}
