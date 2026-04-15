export const DEFAULT_SCENARIO_ID = 'fuel-hike'

const FORECAST_SERVICE_URL = (
  import.meta.env.VITE_TIMESFM_SERVICE_URL?.trim() || 'http://127.0.0.1:8008'
).replace(/\/$/, '')
const FORECAST_TIMEOUT_MS = Number.parseInt(
  import.meta.env.VITE_TIMESFM_TIMEOUT_MS ?? '12000',
  10,
)

export const scenarioCatalog = [
  {
    id: 'fuel-hike',
    name: 'Hero demo',
    heroLabel: 'Tomorrow fuel rises +500 VND/L',
    story:
      'Warn tonight, refuel before the increase, leave earlier, and take the best-value route.',
    pitchUse: 'Primary wow moment for the live demo.',
  },
  {
    id: 'stable',
    name: 'Stable pricing',
    heroLabel: 'Fuel holds flat tomorrow',
    story:
      'Even without a fuel spike, DriveMate still earns the open by reducing commute time and total trip cost.',
    pitchUse: 'Shows the product still matters on a quiet day.',
  },
  {
    id: 'fallback',
    name: 'Fallback mode',
    heroLabel: 'Seeded forecast fallback is active',
    story:
      'If live forecasting is unavailable, DriveMate keeps the same user story by falling back to seeded outputs.',
    pitchUse: 'Backup state for hackathon reliability.',
  },
]

const scenarioData = {
  'fuel-hike': {
    fuelTrend: {
      fuelType: 'RON95-III',
      currentPriceVndPerLitre: 24300,
      nextPriceVndPerLitre: 24800,
      deltaVnd: 500,
      trendDirection: 'up',
      confidence: 84,
      estimatedWeeklyImpactVnd: 80000,
      source: 'seeded-starter-forecast',
      fallbackUsed: false,
    },
    commuteWindow: {
      destination: 'District 1 Office',
      etaRangeMin: [24, 35],
      trafficBand: 'Peak traffic between 07:50 and 08:30',
      bestDepartureWindow: '07:35 - 07:50',
      bestDepartureTime: '07:40',
      confidencePct: 82,
      source: 'seeded-starter-forecast',
      fallbackUsed: false,
    },
    status: {
      modelStatus:
        'Seeded forecast is active immediately while the TimesFM sidecar hydrates in the background.',
      statusLabel: 'Hydrating live commute forecast',
      fallbackMode: false,
      source: 'Seeded starter forecast',
    },
  },
  stable: {
    fuelTrend: {
      fuelType: 'RON95-III',
      currentPriceVndPerLitre: 24300,
      nextPriceVndPerLitre: 24300,
      deltaVnd: 0,
      trendDirection: 'flat',
      confidence: 79,
      estimatedWeeklyImpactVnd: 0,
      source: 'seeded-starter-forecast',
      fallbackUsed: false,
    },
    commuteWindow: {
      destination: 'District 1 Office',
      etaRangeMin: [26, 36],
      trafficBand: 'Traffic is moderate but still thick after 08:00',
      bestDepartureWindow: '07:45 - 08:00',
      bestDepartureTime: '07:50',
      confidencePct: 78,
      source: 'seeded-starter-forecast',
      fallbackUsed: false,
    },
    status: {
      modelStatus:
        'Seeded forecast is active immediately while the TimesFM sidecar hydrates in the background.',
      statusLabel: 'Hydrating live commute forecast',
      fallbackMode: false,
      source: 'Seeded starter forecast',
    },
  },
  fallback: {
    fuelTrend: {
      fuelType: 'RON95-III',
      currentPriceVndPerLitre: 24300,
      nextPriceVndPerLitre: 24800,
      deltaVnd: 500,
      trendDirection: 'up',
      confidence: 72,
      estimatedWeeklyImpactVnd: 80000,
      source: 'forced-seeded-fallback',
      fallbackUsed: true,
    },
    commuteWindow: {
      destination: 'District 1 Office',
      etaRangeMin: [25, 36],
      trafficBand: 'Seeded backup predicts the same 07:50 to 08:30 peak jam',
      bestDepartureWindow: '07:35 - 07:50',
      bestDepartureTime: '07:40',
      confidencePct: 74,
      source: 'forced-seeded-fallback',
      fallbackUsed: true,
    },
    status: {
      modelStatus:
        'Fallback mode is forced for the demo so the product story still lands even if the live service is unavailable.',
      statusLabel: 'Fallback mode active',
      fallbackMode: true,
      source: 'Forced seeded fallback',
    },
  },
}

