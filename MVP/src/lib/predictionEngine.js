import {
  routeCatalog,
  serviceLocations,
  vehicles,
} from '../data/mockData';

export const DEFAULT_SCENARIO_ID = 'weekday-office';

export const scenarioCatalog = [
  {
    id: 'weekday-office',
    name: 'Weekday office',
    heroLabel: 'Predict tomorrow morning before the trip starts',
    story:
      'DriveMate predicts the office commute, asks for a top-up tonight, then hands you into parking near District 1.',
    destination: 'District 1 Office',
    confidencePct: 88,
    leaveAt: '07:40',
    trafficBand: 'Peak inbound traffic builds from 07:45 to 08:25.',
    fuelPriceVndPerLitre: 24800,
    chargePriceVndPerKwh: 4200,
    etaAdjustments: {
      'best-value': 0,
      fastest: 0,
      cheapest: 2,
    },
    walletBufferVnd: 62000,
    weeklyTrips: 10,
    weeklySavingsVnd: 124000,
    trafficMinutesSaved: 42,
    leaveEarlyMinutesSaved: 14,
    carWashPrompt: false,
    fallbackMode: false,
  },
  {
    id: 'rainy-office',
    name: 'Rainy office',
    heroLabel: 'Rain changes both congestion and after-trip services',
    story:
      'DriveMate moves the leave time earlier, protects toll balance, then nudges parking and a car wash after work.',
    destination: 'District 1 Office',
    confidencePct: 84,
    leaveAt: '07:25',
    trafficBand: 'Rain pushes peak queues earlier and adds stop-start burn.',
    fuelPriceVndPerLitre: 24800,
    chargePriceVndPerKwh: 4300,
    etaAdjustments: {
      'best-value': 6,
      fastest: 5,
      cheapest: 8,
    },
    walletBufferVnd: 76000,
    weeklyTrips: 10,
    weeklySavingsVnd: 138000,
    trafficMinutesSaved: 55,
    leaveEarlyMinutesSaved: 19,
    carWashPrompt: true,
    fallbackMode: false,
  },
  {
    id: 'fallback-demo',
    name: 'Fallback demo',
    heroLabel: 'Pre-baked demo state for reliable pitching',
    story:
      'Use this state when you need the same predictive story to land without depending on live signals.',
    destination: 'District 1 Office',
    confidencePct: 76,
    leaveAt: '07:35',
    trafficBand: 'Seeded fallback keeps the same rush-hour recommendation intact.',
    fuelPriceVndPerLitre: 24600,
    chargePriceVndPerKwh: 4100,
    etaAdjustments: {
      'best-value': 1,
      fastest: 1,
      cheapest: 3,
    },
    walletBufferVnd: 68000,
    weeklyTrips: 9,
    weeklySavingsVnd: 96000,
    trafficMinutesSaved: 37,
    leaveEarlyMinutesSaved: 11,
    carWashPrompt: false,
    fallbackMode: true,
  },
];

const scenarioMap = Object.fromEntries(
  scenarioCatalog.map((scenario) => [scenario.id, scenario]),
);

function roundVnd(value) {
  return Math.round(value / 1000) * 1000;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getVehicle(vehicleId) {
  return vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0];
}

function getScenario(scenarioId) {
  return scenarioMap[scenarioId] ?? scenarioCatalog[0];
}

