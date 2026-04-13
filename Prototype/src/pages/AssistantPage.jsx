import React, { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { chatHistorySessions, routes } from '../data/mockData';

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

  return (
    <main className="mobile-content compact-top">
      <section className="assistant-tab-headline surface-card">
        <p className="section-label green">DriveMate AI</p>
        <h2>Your driving assistant</h2>
        <p className="assistant-tab-sub">
          Recent chats below. Open the floating AI button—the voice demo starts automatically with live captions
          and speech.
        </p>
      </section>

      <section className="surface-card assistant-actions-card">
        <div className="assistant-actions-head">
          <p className="section-label">Tap to explore</p>
          <span className="chat-history-note">Turn AI answers into screens</span>
        </div>
        <div className="assistant-action-grid">
          <button type="button" className="chip-button assistant-action-chip" onClick={() => setActiveTab('routes')}>
            <Icon name="route" />
            <span>View route options</span>
          </button>
          <button type="button" className="chip-button assistant-action-chip" onClick={() => openRoute(selectedRoute.id)}>
            <Icon name="fuel" />
            <span>Show charging stops</span>
          </button>
          <button type="button" className="chip-button assistant-action-chip" onClick={() => setActiveTab('wallet')}>
            <Icon name="wallet" />
            <span>Top up wallet</span>
          </button>
          <button type="button" className="chip-button assistant-action-chip" onClick={() => setActiveTab('home')}>
            <Icon name="clock" />
            <span>Adjust leave time</span>
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
                <span>{activeVehicle.powertrain === 'ev' ? 'Energy' : 'Fuel'}</span>
                <span>{formatCurrency(route.fuel)}</span>
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
    </main>
  );
}
