export const AI_NARRATIVE_LAYER = {
  provider: 'Qwen narrative layer on Alibaba Cloud',
  description:
    'Structured routing and forecast outputs are converted into human-language recommendations for the commute card, assistant, and weekly recap.',
}

export function explainRecommendation(snapshot) {
  const recommendedRoute =
    snapshot.routeOptions.find((route) => route.id === snapshot.dailyDecision.routeId) ??
    snapshot.routeOptions[0]
  const headline =
    snapshot.fuelTrend.deltaVnd > 0
      ? `Refuel tonight, leave at ${snapshot.dailyDecision.leaveAt}, take ${recommendedRoute.badge}.`
      : `Leave at ${snapshot.dailyDecision.leaveAt} and take ${recommendedRoute.badge}.`
  const fuelLine =
    snapshot.fuelTrend.deltaVnd > 0
      ? `Fuel is forecast to rise by ${snapshot.fuelTrend.deltaVnd} VND per litre tomorrow.`
      : 'Fuel is flat tomorrow, so the recommendation leans on time and total trip cost instead of refill urgency.'
  const fallbackLine = snapshot.forecastStatus.fallbackMode
    ? ' Live forecasting is unavailable, so this explanation is being driven by the seeded fallback payload.'
    : ''

  return {
    headline,
    explanation: `${fuelLine} DriveMate expects your ${recommendedRoute.badge.toLowerCase()} route to keep the office commute near ${recommendedRoute.etaMin} minutes while landing around ${new Intl.NumberFormat('vi-VN').format(recommendedRoute.totalCostVnd)} VND total.${fallbackLine}`,
    cta: 'Open routes to compare the trade-off, then use the assistant to hear the reasoning in plain language.',
  }
}

function answerBestRoute(snapshot) {
  const recommendedRoute =
    snapshot.routeOptions.find((route) => route.id === snapshot.dailyDecision.routeId) ??
    snapshot.routeOptions[0]

  return {
    title: 'Best route today',
    answer: `${recommendedRoute.badge} is the recommendation because it avoids the extreme price of the fastest lane while staying much quicker than the cheapest lane. The projected trip lands at ${recommendedRoute.etaMin} minutes and ${new Intl.NumberFormat('vi-VN').format(recommendedRoute.totalCostVnd)} VND total.`,
  }
}

function answerFuelImpact(snapshot) {
  if (snapshot.fuelTrend.deltaVnd === 0) {
    return {
      title: 'Fuel impact forecast',
      answer:
        'Tomorrow fuel is forecast to stay flat, so DriveMate does not force a refill CTA. The value still comes from leaving before congestion and avoiding the most expensive lane.',
    }
  }

  return {
    title: 'Fuel impact forecast',
    answer: `Tomorrow's ${snapshot.fuelTrend.deltaVnd} VND per litre increase would add about ${new Intl.NumberFormat('vi-VN').format(snapshot.fuelTrend.estimatedWeeklyImpactVnd)} VND to your weekly spend if you refill after the price change. That is why the app pushes the refuel-tonight moment so hard.`,
  }
}

function answerWeeklySavings(snapshot) {
  return {
    title: 'Weekly savings recap',
    answer: `${snapshot.weeklySavings.summaryText} You also save about ${snapshot.weeklySavings.minutesSaved} of traffic time by leaving before the peak window instead of drifting into the 07:50 to 08:30 jam.`,
  }
}

function answerWallet(snapshot, walletBalance, selectedRoute) {
  const projectedAfterTrip = Math.max(0, walletBalance - selectedRoute.tollVnd)

  return {
    title: 'Wallet outlook',
    answer: `You have ${new Intl.NumberFormat('vi-VN').format(walletBalance)} VND in the VETC wallet. After the currently selected ${selectedRoute.badge.toLowerCase()} route, you would still have ${new Intl.NumberFormat('vi-VN').format(projectedAfterTrip)} VND. DriveMate still suggests a ${new Intl.NumberFormat('vi-VN').format(snapshot.walletForecast.suggestedTopUpVnd)} VND top-up so the next few tolls stay covered.`,
  }
}

export function buildAssistantReply(question, snapshot, context) {
  const normalizedQuestion = question.toLowerCase()

  if (
    normalizedQuestion.includes('route') ||
    normalizedQuestion.includes('leave') ||
    normalizedQuestion.includes('commute')
  ) {
    return answerBestRoute(snapshot)
  }

  if (
    normalizedQuestion.includes('fuel') ||
    normalizedQuestion.includes('refuel') ||
    normalizedQuestion.includes('price')
  ) {
    return answerFuelImpact(snapshot)
  }

  if (
    normalizedQuestion.includes('wallet') ||
    normalizedQuestion.includes('top up') ||
    normalizedQuestion.includes('top-up')
  ) {
    return answerWallet(snapshot, context.walletBalance, context.selectedRoute)
  }

  if (
    normalizedQuestion.includes('week') ||
    normalizedQuestion.includes('save') ||
    normalizedQuestion.includes('saved')
  ) {
    return answerWeeklySavings(snapshot)
  }

  return {
    title: 'Daily decision summary',
    answer: `${explainRecommendation(snapshot).explanation} You currently have ${context.rewardPoints.toLocaleString('vi-VN')} reward points waiting if you follow the smarter route.`,
  }
}