function buildRouteOptions(vehicle, scenario) {
  const isEv = vehicle.powertrain === 'ev';
  const weightedRoutes = routeCatalog.map((template) => {
    const etaMin =
      template.baseEtaMin + (scenario.etaAdjustments[template.id] ?? 0);
    const runningCostVnd = isEv
      ? roundVnd(template.kwhUsed * scenario.chargePriceVndPerKwh)
      : roundVnd(template.litresUsed * scenario.fuelPriceVndPerLitre);
    const totalCostVnd = template.tollVnd + runningCostVnd;

    return {
      id: template.id,
      label: template.label,
      badge: template.badge,
      etaMin,
      tollVnd: template.tollVnd,
      tollStations: template.tollStations,
      tollEachVnd: template.tollEachVnd,
      runningCostVnd,
      totalCostVnd,
      color: template.color,
      path: template.path,
      rationale: template.rationale,
      tollStationName: template.tollStationName,
      destinationServiceName: isEv
        ? template.chargingStationName
        : template.parkingLotName,
      destinationServiceDetail: isEv
        ? template.chargingDetail
        : template.parkingDetail,
      parkingLotName: template.parkingLotName,
      parkingDetail: template.parkingDetail,
      chargingStationName: template.chargingStationName,
      chargingDetail: template.chargingDetail,
      carWashName: template.carWashName,
      carWashDetail: template.carWashDetail,
      serviceOutcome: isEv
        ? `Best access to ${template.chargingStationName} after arrival.`
        : `Best handoff into ${template.parkingLotName}.`,
    };
  });

  const minEta = Math.min(...weightedRoutes.map((route) => route.etaMin));
  const maxEta = Math.max(...weightedRoutes.map((route) => route.etaMin));
  const minCost = Math.min(...weightedRoutes.map((route) => route.totalCostVnd));
  const maxCost = Math.max(...weightedRoutes.map((route) => route.totalCostVnd));

  const withScore = weightedRoutes.map((route) => {
    const etaSpread = maxEta - minEta || 1;
    const costSpread = maxCost - minCost || 1;
    const etaScore = (route.etaMin - minEta) / etaSpread;
    const costScore = (route.totalCostVnd - minCost) / costSpread;

    return {
      ...route,
      score: etaScore * 0.5 + costScore * 0.5,
    };
  });

  const recommendedRoute =
    withScore.reduce((best, route) => (route.score < best.score ? route : best)) ??
    withScore[0];

  return {
    routeOptions: withScore,
    recommendedRouteId: recommendedRoute.id,
  };
}

function buildWalletForecast({
  scenario,
  recommendedRoute,
  selectedRoute,
  walletBalance,
}) {
  const expectedWeeklyTollVnd =
    recommendedRoute.tollVnd * scenario.weeklyTrips + scenario.walletBufferVnd;
  const recommendedTopUpBase =
    expectedWeeklyTollVnd - walletBalance + recommendedRoute.tollVnd;
  const suggestedTopUpVnd = Math.max(120000, roundVnd(recommendedTopUpBase));

  return {
    balanceVnd: walletBalance,
    expectedWeeklyTollVnd,
    suggestedTopUpVnd,
    projectedAfterTripVnd: Math.max(0, walletBalance - selectedRoute.tollVnd),
    reason:
      'DriveMate forecasts repeated toll usage on the office corridor, so it keeps a buffer instead of waiting for the wallet to run low.',
  };
}

function buildPrimaryAction({
  scenario,
  vehicle,
  selectedRoute,
  walletForecast,
}) {
  if (vehicle.powertrain === 'ev') {
    return {
      serviceType: 'charging',
      timing: 'After the toll run',
      title: `Charge at ${selectedRoute.chargingStationName}`,
      reason: `${vehicle.shortName} can finish the commute cleanly, then top up beside your destination parking with minimal detour.`,
      ctaLabel: 'Find charger',
      ctaTab: 'assistant',
      savingsVnd: 18000,
      locationName: selectedRoute.chargingStationName,
    };
  }

  return {
    serviceType: 'toll_wallet',
    timing: 'Tonight',
    title: `Top up ${walletForecast.suggestedTopUpVnd.toLocaleString('vi-VN')} VND before tomorrow`,
    reason: `Your current wallet is too light for the next ${scenario.weeklyTrips} corridor toll runs plus parking support near District 1.`,
    ctaLabel: 'Open wallet',
    ctaTab: 'wallet',
    savingsVnd: 12000,
    locationName: 'VETC wallet',
  };
}

