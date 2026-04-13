import React, { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { chatHistorySessions, routeParkingSpot, routes, voiceDemoTrip } from '../data/mockData';

export function AssistantPage({
  setActiveTab,
  setSelectedRouteId,
  selectedRoute,
  activeVehicle,
  walletBalance,
  recommendedTopUp,
  formatCurrency,
}) {
  const [activeRouteCard, setActiveRouteCard] = useState(selectedRoute.id);
  const [trafficScenario, setTrafficScenario] = useState('normal');
  const [activeExplore, setActiveExplore] = useState('route');
  const [nudgeState, setNudgeState] = useState({
    n1: false,
    n2: false,
    n3: false,
    n4: false,
  });
  const activeRoute = useMemo(
    () => routes.find((route) => route.id === activeRouteCard) ?? selectedRoute,
    [activeRouteCard, selectedRoute]
  );
  const scenarioConfig = useMemo(
    () => ({
      normal: { label: 'Normal flow', etaDelta: 0, delay: 6, leaveBefore: '8:20' },
      rain: { label: 'Rain expected', etaDelta: 5, delay: 12, leaveBefore: '8:10' },
      incident: { label: 'Accident on corridor', etaDelta: 11, delay: 18, leaveBefore: '7:55' },
    }),
    []
  );
  const activeScenario = scenarioConfig[trafficScenario];

  function openRoute(routeId) {
    setActiveRouteCard(routeId);
    setSelectedRouteId(routeId);
    setActiveTab('routes');
  }

  const explorePanels = {
    route: {
      title: 'Route options ready',
      lines: [
        `${activeRoute.tag}: ${activeRoute.eta + activeScenario.etaDelta} min`,
        `${activeRoute.tollStations} toll stations · ${formatCurrency(activeRoute.toll)}`,
        `Charging est. ${formatCurrency(activeRoute.charging)}`,
      ],
      cta: 'Open route screen',
      onCta: () => setActiveTab('routes'),
    },
    charging: {
      title: 'Stops on your lane',
      lines: [
        'Toll station in 8 min',
        'Charging station in 10 min',
        'Coffee stop in 24 min',
      ],
      cta: 'Open map stops',
      onCta: () => openRoute(selectedRoute.id),
    },
    parking: {
      title: 'Parking lot near destination',
      lines: [
        `${routeParkingSpot.name}`,
        '6-minute walk to office',
        '14 EV bays available now',
      ],
      cta: 'Open route screen',
      onCta: () => openRoute(selectedRoute.id),
    },
    wallet: {
      title: 'Wallet suggestion',
      lines: [
        `Current balance: ${formatCurrency(walletBalance)}`,
        `Expected next trips: ${formatCurrency(300)}`,
        `Recommended top-up: ${formatCurrency(recommendedTopUp)}`,
      ],
      cta: 'Open wallet',
      onCta: () => setActiveTab('wallet'),
    },
    departure: {
      title: 'Leave-time recommendation',
      lines: [
        `Scenario: ${activeScenario.label}`,
        `Projected ETA: ${activeRoute.eta + activeScenario.etaDelta} min`,
        `Best leave-before: ${activeScenario.leaveBefore}`,
      ],
      cta: 'Open commute card',
      onCta: () => setActiveTab('home'),
    },
  };

  const currentExplore = explorePanels[activeExplore];
  const quickInsights = [
    { label: 'Toll today', value: formatCurrency(activeRoute.toll), icon: 'route' },
    { label: 'Wallet safe', value: `${Math.max(0, walletBalance - activeRoute.toll)}k`, icon: 'wallet' },
    { label: 'Charging trend', value: '+3%', icon: 'fuel' },
    { label: 'Parking lot', value: '14 slots', icon: 'document' },
  ];
  const aiNudges = [
    {
      id: 'n1',
      icon: 'coffee',
      title: 'Coffee stop reminder',
      detail: 'Usual Highlands stop is on this lane. Set reminder at 2 km.',
      cta: 'Set reminder',
    },
    {
      id: 'n2',
      icon: 'wallet',
      title: 'Wallet protection',
      detail: `Top up ${formatCurrency(recommendedTopUp)} now to avoid low-balance interruption.`,
      cta: 'Top up',
    },
    {
      id: 'n4',
      icon: 'document',
      title: 'Parking lot reservation',
      detail: `${routeParkingSpot.name} is available. Reserve a spot before entering District 1.`,
      cta: 'Reserve slot',
    },
    {
      id: 'n3',
      icon: 'clock',
      title: 'Departure optimization',
      detail: `Leaving before ${activeScenario.leaveBefore} avoids around ${activeScenario.delay} min delay.`,
      cta: 'Apply time',
    },
  ];

  return (
    <main className="mobile-content compact-top">
      <section className="surface-card assistant-destination-box">
        <div className="assistant-destination-head">
          <div>
            <p className="section-label green">DriveMate AI</p>
            <h2>Heading to destination</h2>
          </div>
          <span className="assistant-live-badge">Live</span>
        </div>
        <div className="assistant-destination-row">
          <span className="assistant-destination-icon" aria-hidden="true">
            <Icon name="route" />
          </span>
          <div>
            <strong>{voiceDemoTrip.destination}</strong>
            <p>Current lane: {activeRoute.tag}</p>
          </div>
        </div>
        <div className="assistant-status-row">
          <div>
            <span>ETA</span>
            <strong>{activeRoute.eta + activeScenario.etaDelta} min</strong>
          </div>
          <div>
            <span>Delay risk</span>
            <strong>+{activeScenario.delay} min</strong>
          </div>
          <div>
            <span>Leave before</span>
            <strong>{activeScenario.leaveBefore}</strong>
          </div>
        </div>
      </section>

      <section className="surface-card assistant-insight-strip">
        <div className="assistant-actions-head">
          <p className="section-label">Trip pulse</p>
          <span className="chat-history-note">Updated by AI context</span>
        </div>
        <div className="assistant-insight-grid">
          {quickInsights.map((item) => (
            <div key={item.label} className="assistant-insight-tile">
              <span className="assistant-insight-icon" aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card assistant-actions-card">
        <div className="assistant-actions-head">
          <p className="section-label">Tap to explore</p>
          <span className="chat-history-note">Turn AI answers into screens</span>
        </div>
        <div className="assistant-action-grid">
          <button
            type="button"
            className={`chip-button assistant-action-chip ${activeExplore === 'route' ? 'active' : ''}`}
            onClick={() => setActiveExplore('route')}
          >
            <Icon name="route" />
            <span>View route options</span>
          </button>
          <button
            type="button"
            className={`chip-button assistant-action-chip ${activeExplore === 'charging' ? 'active' : ''}`}
            onClick={() => setActiveExplore('charging')}
          >
            <Icon name="fuel" />
            <span>Show charging stops</span>
          </button>
          <button
            type="button"
            className={`chip-button assistant-action-chip ${activeExplore === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveExplore('wallet')}
          >
            <Icon name="wallet" />
            <span>Top up wallet</span>
          </button>
          <button
            type="button"
            className={`chip-button assistant-action-chip ${activeExplore === 'parking' ? 'active' : ''}`}
            onClick={() => setActiveExplore('parking')}
          >
            <Icon name="document" />
            <span>Find parking lot</span>
          </button>
          <button
            type="button"
            className={`chip-button assistant-action-chip ${activeExplore === 'departure' ? 'active' : ''}`}
            onClick={() => setActiveExplore('departure')}
          >
            <Icon name="clock" />
            <span>Adjust leave time</span>
          </button>
        </div>
        <div className="assistant-explore-panel">
          <p className="assistant-explore-title">{currentExplore.title}</p>
          <ul className="assistant-explore-list">
            {currentExplore.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <button type="button" className="secondary-action small" onClick={currentExplore.onCta}>
            {currentExplore.cta}
          </button>
        </div>
        <div className="assistant-scenario-toggle">
          <span>Traffic simulator</span>
          <div className="assistant-scenario-buttons">
            <button
              type="button"
              className={`assistant-scenario-btn ${trafficScenario === 'normal' ? 'active' : ''}`}
              onClick={() => setTrafficScenario('normal')}
            >
              Normal
            </button>
            <button
              type="button"
              className={`assistant-scenario-btn ${trafficScenario === 'rain' ? 'active' : ''}`}
              onClick={() => setTrafficScenario('rain')}
            >
              Rain
            </button>
            <button
              type="button"
              className={`assistant-scenario-btn ${trafficScenario === 'incident' ? 'active' : ''}`}
              onClick={() => setTrafficScenario('incident')}
            >
              Incident
            </button>
          </div>
        </div>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Route compare</p>
          <strong>Pick and start in one tap</strong>
        </div>
        <div className="assistant-route-list">
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              className={`assistant-route-item ${activeRoute.id === route.id ? 'active' : ''}`}
              onClick={() => openRoute(route.id)}
            >
              <div>
                <p>{route.tag}</p>
                <strong>{route.eta} min</strong>
              </div>
              <div>
                <span>{route.tollStations} tolls</span>
                <span>{formatCurrency(route.toll)}</span>
              </div>
              <div>
                <span>Charging</span>
                <span>{formatCurrency(route.charging)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Traffic prediction</p>
          <strong>{activeScenario.label}</strong>
        </div>
        <p className="assistant-feature-copy">
          {activeRoute.tag} lane ETA now projects <strong>{activeRoute.eta + activeScenario.etaDelta} min</strong>.
          Expected extra delay is <strong>{activeScenario.delay} min</strong>. Leave before{' '}
          <strong>{activeScenario.leaveBefore}</strong>.
        </p>
        <button type="button" className="secondary-action small" onClick={() => setActiveTab('home')}>
          Open leave-time slider
        </button>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Wallet quick action</p>
          <strong>Balance {formatCurrency(walletBalance)}</strong>
        </div>
        <p className="assistant-feature-copy">
          Expected next-trip toll spend is {formatCurrency(300)}. Suggested top-up: <strong>{formatCurrency(recommendedTopUp)}</strong>.
        </p>
        <button type="button" className="secondary-action small" onClick={() => setActiveTab('wallet')}>
          Top up now
        </button>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">AI nudges</p>
          <strong>Suggested actions for this trip</strong>
        </div>
        <div className="assistant-nudges-list">
          {aiNudges.map((nudge) => (
            <article key={nudge.id} className="assistant-nudge-item">
              <span className="assistant-nudge-icon" aria-hidden="true">
                <Icon name={nudge.icon} />
              </span>
              <div>
                <strong>{nudge.title}</strong>
                <p>{nudge.detail}</p>
              </div>
              <button
                type="button"
                className={`assistant-nudge-cta ${nudgeState[nudge.id] ? 'done' : ''}`}
                onClick={() => {
                  setNudgeState((curr) => ({ ...curr, [nudge.id]: true }));
                  if (nudge.id === 'n2') setActiveTab('wallet');
                  if (nudge.id === 'n3') setActiveTab('home');
                  if (nudge.id === 'n4') setActiveTab('routes');
                }}
              >
                <span>{nudgeState[nudge.id] ? 'Done' : nudge.cta}</span>
                <small>{nudgeState[nudge.id] ? 'Saved' : '1 tap'}</small>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card chat-history-card">
        <div className="chat-history-head">
          <p className="section-label">Recent chats</p>
          <span className="chat-history-note">Older threads archive automatically</span>
        </div>
        <ul className="chat-history-list">
          {chatHistorySessions.map((session) => (
            <li key={session.id}>
              <button type="button" className="chat-history-item">
                <div className="chat-history-main">
                  <strong>{session.title}</strong>
                  <span className="chat-history-preview">{session.preview}</span>
                </div>
                <span className="chat-history-when">{session.when}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="assistant-sticky-actions surface-card">
        <button type="button" className="secondary-action small" onClick={() => setActiveTab('routes')}>
          Open route + parking
        </button>
        <button type="button" className="primary-action small" onClick={() => setActiveTab('wallet')}>
          Quick top up
        </button>
      </section>
    </main>
  );
}
