import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  createDriveMateSnapshot,
  loadDriveMateSnapshot,
} from './lib/recommendationEngine'
import {
  AI_NARRATIVE_LAYER,
  buildAssistantReply,
  explainRecommendation,
} from './lib/explainRecommendation'
import { DEFAULT_SCENARIO_ID, scenarioCatalog } from './lib/forecastAdapter'

const tabs = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'routes', label: 'Routes', icon: 'route' },
  { id: 'assistant', label: 'AI', icon: 'sparkles' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'profile', label: 'Me', icon: 'profile' },
]

const quickPrompts = [
  'Why refuel tonight?',
  'Best route today?',
  'How much will fuel rise cost me?',
  'What did I save this week?',
]

const DEMO_DATE = '2026-04-14'
const LIVE_FORECAST_RETRY_LIMIT = 6
const LIVE_FORECAST_RETRY_DELAY_MS = 5000

function createDecisionMessages(snapshot) {
  const decision = explainRecommendation(snapshot)

  return [
    {
      role: 'assistant',
      title: decision.headline,
      content: decision.explanation,
    },
  ]
}

function pickInitialTab() {
  if (typeof window === 'undefined') {
    return 'home'
  }

  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')

  return tabs.some((item) => item.id === tab) ? tab : 'home'
}

function pickInitialScenario() {
  if (typeof window === 'undefined') {
    return DEFAULT_SCENARIO_ID
  }

  const params = new URLSearchParams(window.location.search)
  const scenarioId = params.get('scenario')

  return scenarioCatalog.some((scenario) => scenario.id === scenarioId)
    ? scenarioId
    : DEFAULT_SCENARIO_ID
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} VND`
}

function formatFuelPrice(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} VND/L`
}

function describeFuelDelta(deltaVnd) {
  if (deltaVnd > 0) {
    return `Up ${formatCurrency(deltaVnd)} per litre`
  }

  if (deltaVnd < 0) {
    return `Down ${formatCurrency(Math.abs(deltaVnd))} per litre`
  }

  return 'No price change versus today'
}

function Icon({ name }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '1.8',
  }

  switch (name) {
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            {...commonProps}
            d="m12 3 1.7 4.4L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.6L12 3Z"
          />
          <path {...commonProps} d="m18.5 15 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 8a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
          <path {...commonProps} d="M4 10V6a2 2 0 0 1 2-2h9" />
          <path {...commonProps} d="M15 13h4" />
        </svg>
      )
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M6 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path {...commonProps} d="M18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path {...commonProps} d="M6 14V7a3 3 0 0 1 3-3h5" />
          <path {...commonProps} d="M18 10v7a3 3 0 0 1-3 3h-5" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M6 9a6 6 0 1 1 12 0c0 6 3 7 3 8H3c0-1 3-2 3-8Z" />
          <path {...commonProps} d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'fuel':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
          <path {...commonProps} d="M7 11h8" />
          <path {...commonProps} d="M17 7h2l2 2v8a2 2 0 0 1-4 0v-4" />
        </svg>
      )
    case 'gift':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M20 12v8H4v-8" />
          <path {...commonProps} d="M2 8h20v4H2zM12 8v12" />
          <path {...commonProps} d="M12 8H8.5a2.5 2.5 0 1 1 0-5c2 0 3.5 2 3.5 5ZM12 8h3.5a2.5 2.5 0 1 0 0-5c-2 0-3.5 2-3.5 5Z" />
        </svg>
      )
    case 'speaker':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M5 14h3l4 4V6L8 10H5z" />
          <path {...commonProps} d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" />
        </svg>
      )
    case 'close':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M18 6 6 18M6 6l12 12" />
        </svg>
      )
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M3 10.5 12 3l9 7.5" />
          <path {...commonProps} d="M5 10v10h14V10" />
        </svg>
      )
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="8" r="4" />
          <path {...commonProps} d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )
    case 'target':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="12" r="8" />
          <circle {...commonProps} cx="12" cy="12" r="4" />
          <path {...commonProps} d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