function buildSecondaryActions({
  scenario,
  vehicle,
  selectedRoute,
  walletForecast,
}) {
  const actions = [];

  actions.push({
    serviceType: 'toll_station',
    timing: 'On the route',
    title: `Pass ${selectedRoute.tollStationName} with VETC`,
    reason: `${selectedRoute.badge} uses ${selectedRoute.tollStations} toll station${selectedRoute.tollStations > 1 ? 's' : ''}, so auto-pay matters before you leave.`,
    ctaLabel: 'Open route',
    ctaTab: 'routes',
    locationName: selectedRoute.tollStationName,
  });

  if (vehicle.powertrain === 'ev') {
    actions.push({
      serviceType: 'parking',
      timing: 'Near arrival',
      title: `Reserve ${selectedRoute.parkingLotName}`,
      reason: `${selectedRoute.parkingDetail} DriveMate keeps the charger and parking handoff in one plan.`,
      ctaLabel: 'Reserve parking',
      ctaTab: 'routes',
      locationName: selectedRoute.parkingLotName,
    });
  } else {
    actions.push({
      serviceType: 'parking',
      timing: 'Near arrival',
      title: `Reserve ${selectedRoute.parkingLotName}`,
      reason: `${selectedRoute.parkingDetail} It is the easiest way to convert route prediction into a concrete arrival plan.`,
      ctaLabel: 'Reserve parking',
      ctaTab: 'routes',
      locationName: selectedRoute.parkingLotName,
    });
  }

  if (scenario.carWashPrompt && vehicle.powertrain === 'ice') {
    actions.push({
      serviceType: 'car_wash',
      timing: 'After work',
      title: `Book ${selectedRoute.carWashName}`,
      reason: `${selectedRoute.carWashDetail} Rain makes this a natural retention hook after the commute ends.`,
      ctaLabel: 'Book car wash',
      ctaTab: 'assistant',
      locationName: selectedRoute.carWashName,
    });
  } else if (vehicle.powertrain === 'ev') {
    actions.push({
      serviceType: 'charging',
      timing: 'At destination',
      title: `Hold a bay at ${selectedRoute.chargingStationName}`,
      reason: `${selectedRoute.chargingDetail} The EV version of DriveMate should make charging feel as proactive as toll top-up.`,
      ctaLabel: 'See charging plan',
      ctaTab: 'assistant',
      locationName: selectedRoute.chargingStationName,
    });
  }

  if (walletForecast.projectedAfterTripVnd < selectedRoute.tollVnd) {
    actions.push({
      serviceType: 'toll_wallet',
      timing: 'Before the next commute',
      title: 'Protect the next toll run with another buffer',
      reason: 'The current route leaves too little balance for another office trip.',
      ctaLabel: 'Top up again',
      ctaTab: 'wallet',
      locationName: 'VETC wallet',
    });
  }

  return actions.slice(0, 3);
}

function buildNotifications({
  scenario,
  vehicle,
  tripPrediction,
  primaryAction,
  secondaryActions,
  walletForecast,
}) {
  const notifications = [
    {
      id: 'wallet-alert',
      pill: 'Predictive top-up',
      title:
        primaryAction.serviceType === 'toll_wallet'
          ? primaryAction.title
          : `Keep ${walletForecast.suggestedTopUpVnd.toLocaleString('vi-VN')} VND ready for tolls`,
      detail:
        primaryAction.serviceType === 'toll_wallet'
          ? primaryAction.reason
          : `Even in EV mode, toll balance still needs a buffer before the weekday corridor.`,
      ctaLabel: 'Open wallet',
      ctaTab: 'wallet',
    },
    {
      id: 'leave-alert',
      pill: 'Leave-time alert',
      title: `Leave before ${tripPrediction.leaveAt}`,
      detail: `${scenario.trafficBand} Leaving on time protects ${scenario.leaveEarlyMinutesSaved} minutes this morning.`,
      ctaLabel: 'Plan commute',
      ctaTab: 'home',
    },
  ];

  const destinationAction =
    secondaryActions.find((action) => action.serviceType === 'parking') ??
    secondaryActions.find((action) => action.serviceType === 'charging');

  if (destinationAction) {
    notifications.push({
      id: 'destination-alert',
      pill: destinationAction.serviceType === 'charging' ? 'Charge alert' : 'Parking alert',
      title: destinationAction.title,
      detail: destinationAction.reason,
      ctaLabel: destinationAction.ctaLabel,
      ctaTab: destinationAction.ctaTab,
    });
  }

  if (scenario.carWashPrompt && vehicle.powertrain === 'ice') {
    notifications.push({
      id: 'wash-alert',
      pill: 'After-trip service',
      title: 'Road spray is high today',
      detail:
        'DriveMate predicts strong car wash demand after work, so it surfaces the closest wash before slots fill up.',
      ctaLabel: 'See wash plan',
      ctaTab: 'assistant',
    });
  } else {
    notifications.push({
      id: 'toll-alert',
      pill: 'Toll corridor',
      title: 'Auto-pass stays part of the recommendation',
      detail:
        'The best route still depends on VETC-owned toll data, which is exactly where TASCO can differentiate from map-only apps.',
      ctaLabel: 'View route',
      ctaTab: 'routes',
    });
  }

  return notifications;
}