function buildTimestamp() {
  return new Date().toISOString()
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function getScenarioData(scenarioId) {
  return scenarioData[scenarioId] ?? scenarioData[DEFAULT_SCENARIO_ID]
}

function buildSeededFuelTrend(date, area, scenarioId = DEFAULT_SCENARIO_ID) {
  const scenario = getScenarioData(scenarioId)

  return {
    ...scenario.fuelTrend,
    date,
    area,
    modelName: 'seeded-scenario',
    generatedAt: buildTimestamp(),
    historyPointsUsed: 0,
    fallbackReason: scenarioId === 'fallback' ? 'forced-fallback-scenario' : null,
  }
}

function buildSeededCommuteWindow(
  userProfile,
  date,
  scenarioId = DEFAULT_SCENARIO_ID,
) {
  const scenario = getScenarioData(scenarioId)

  return {
    ...scenario.commuteWindow,
    date,
    userId: userProfile.id,
    modelName: 'seeded-scenario',
    generatedAt: buildTimestamp(),
    historyPointsUsed: 0,
    fallbackReason: scenarioId === 'fallback' ? 'forced-fallback-scenario' : null,
  }
}

function buildFuelFallback(date, area, scenarioId, reason) {
  return {
    ...buildSeededFuelTrend(date, area, scenarioId),
    source: scenarioId === 'fallback' ? 'forced-seeded-fallback' : 'seeded-service-fallback',
    fallbackUsed: true,
    fallbackReason: reason,
  }
}

function buildCommuteFallback(userProfile, date, scenarioId, reason) {
  return {
    ...buildSeededCommuteWindow(userProfile, date, scenarioId),
    source: scenarioId === 'fallback' ? 'forced-seeded-fallback' : 'seeded-service-fallback',
    fallbackUsed: true,
    fallbackReason: reason,
  }
}

async function postForecast(path, body) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), FORECAST_TIMEOUT_MS)

  try {
    const response = await fetch(`${FORECAST_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Forecast service returned ${response.status}`)
    }

    return response.json()
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function normalizeFuelTrend(raw, date, area, scenarioId) {
  const seededFuelTrend = buildSeededFuelTrend(date, area, scenarioId)
  const nextPrice = Number(raw?.nextPriceVndPerLitre)
  const currentPrice = Number(raw?.currentPriceVndPerLitre)
  const delta = Number(raw?.deltaVnd)

  if (
    !isFiniteNumber(nextPrice) ||
    !isFiniteNumber(currentPrice) ||
    !isFiniteNumber(delta) ||
    typeof raw?.trendDirection !== 'string'
  ) {
    throw new Error('Invalid fuel trend payload')
  }

  return {
    ...seededFuelTrend,
    fuelType: typeof raw.fuelType === 'string' ? raw.fuelType : seededFuelTrend.fuelType,
    currentPriceVndPerLitre: Math.round(currentPrice),
    nextPriceVndPerLitre: Math.round(nextPrice),
    deltaVnd: Math.round(delta),
    trendDirection: raw.trendDirection,
    confidence: clampPercent(Number(raw.confidence ?? seededFuelTrend.confidence)),
    estimatedWeeklyImpactVnd: Math.round(
      Number(raw.estimatedWeeklyImpactVnd ?? seededFuelTrend.estimatedWeeklyImpactVnd),
    ),
    source: typeof raw.source === 'string' ? raw.source : 'timesfm-live',
    fallbackUsed: Boolean(raw.fallbackUsed),
    modelName:
      typeof raw.modelName === 'string' && raw.modelName
        ? raw.modelName
        : 'timesfm-live',
    generatedAt:
      typeof raw.generatedAt === 'string' && raw.generatedAt
        ? raw.generatedAt
        : buildTimestamp(),
    historyPointsUsed: Math.max(0, Number(raw.historyPointsUsed ?? 0)),
    fallbackReason:
      typeof raw.fallbackReason === 'string' ? raw.fallbackReason : null,
  }
}

function normalizeCommuteWindow(raw, userProfile, date, scenarioId) {
  const seededCommuteWindow = buildSeededCommuteWindow(userProfile, date, scenarioId)
  const etaRangeMin = Array.isArray(raw?.etaRangeMin)
    ? raw.etaRangeMin.map((value) => Number(value))
    : null

  if (
    !etaRangeMin ||
    etaRangeMin.length !== 2 ||
    !etaRangeMin.every(isFiniteNumber) ||
    typeof raw?.trafficBand !== 'string' ||
    typeof raw?.bestDepartureWindow !== 'string' ||
    typeof raw?.bestDepartureTime !== 'string'
  ) {
    throw new Error('Invalid commute window payload')
  }

  return {
    ...seededCommuteWindow,
    destination:
      typeof raw.destination === 'string' && raw.destination.trim()
        ? raw.destination
        : seededCommuteWindow.destination,
    etaRangeMin: etaRangeMin.map((value) => Math.round(value)),
    trafficBand: raw.trafficBand,
    bestDepartureWindow: raw.bestDepartureWindow,
    bestDepartureTime: raw.bestDepartureTime,
    confidencePct: clampPercent(Number(raw.confidencePct ?? seededCommuteWindow.confidencePct)),
    source: typeof raw.source === 'string' ? raw.source : 'timesfm-live',
    fallbackUsed: Boolean(raw.fallbackUsed),
    modelName:
      typeof raw.modelName === 'string' && raw.modelName
        ? raw.modelName
        : 'timesfm-live',
    generatedAt:
      typeof raw.generatedAt === 'string' && raw.generatedAt
        ? raw.generatedAt
        : buildTimestamp(),
    historyPointsUsed: Math.max(0, Number(raw.historyPointsUsed ?? 0)),
    fallbackReason:
      typeof raw.fallbackReason === 'string' ? raw.fallbackReason : null,
  }
}