function AssistantPanel({
  explanation,
  providerLabel,
  messages,
  draftMessage,
  onDraftChange,
  onAsk,
  onReadAloud,
  quickPromptItems,
  voiceStatus,
  compact = false,
}) {
  return (
    <div className={compact ? 'assistant-panel assistant-panel-compact' : 'assistant-panel'}>
      <div className="assistant-headline">
        <div>
          <p className="eyebrow">Voice-ready explanation layer</p>
          <h2>DriveMate AI explains the decision, not a random dashboard</h2>
        </div>
        <button type="button" className="ghost-button icon-only" onClick={onReadAloud}>
          <Icon name="speaker" />
          <span>{voiceStatus === 'speaking' ? 'Speaking' : 'Read aloud'}</span>
        </button>
      </div>

      <div className="assistant-provider">
        <span className="provider-pill">{providerLabel}</span>
        <p>{explanation.cta}</p>
      </div>

      <div className="prompt-row" role="group" aria-label="Quick questions">
        {quickPromptItems.map((prompt) => (
          <button key={prompt} type="button" className="chip-button" onClick={() => onAsk(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-thread">
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={message.role === 'assistant' ? 'chat-bubble assistant' : 'chat-bubble user'}
          >
            <span className="chat-role">
              {message.role === 'assistant' ? 'DriveMate AI' : 'You'}
            </span>
            {message.title ? <strong>{message.title}</strong> : null}
            <p>{message.content}</p>
          </article>
        ))}
      </div>

      <form
        className="assistant-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAsk(draftMessage)
        }}
      >
        <input
          type="text"
          value={draftMessage}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Ask about fuel, route, wallet, or weekly savings"
        />
        <button type="submit" className="primary-button">
          Ask
        </button>
      </form>
    </div>
  )
}

function RouteCard({
  route,
  isSelected,
  isRecommended,
  maxEta,
  maxTotalCost,
  onSelect,
}) {
  const etaBarWidth = `${Math.max(28, (route.etaMin / maxEta) * 100)}%`
  const costBarWidth = `${Math.max(28, (route.totalCostVnd / maxTotalCost) * 100)}%`

  return (
    <article className={isSelected ? 'route-card selected' : 'route-card'}>
      <div className="route-card-top">
        <div>
          <span className={isRecommended ? 'route-badge recommended' : 'route-badge'}>
            {route.label}
          </span>
          <h3>{route.badge}</h3>
        </div>
        <button
          type="button"
          className={isSelected ? 'secondary-button selected' : 'secondary-button'}
          onClick={() => onSelect(route.id)}
        >
          {isSelected ? 'Selected' : 'Choose'}
        </button>
      </div>

      <p className="route-rationale">{route.rationale}</p>

      <div className="route-metrics">
        <div>
          <span>ETA</span>
          <strong>{route.etaMin} min</strong>
        </div>
        <div>
          <span>Toll</span>
          <strong>{formatCurrency(route.tollVnd)}</strong>
        </div>
        <div>
          <span>Fuel</span>
          <strong>{formatCurrency(route.fuelCostVnd)}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatCurrency(route.totalCostVnd)}</strong>
        </div>
      </div>

      <div className="route-bars" aria-hidden="true">
        <div>
          <span>Time</span>
          <div className="route-bar-track">
            <div className="route-bar-fill eta" style={{ width: etaBarWidth }} />
          </div>
        </div>
        <div>
          <span>Total trip cost</span>
          <div className="route-bar-track">
            <div className="route-bar-fill cost" style={{ width: costBarWidth }} />
          </div>
        </div>
      </div>
    </article>
  )
}