function buildAssistantBrief({
  scenario,
  vehicle,
  selectedRoute,
  primaryAction,
  weeklyRecap,
  runningCostLabel,
}) {
  return {
    headline: `${selectedRoute.badge} at ${scenario.leaveAt} keeps the ${scenario.destination.toLowerCase()} trip in control.`,
    explanation: `DriveMate predicts ${scenario.destination} with ${scenario.confidencePct}% confidence, recommends ${selectedRoute.badge}, and then turns the trip into TASCO actions: ${primaryAction.title.toLowerCase()}. For ${vehicle.vehicleMode} mode, that keeps toll + ${runningCostLabel.toLowerCase()} near ${selectedRoute.totalCostVnd.toLocaleString('vi-VN')} VND and supports about ${weeklyRecap.moneySavedVnd.toLocaleString('vi-VN')} VND saved this week.`,
  };
}

function buildWeeklyRecap(scenario, vehicle, primaryAction) {
  return {
    trips: scenario.weeklyTrips,
    moneySavedVnd: scenario.weeklySavingsVnd,
    trafficMinutesSaved: scenario.trafficMinutesSaved,
    tollSpentVnd: 412000,
    serviceReliance:
      vehicle.powertrain === 'ev'
        ? 'charging + toll + parking'
        : primaryAction.serviceType === 'toll_wallet'
          ? 'toll + parking + after-trip services'
          : 'toll + parking',
    summaryText:
      vehicle.powertrain === 'ev'
        ? 'DriveMate keeps EV charging, parking, and toll spend in one predictable flow.'
        : 'DriveMate keeps toll, parking, and after-trip services in one predictive flow that users can rely on every weekday.',
  };
}

function buildQuickPrompts(vehicle, scenario) {
  const prompts = [
    'Why this route?',
    'Why top up tonight?',
    vehicle.powertrain === 'ev' ? 'Where should I charge?' : 'Where should I park?',
    'What did I save this week?',
  ];

  if (scenario.carWashPrompt && vehicle.powertrain === 'ice') {
    prompts[2] = 'Should I book a car wash?';
  }

  return prompts;
}