function summarizeLiveStatus(fuelTrend, commuteWindow) {
  const commuteLive = !commuteWindow.fallbackUsed
  const fuelLive = !fuelTrend.fallbackUsed

  if (!commuteLive) {
    return {
      modelStatus:
        'TimesFM commute forecasting is unavailable, so DriveMate is using seeded outputs to protect the demo flow.',
      statusLabel: 'Fallback mode active',
      fallbackMode: true,
      source: 'Seeded backup forecast',
    }
  }

  if (fuelLive) {
    return {
      modelStatus:
        'TimesFM is live for the commute and fuel layers, while the Qwen narrative keeps the recommendation readable for the demo.',
      statusLabel: 'TimesFM live',
      fallbackMode: false,
      source: 'TimesFM live forecast',
    }
  }

  return {
    modelStatus:
      'TimesFM is live for the commute forecast. Fuel stayed on the seeded fallback because confidence did not clear the demo threshold.',
    statusLabel: 'Live commute forecast',
    fallbackMode: false,
    source: 'TimesFM commute + gated fuel fallback',
  }
}

// Maps predictionEngine scenario IDs → timesfm_service scenario IDs
function toTimesfmScenarioId(predictionScenarioId) {
  if (predictionScenarioId === 'fallback-demo') return 'fallback'
  if (predictionScenarioId === 'rainy-office') return 'fuel-hike'
  return 'fuel-hike' // weekday-office and all others → fuel-hike
}

export async function loadLiveForecast(predictionScenarioId) {
  const today = new Date().toISOString().slice(0, 10)
  const timesfmId = toTimesfmScenarioId(predictionScenarioId)
  const userProfile = { id: 'mai-tran' }
  const area = 'Ho Chi Minh City'

  const [fuelTrend, commuteWindow] = await Promise.all([
    ForecastAdapter.getFuelTrend(today, area, timesfmId),
    ForecastAdapter.getCommuteWindow(userProfile, today, timesfmId),
  ])
  return { fuelTrend, commuteWindow }
}

export async function pollTimesFMHealth() {
  try {
    const res = await fetch(`${FORECAST_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { status: 'degraded', modelLoaded: false }
    return res.json()
  } catch {
    return { status: 'unreachable', modelLoaded: false }
  }
}

export const ForecastAdapter = {
  getScenarioMeta(scenarioId = DEFAULT_SCENARIO_ID) {
    return (
      scenarioCatalog.find((scenario) => scenario.id === scenarioId) ??
      scenarioCatalog[0]
    )
  },

  getStatus(scenarioId = DEFAULT_SCENARIO_ID) {
    return {
      ...getScenarioData(scenarioId).status,
    }
  },

  getSeededFuelTrend(date, area, scenarioId = DEFAULT_SCENARIO_ID) {
    return buildSeededFuelTrend(date, area, scenarioId)
  },

  getSeededCommuteWindow(userProfile, date, scenarioId = DEFAULT_SCENARIO_ID) {
    return buildSeededCommuteWindow(userProfile, date, scenarioId)
  },

  summarizeStatus(
    scenarioId = DEFAULT_SCENARIO_ID,
    { fuelTrend, commuteWindow } = {},
  ) {
    if (scenarioId === 'fallback') {
      return this.getStatus('fallback')
    }

    if (!fuelTrend || !commuteWindow) {
      return this.getStatus(scenarioId)
    }

    return summarizeLiveStatus(fuelTrend, commuteWindow)
  },

  async getFuelTrend(date, area, scenarioId = DEFAULT_SCENARIO_ID) {
    if (scenarioId === 'fallback' || typeof window === 'undefined') {
      return buildFuelFallback(date, area, scenarioId, 'forced-fallback-scenario')
    }

    try {
      const payload = await postForecast('/forecast/fuel-trend', {
        scenarioId,
        date,
        area,
        horizonDays: 1,
      })

      return normalizeFuelTrend(payload, date, area, scenarioId)
    } catch {
      return buildFuelFallback(date, area, scenarioId, 'service-unavailable')
    }
  },

  async getCommuteWindow(
    userProfile,
    date,
    scenarioId = DEFAULT_SCENARIO_ID,
  ) {
    if (scenarioId === 'fallback' || typeof window === 'undefined') {
      return buildCommuteFallback(
        userProfile,
        date,
        scenarioId,
        'forced-fallback-scenario',
      )
    }

    try {
      const payload = await postForecast('/forecast/commute-window', {
        scenarioId,
        date,
        userId: userProfile.id,
      })

      return normalizeCommuteWindow(payload, userProfile, date, scenarioId)
    } catch {
      return buildCommuteFallback(userProfile, date, scenarioId, 'service-unavailable')
    }
  },
}