function App() {
  const initialSnapshot = createDriveMateSnapshot(DEMO_DATE, pickInitialScenario())
  const [activeTab, setActiveTab] = useState(() => pickInitialTab())
  const [scenarioId, setScenarioId] = useState(() => initialSnapshot.scenarioId)
  const [snapshot, setSnapshot] = useState(() => initialSnapshot)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState(() =>
    initialSnapshot.dailyDecision.routeId,
  )
  const [walletBalance, setWalletBalance] = useState(() =>
    initialSnapshot.walletForecast.balanceVnd,
  )
  const [rewardPoints, setRewardPoints] = useState(() =>
    initialSnapshot.rewards.points,
  )
  const [followedRecommendation, setFollowedRecommendation] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('idle')
  const [messages, setMessages] = useState(() =>
    createDecisionMessages(initialSnapshot),
  )
  const assistantTouchedRef = useRef(false)
  const activeScenario =
    scenarioCatalog.find((scenario) => scenario.id === scenarioId) ?? scenarioCatalog[0]

  const recommendedRoute =
    snapshot.routeOptions.find((route) => route.id === snapshot.dailyDecision.routeId) ??
    snapshot.routeOptions[0]
  const selectedRoute =
    snapshot.routeOptions.find((route) => route.id === selectedRouteId) ?? recommendedRoute
  const maxEta = Math.max(...snapshot.routeOptions.map((route) => route.etaMin))
  const maxTotalCost = Math.max(...snapshot.routeOptions.map((route) => route.totalCostVnd))
  const recommendation = explainRecommendation(snapshot)
  const projectedWalletAfterTrip = Math.max(0, walletBalance - selectedRoute.tollVnd)

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const params = new URLSearchParams(window.location.search)
    params.set('tab', activeTab)
    params.set('scenario', scenarioId)
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
  }, [activeTab, scenarioId])

  useEffect(() => {
    let cancelled = false
    let retryTimerId
    let attemptCount = 0
    const seededSnapshot = createDriveMateSnapshot(DEMO_DATE, scenarioId)

    async function hydrateSnapshot() {
      const liveSnapshot = await loadDriveMateSnapshot(DEMO_DATE, scenarioId)

      if (cancelled) {
        return
      }

      setSnapshot(liveSnapshot)
      setSelectedRouteId((currentRouteId) =>
        currentRouteId === seededSnapshot.dailyDecision.routeId
          ? liveSnapshot.dailyDecision.routeId
          : currentRouteId,
      )

      if (!assistantTouchedRef.current) {
        setMessages(createDecisionMessages(liveSnapshot))
      }

       const shouldRetry =
        scenarioId !== 'fallback' &&
        liveSnapshot.commuteWindow.fallbackUsed &&
        attemptCount < LIVE_FORECAST_RETRY_LIMIT

      if (shouldRetry) {
        attemptCount += 1
        retryTimerId = window.setTimeout(() => {
          hydrateSnapshot()
        }, LIVE_FORECAST_RETRY_DELAY_MS)
      }
    }

    hydrateSnapshot()

    return () => {
      cancelled = true
      if (retryTimerId) {
        window.clearTimeout(retryTimerId)
      }
    }
  }, [scenarioId])

  function handleAsk(question) {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      return
    }

    assistantTouchedRef.current = true

    const response = buildAssistantReply(trimmedQuestion, snapshot, {
      walletBalance,
      selectedRoute,
      rewardPoints,
    })

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: 'user', content: trimmedQuestion },
      {
        role: 'assistant',
        title: response.title,
        content: response.answer,
      },
    ])
    setDraftMessage('')
    setActiveTab('assistant')
    setAssistantOpen(true)
  }

  function handleReadAloud() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setVoiceStatus('unsupported')
      return
    }

    const latestAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant')

    if (!latestAssistantMessage) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(
      `${latestAssistantMessage.title ? `${latestAssistantMessage.title}. ` : ''}${latestAssistantMessage.content}`,
    )
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setVoiceStatus('speaking')
    utterance.onend = () => setVoiceStatus('idle')
    utterance.onerror = () => setVoiceStatus('idle')

    window.speechSynthesis.speak(utterance)
  }

  function handleRouteSelect(routeId) {
    setSelectedRouteId(routeId)

    if (!followedRecommendation && routeId === snapshot.dailyDecision.routeId) {
      setRewardPoints((currentPoints) => currentPoints + snapshot.rewards.recommendedRouteBonus)
      setFollowedRecommendation(true)
    }
  }

  function handleTopUp() {
    setWalletBalance((currentBalance) => currentBalance + snapshot.walletForecast.suggestedTopUpVnd)
  }

  function handleScenarioChange(nextScenarioId) {
    if (nextScenarioId === scenarioId) {
      return
    }

    const nextSnapshot = createDriveMateSnapshot(DEMO_DATE, nextScenarioId)

    assistantTouchedRef.current = false
    setScenarioId(nextScenarioId)
    setSnapshot(nextSnapshot)
    setSelectedRouteId(nextSnapshot.dailyDecision.routeId)
    setWalletBalance(nextSnapshot.walletForecast.balanceVnd)
    setRewardPoints(nextSnapshot.rewards.points)
    setFollowedRecommendation(false)
    setDraftMessage('')
    setMessages(createDecisionMessages(nextSnapshot))
    setAssistantOpen(false)
    setVoiceStatus('idle')

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  return (
    <div className="drivemate-page">
      <div className="app-shell">
        <header className="hero-panel">
          <div className="hero-top">
            <div>
              <p className="brand-line">VETC x DriveMate AI</p>
              <h1>Daily driving decisions that feel worth opening.</h1>
            </div>
            <button type="button" className="icon-circle" aria-label="Notifications">
              <Icon name="bell" />
            </button>
          </div>

          <div className="hero-story">
            <span className="story-pill">{activeScenario.heroLabel}</span>
            <p>{activeScenario.story}</p>
          </div>
        </header>

        <main className="app-content">
          {activeTab === 'home' ? (
            <>
              <section className="page-card scenario-switcher-card">
                <div className="scenario-switcher-top">
                  <div>
                    <p className="eyebrow">Demo states</p>
                    <h2>Switch pitch scenarios without editing code live.</h2>
                  </div>
                  <span
                    className={
                      snapshot.forecastStatus.fallbackMode
                        ? 'status-pill fallback'
                        : 'status-pill'
                    }
                  >
                    {snapshot.forecastStatus.statusLabel}
                  </span>
                </div>

                <div className="scenario-chip-row" role="tablist" aria-label="Demo scenarios">
                  {scenarioCatalog.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      className={
                        scenario.id === scenarioId
                          ? 'scenario-chip active'
                          : 'scenario-chip'
                      }
                      onClick={() => handleScenarioChange(scenario.id)}
                    >
                      <strong>{scenario.name}</strong>
                      <span>{scenario.pitchUse}</span>
                    </button>
                  ))}
                </div>

                <p className="scenario-copy">{snapshot.forecastStatus.modelStatus}</p>
              </section>

              <section className="daily-decision-card">
                <div className="decision-header">
                  <div>
                    <p className="eyebrow">Daily Decision Card</p>
                    <h2>{recommendation.headline}</h2>
                  </div>
                  <span className="confidence-pill">
                    {snapshot.dailyDecision.confidencePct}% confidence
                  </span>
                </div>

                <p className="decision-copy">{recommendation.explanation}</p>

                <div className="decision-grid">
                  <article className="decision-tile emphasis">
                    <span>Destination</span>
                    <strong>{snapshot.dailyDecision.destination}</strong>
                    <small>Leave by {snapshot.dailyDecision.leaveAt}</small>
                  </article>
                  <article className="decision-tile emphasis">
                    <span>Best-value route</span>
                    <strong>{recommendedRoute.badge}</strong>
                    <small>{recommendedRoute.etaMin} min total commute</small>
                  </article>
                  <article className="decision-tile">
                    <span>Fuel tomorrow</span>
                    <strong>{formatFuelPrice(snapshot.fuelTrend.nextPriceVndPerLitre)}</strong>
                    <small>{describeFuelDelta(snapshot.fuelTrend.deltaVnd)}</small>
                  </article>
                  <article className="decision-tile">
                    <span>Toll + fuel</span>
                    <strong>{formatCurrency(snapshot.dailyDecision.totalCostVnd)}</strong>
                    <small>
                      Toll {formatCurrency(snapshot.dailyDecision.tollVnd)} + fuel{' '}
                      {formatCurrency(snapshot.dailyDecision.fuelCostVnd)}
                    </small>
                  </article>
                  <article className="decision-tile">
                    <span>Refuel advice</span>
                    <strong>{snapshot.dailyDecision.refuelAdvice}</strong>
                    <small>{snapshot.fuelTrend.fuelType}</small>
                  </article>
                  <article className="decision-tile savings">
                    <span>Expected weekly savings</span>
                    <strong>{formatCurrency(snapshot.weeklySavings.moneySavedVnd)}</strong>
                    <small>{snapshot.weeklySavings.summaryText}</small>
                  </article>
                </div>

                <div className="decision-cta-row">
                  <button type="button" className="primary-button" onClick={() => setActiveTab('routes')}>
                    View route options
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setAssistantOpen(true)}
                  >
                    Ask AI why
                  </button>
                </div>

                <div className="decision-footer">
                  <span className="provider-pill">{AI_NARRATIVE_LAYER.provider}</span>
                  <p>{AI_NARRATIVE_LAYER.description}</p>
                </div>
              </section>

              <section className="support-grid">
                <article className="support-card fuel">
                  <div className="support-card-top">
                    <span className="icon-chip">
                      <Icon name="fuel" />
                    </span>
                    <div>
                      <p className="eyebrow">Fuel Intelligence</p>
                      <h3>{describeFuelDelta(snapshot.fuelTrend.deltaVnd)}</h3>
                    </div>
                  </div>
                  <p>
                    {snapshot.fuelTrend.deltaVnd > 0
                      ? `At your current weekly pattern, that adds about ${formatCurrency(snapshot.fuelTrend.estimatedWeeklyImpactVnd)} if you keep refueling after the change.`
                      : 'No fuel spike tomorrow, so the app shifts attention toward departure timing and total trip cost.'}
                  </p>
                </article>

                <article className="support-card">
                  <div className="support-card-top">
                    <span className="icon-chip">
                      <Icon name="target" />
                    </span>
                    <div>
                      <p className="eyebrow">Weekly recap</p>
                      <h3>{snapshot.weeklySavings.trips} trips, less waste</h3>
                    </div>
                  </div>
                  <p>{snapshot.weeklySavings.summaryText}</p>
                  <div className="mini-stats">
                    <div>
                      <span>Minutes saved</span>
                      <strong>{snapshot.weeklySavings.minutesSaved}</strong>
                    </div>
                    <div>
                      <span>Fuel spent</span>
                      <strong>{formatCurrency(snapshot.weeklySavings.fuelSpentVnd)}</strong>
                    </div>
                  </div>
                </article>

                <article className="support-card">
                  <div className="support-card-top">
                    <span className="icon-chip">
                      <Icon name="sparkles" />
                    </span>
                    <div>
                      <p className="eyebrow">Forecast boundary</p>
                      <h3>{snapshot.forecastStatus.source}</h3>
                    </div>
                  </div>
                  <p>
                    {snapshot.forecastStatus.fallbackMode
                      ? 'This fallback state proves the demo keeps the same narrative even if live forecasting fails on stage.'
                      : 'The TimesFM sidecar now feeds the forecast contract directly, while the same seeded fallback keeps the story stable if confidence or runtime drops.'}
                  </p>
                </article>

                <article className="support-card wallet">
                  <div className="support-card-top">
                    <span className="icon-chip">
                      <Icon name="wallet" />
                    </span>
                    <div>
                      <p className="eyebrow">Smart wallet</p>
                      <h3>Top up only because of tomorrow&apos;s toll</h3>
                    </div>
                  </div>
                  <p>
                    Current balance {formatCurrency(walletBalance)}. Recommended top-up{' '}
                    {formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)} to cover this
                    week without anxiety.
                  </p>
                  <button type="button" className="link-button" onClick={() => setActiveTab('wallet')}>
                    Open wallet forecast
                  </button>
                </article>
              </section>
            </>
          ) : null}

          {activeTab === 'routes' ? (
            <>
              <section className="page-card">
                <p className="eyebrow">Route planner</p>
                <h2>Three routes. One decision based on time plus total cost.</h2>
                <p className="page-copy">
                  DriveMate keeps exactly three options in view: fastest, cheapest, and
                  best value. The recommendation is not fastest by default. It is the
                  route that balances ETA, tolls, and fuel together.
                </p>
              </section>

              <section className="comparison-card">
                <div>
                  <p className="eyebrow">Recommended now</p>
                  <h3>{recommendedRoute.badge}</h3>
                  <p>{recommendedRoute.rationale}</p>
                </div>
                <div className="comparison-highlight">
                  <span>Total trip cost</span>
                  <strong>{formatCurrency(recommendedRoute.totalCostVnd)}</strong>
                  <small>
                    {recommendedRoute.etaMin} min with {formatCurrency(recommendedRoute.tollVnd)} toll
                  </small>
                </div>
              </section>

              <div className="route-list">
                {snapshot.routeOptions.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={route.id === selectedRoute.id}
                    isRecommended={route.id === recommendedRoute.id}
                    maxEta={maxEta}
                    maxTotalCost={maxTotalCost}
                    onSelect={handleRouteSelect}
                  />
                ))}
              </div>

              <section className="bottom-summary-card">
                <div>
                  <p className="eyebrow">Current selection</p>
                  <h3>{selectedRoute.badge}</h3>
                  <p>
                    Wallet after tomorrow&apos;s toll: {formatCurrency(projectedWalletAfterTrip)}
                  </p>
                </div>
                <div className="summary-actions">
                  <span className="reward-pill">
                    +{followedRecommendation ? snapshot.rewards.recommendedRouteBonus : 0} route points
                  </span>
                  <button type="button" className="primary-button" onClick={() => setAssistantOpen(true)}>
                    Explain this pick
                  </button>
                </div>
              </section>
            </>
          ) : null}

          {activeTab === 'assistant' ? (
            <section className="page-card assistant-page">
              <AssistantPanel
                explanation={recommendation}
                providerLabel={AI_NARRATIVE_LAYER.provider}
                messages={messages}
                draftMessage={draftMessage}
                onDraftChange={setDraftMessage}
                onAsk={handleAsk}
                onReadAloud={handleReadAloud}
                quickPromptItems={quickPrompts}
                voiceStatus={voiceStatus}
              />
            </section>
          ) : null}

          {activeTab === 'wallet' ? (
            <>
              <section className="page-card">
                <p className="eyebrow">Supportive feature</p>
                <h2>Wallet and rewards trigger from the same daily decision.</h2>
                <p className="page-copy">
                  These are no longer separate storylines. They simply help the user act
                  on the route and fuel recommendation without friction.
                </p>
              </section>

              <section className="wallet-card">
                <div className="wallet-balance-card">
                  <span>Current balance</span>
                  <strong>{formatCurrency(walletBalance)}</strong>
                </div>
                <div className="wallet-metrics">
                  <div>
                    <span>Expected weekly toll</span>
                    <strong>{formatCurrency(snapshot.walletForecast.expectedWeeklyTollVnd)}</strong>
                  </div>
                  <div>
                    <span>Suggested top-up</span>
                    <strong>{formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)}</strong>
                  </div>
                  <div>
                    <span>After tomorrow trip</span>
                    <strong>{formatCurrency(projectedWalletAfterTrip)}</strong>
                  </div>
                </div>
                <div className="wallet-actions">
                  <button type="button" className="primary-button" onClick={handleTopUp}>
                    Top up {formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setActiveTab('routes')}>
                    Recheck routes
                  </button>
                </div>
              </section>

              <section className="support-grid support-grid-two">
                <article className="support-card">
                  <div className="support-card-top">
                    <span className="icon-chip">
                      <Icon name="gift" />
                    </span>
                    <div>
                      <p className="eyebrow">Rewards</p>
                      <h3>{rewardPoints.toLocaleString('vi-VN')} points</h3>
                    </div>
                  </div>
                  <p>
                    Users earn points only when they follow the smarter cost-saving
                    choice. That keeps rewards attached to the core loop instead of
                    feeling decorative.
                  </p>
                </article>

                <article className="support-card">
                  <div className="support-card-top">
                    <span className="icon-chip">
                      <Icon name="sparkles" />
                    </span>
                    <div>
                      <p className="eyebrow">AI guardrail</p>
                      <h3>No made-up numbers</h3>
                    </div>
                  </div>
                  <p>
                    Every explanation here is generated from structured forecast,
                    routing, and wallet payloads. The language changes. The numbers do
                    not.
                  </p>
                </article>
              </section>
            </>
          ) : null}

          {activeTab === 'profile' ? (
            <>
              <section className="page-card">
                <p className="eyebrow">Weekly recap</p>
                <h2>Less dashboard, more proof that the product saved money.</h2>
                <p className="page-copy">{snapshot.weeklySavings.summaryText}</p>
              </section>

              <section className="profile-grid">
                <article className="profile-card">
                  <span>Trips this week</span>
                  <strong>{snapshot.weeklySavings.trips}</strong>
                </article>
                <article className="profile-card">
                  <span>Minutes saved</span>
                  <strong>{snapshot.weeklySavings.minutesSaved}</strong>
                </article>
                <article className="profile-card">
                  <span>Fuel spent</span>
                  <strong>{formatCurrency(snapshot.weeklySavings.fuelSpentVnd)}</strong>
                </article>
                <article className="profile-card">
                  <span>Money saved</span>
                  <strong>{formatCurrency(snapshot.weeklySavings.moneySavedVnd)}</strong>
                </article>
              </section>

              <section className="architecture-card">
                <div className="architecture-copy">
                  <p className="eyebrow">AI interfaces in the prototype</p>
                  <h3>Exactly the contracts from the plan are now visible in-app.</h3>
                </div>
                <ul className="architecture-list">
                  <li>
                    <strong>ForecastAdapter.getFuelTrend</strong>
                    <span>
                      Returns tomorrow&apos;s fuel change, confidence, and personalized impact.
                    </span>
                  </li>
                  <li>
                    <strong>ForecastAdapter.getCommuteWindow</strong>
                    <span>
                      Returns ETA range, traffic band, and best departure time for the
                      commute card.
                    </span>
                  </li>
                  <li>
                    <strong>Qwen explanation layer</strong>
                    <span>
                      Converts the structured recommendation into a pitch-ready story and
                      assistant answer.
                    </span>
                  </li>
                </ul>
              </section>
            </>
          ) : null}
        </main>

        {assistantOpen ? (
          <div className="assistant-overlay" role="dialog" aria-modal="true" aria-labelledby="assistant-overlay-title">
            <button type="button" className="assistant-backdrop" onClick={() => setAssistantOpen(false)} aria-label="Close assistant" />
            <div className="assistant-sheet">
              <div className="assistant-sheet-top">
                <div>
                  <p className="eyebrow">Floating assistant</p>
                  <h2 id="assistant-overlay-title">Explain today&apos;s recommendation</h2>
                </div>
                <button type="button" className="icon-circle muted" onClick={() => setAssistantOpen(false)}>
                  <Icon name="close" />
                </button>
              </div>

              <AssistantPanel
                compact
                explanation={recommendation}
                providerLabel={AI_NARRATIVE_LAYER.provider}
                messages={messages}
                draftMessage={draftMessage}
                onDraftChange={setDraftMessage}
                onAsk={handleAsk}
                onReadAloud={handleReadAloud}
                quickPromptItems={quickPrompts}
                voiceStatus={voiceStatus}
              />
            </div>
          </div>
        ) : null}

        {!assistantOpen ? (
          <button type="button" className="floating-assistant" onClick={() => setAssistantOpen(true)}>
            <span className="floating-icon">
              <Icon name="sparkles" />
            </span>
            <small>AI Assistant</small>
          </button>
        ) : null}

        <nav className="bottom-nav" aria-label="Primary navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? 'nav-button active' : 'nav-button'}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