export function createDriveMateSnapshot({
  scenarioId = DEFAULT_SCENARIO_ID,
  vehicleId = vehicles[0].id,
  selectedRouteId,
  walletBalance = 118000,
  rewardPoints = 1260,
  tripCompleted = false,
  fuelTrend = null,
  commuteWindow = null,
} = {}) {
  const scenario = getScenario(scenarioId);

  // Merge live TimesFM data into the snapshot — fall back to scenario seeds when null
  const liveDepartureTime = commuteWindow?.bestDepartureTime ?? null;
  const liveConfidencePct = commuteWindow?.confidencePct ?? scenario.confidencePct;
  const liveEtaRange = commuteWindow?.etaRangeMin ?? null;
  const liveTrafficBand = commuteWindow?.trafficBand ?? scenario.trafficBand;
  const liveSource = commuteWindow?.source ?? 'seeded-scenario';
  const liveFuelDelta = fuelTrend?.deltaVnd ?? null;
  const vehicle = getVehicle(vehicleId);
  const runningCostLabel = vehicle.powertrain === 'ev' ? 'Charge' : 'Fuel';
  const { routeOptions, recommendedRouteId } = buildRouteOptions(vehicle, scenario);
  const selectedRoute =
    routeOptions.find((route) => route.id === selectedRouteId) ??
    routeOptions.find((route) => route.id === recommendedRouteId) ??
    routeOptions[0];
  const recommendedRoute =
    routeOptions.find((route) => route.id === recommendedRouteId) ?? routeOptions[0];
  const walletForecast = buildWalletForecast({
    scenario,
    recommendedRoute,
    selectedRoute,
    walletBalance,
  });
  const primaryAction = buildPrimaryAction({
    scenario,
    vehicle,
    selectedRoute,
    walletForecast,
  });
  const secondaryActions = buildSecondaryActions({
    scenario,
    vehicle,
    selectedRoute,
    walletForecast,
  });
  const weeklyRecap = buildWeeklyRecap(scenario, vehicle, primaryAction);
  const tripPrediction = {
    destination: scenario.destination,
    confidencePct: liveConfidencePct,
    leaveAt: liveDepartureTime ?? scenario.leaveAt,
    etaMin: selectedRoute.etaMin,
    etaRangeMin: liveEtaRange,
    trafficBand: liveTrafficBand,
    forecastSource: liveSource,
    routeId: selectedRoute.id,
    tollVnd: selectedRoute.tollVnd,
    runningCostVnd: selectedRoute.runningCostVnd,
    totalCostVnd: selectedRoute.totalCostVnd,
    scenarioId: scenario.id,
    vehicleMode: vehicle.vehicleMode,
  };
  const notificationItems = buildNotifications({
    scenario,
    vehicle,
    tripPrediction,
    primaryAction,
    secondaryActions,
    walletForecast,
  });
  const assistantBrief = buildAssistantBrief({
    scenario,
    vehicle,
    selectedRoute,
    primaryAction,
    weeklyRecap,
    runningCostLabel,
  });

  return {
    scenario,
    vehicle,
    recommendedRouteId,
    selectedRoute,
    routeOptions,
    runningCostLabel,
    tripPrediction,
    primaryAction,
    secondaryActions,
    walletForecast,
    weeklyRecap,
    notificationItems,
    rewards: {
      points: rewardPoints,
      tripBonusVnd: 25,
      recommendedRouteBonus: selectedRoute.id === recommendedRouteId ? 35 : 20,
    },
    quickPrompts: buildQuickPrompts(vehicle, scenario),
    serviceCoverage: {
      tollStations: serviceLocations.tollStations,
      parkingLots: serviceLocations.parkingLots,
      chargingStations: serviceLocations.chargingStations,
      carWashLocations: serviceLocations.carWashLocations,
    },
    assistantBrief,
    voiceContext: {
      destination: scenario.destination,
      routeLabel: selectedRoute.badge,
      etaMins: selectedRoute.etaMin,
      tollSummary: `${selectedRoute.tollStations} toll station${selectedRoute.tollStations > 1 ? 's' : ''} · ${selectedRoute.tollVnd.toLocaleString('vi-VN')} VND`,
      leaveAt: scenario.leaveAt,
      nextAction: primaryAction.title,
      bonusLine: `${weeklyRecap.moneySavedVnd.toLocaleString('vi-VN')} VND weekly savings · ${weeklyRecap.trafficMinutesSaved} min saved`,
    },
    scenarioStatus: {
      label: scenario.fallbackMode ? 'Demo-safe fallback'
        : liveSource === 'timesfm-live' ? 'TimesFM live'
        : 'Predictive data',
      detail: scenario.story,
      confidencePct: clampPercent(liveConfidencePct),
      fallbackMode: scenario.fallbackMode,
      forecastSource: liveSource,
    },
    fuelAlert: liveFuelDelta !== null && liveFuelDelta > 200
      ? {
          active: true,
          deltaVnd: liveFuelDelta,
          direction: fuelTrend.trendDirection,
          weeklyImpactVnd: fuelTrend.estimatedWeeklyImpactVnd ?? 0,
        }
      : { active: false },
    tripCompleted,
  };
}

function answerRoute(snapshot) {
  const recommendedRoute =
    snapshot.routeOptions.find((route) => route.id === snapshot.recommendedRouteId) ??
    snapshot.routeOptions[0];

  return {
    title: 'Why this route',
    answer: `${recommendedRoute.badge} wins because it keeps the trip around ${recommendedRoute.etaMin} minutes without paying the premium toll burn of the fastest route. That is why DriveMate recommends it as the everyday default for TASCO users, not just the fastest possible line on a map.`,
  };
}

function answerWallet(snapshot) {
  return {
    title: 'Why top up tonight',
    answer: `Your VETC wallet is ${snapshot.walletForecast.balanceVnd.toLocaleString('vi-VN')} VND, while the predicted office corridor plus weekly toll pattern pushes expected spend to ${snapshot.walletForecast.expectedWeeklyTollVnd.toLocaleString('vi-VN')} VND. DriveMate suggests a ${snapshot.walletForecast.suggestedTopUpVnd.toLocaleString('vi-VN')} VND top-up so tomorrow's route and parking plan stay uninterrupted.`,
  };
}

function answerDestinationService(snapshot) {
  const parkingAction = snapshot.secondaryActions.find(
    (action) => action.serviceType === 'parking',
  );
  const chargingAction = snapshot.secondaryActions.find(
    (action) => action.serviceType === 'charging',
  );
  const washAction = snapshot.secondaryActions.find(
    (action) => action.serviceType === 'car_wash',
  );

  if (chargingAction) {
    return {
      title: 'Charging plan',
      answer: `${chargingAction.title}. ${chargingAction.reason}`,
    };
  }

  if (washAction) {
    return {
      title: 'Car wash plan',
      answer: `${washAction.title}. ${washAction.reason}`,
    };
  }

  return {
    title: 'Parking plan',
    answer: `${parkingAction?.title ?? 'Parking is ready'}. ${parkingAction?.reason ?? 'DriveMate keeps destination parking inside the same recommendation.'}`,
  };
}

function answerWeeklySavings(snapshot) {
  return {
    title: 'Weekly savings',
    answer: `${snapshot.weeklyRecap.summaryText} The current predictive setup saves about ${snapshot.weeklyRecap.moneySavedVnd.toLocaleString('vi-VN')} VND and ${snapshot.weeklyRecap.trafficMinutesSaved} minutes each week.`,
  };
}

function answerTollStations(snapshot) {
  const tollAction = snapshot.secondaryActions.find(
    (action) => action.serviceType === 'toll_station',
  );

  return {
    title: 'Toll station handoff',
    answer: `${tollAction?.title ?? 'Toll station handoff is ready'}. ${tollAction?.reason ?? 'DriveMate keeps toll awareness inside the route recommendation itself.'}`,
  };
}

export function buildAssistantReply(question, snapshot) {
  const normalized = question.trim().toLowerCase();

  if (
    normalized.includes('wallet') ||
    normalized.includes('top up') ||
    normalized.includes('top-up') ||
    normalized.includes('toll')
  ) {
    return answerWallet(snapshot);
  }

  if (
    normalized.includes('park') ||
    normalized.includes('charge') ||
    normalized.includes('charger') ||
    normalized.includes('wash')
  ) {
    return answerDestinationService(snapshot);
  }

  if (
    normalized.includes('station') ||
    normalized.includes('gate')
  ) {
    return answerTollStations(snapshot);
  }

  if (
    normalized.includes('save') ||
    normalized.includes('week')
  ) {
    return answerWeeklySavings(snapshot);
  }

  if (
    normalized.includes('route') ||
    normalized.includes('leave') ||
    normalized.includes('commute')
  ) {
    return answerRoute(snapshot);
  }

  return {
    title: 'Predictive summary',
    answer: `${snapshot.assistantBrief.explanation} The next TASCO action is ${snapshot.primaryAction.title.toLowerCase()}.`,
  };
}
