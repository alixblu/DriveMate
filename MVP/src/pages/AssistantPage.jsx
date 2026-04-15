import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../components/Icon';

function buildActionPanel(action, snapshot, formatCurrency) {
  switch (action.serviceType) {
    case 'toll_wallet':
      return {
        title: action.title,
        lines: [
          `Current balance: ${formatCurrency(snapshot.walletForecast.balanceVnd)}`,
          `Expected weekly tolls: ${formatCurrency(snapshot.walletForecast.expectedWeeklyTollVnd)}`,
          `Recommended top-up: ${formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)}`,
        ],
        cta: action.ctaLabel,
        ctaTab: action.ctaTab,
      };
    case 'toll_station':
      return {
        title: action.title,
        lines: [
          `${snapshot.selectedRoute.badge}: ${snapshot.selectedRoute.tollStations} toll stations`,
          `Toll total: ${formatCurrency(snapshot.selectedRoute.tollVnd)}`,
          'This is the part Google Maps cannot personalize with wallet state.',
        ],
        cta: action.ctaLabel,
        ctaTab: action.ctaTab,
      };
    case 'charging':
      return {
        title: action.title,
        lines: [
          `${snapshot.vehicle.shortName} is in EV mode`,
          `Charge plan: ${action.locationName}`,
          `Trip energy: ${formatCurrency(snapshot.tripPrediction.runningCostVnd)}`,
        ],
        cta: action.ctaLabel,
        ctaTab: action.ctaTab,
      };
    case 'car_wash':
      return {
        title: action.title,
        lines: [
          'Rainy traffic increases post-trip wash demand',
          `Recommended location: ${action.locationName}`,
          'This is a retention hook after the commute ends, not just during planning.',
        ],
        cta: action.ctaLabel,
        ctaTab: action.ctaTab,
      };
    case 'parking':
    default:
      return {
        title: action.title,
        lines: [
          `Destination: ${snapshot.tripPrediction.destination}`,
          `Arrival service: ${action.locationName}`,
          'Prediction is useful only if it ends in a concrete arrival action.',
        ],
        cta: action.ctaLabel,
        ctaTab: action.ctaTab,
      };
  }
}

const TRAFFIC_SCENARIOS = [
  { id: 'normal',   label: 'Normal',   delta: 0 },
  { id: 'rain',     label: 'Rain',     delta: 5 },
  { id: 'incident', label: 'Incident', delta: 11 },
];

export function AssistantPage({
  snapshot,
  setActiveTab,
  setSelectedRouteId,
  formatCurrency,
  messages = [],
  onAsk,
  qwenLoading = false,
}) {
  const [trafficId, setTrafficId] = useState('normal');
  const [draft, setDraft] = useState('');
  const threadRef = useRef(null);
  const activeTraffic = TRAFFIC_SCENARIOS.find((t) => t.id === trafficId) ?? TRAFFIC_SCENARIOS[0];
  const liveEta = snapshot.tripPrediction.etaMin + activeTraffic.delta;

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const actionOptions = useMemo(
    () => [
      snapshot.primaryAction,
      ...snapshot.secondaryActions,
      {
        serviceType: 'leave_time',
        title: `Leave before ${snapshot.tripPrediction.leaveAt}`,
        reason: snapshot.scenario.trafficBand,
        ctaLabel: 'Open commute card',
        ctaTab: 'home',
      },
    ],
    [snapshot],
  );
  const [activeActionId, setActiveActionId] = useState(actionOptions[0].serviceType);
  const activeAction =
    actionOptions.find((action) => action.serviceType === activeActionId) ?? actionOptions[0];
  const currentPanel =
    activeAction.serviceType === 'leave_time'
      ? {
          title: `${activeAction.title}${activeTraffic.delta > 0 ? ` (${activeTraffic.label}: +${activeTraffic.delta} min)` : ''}`,
          lines: [
            snapshot.tripPrediction.trafficBand,
            `Current route ETA: ${liveEta} min`,
            `Leaving at ${snapshot.tripPrediction.leaveAt} protects about ${snapshot.scenario.leaveEarlyMinutesSaved} minutes.`,
          ],
          cta: activeAction.ctaLabel,
          ctaTab: activeAction.ctaTab,
        }
      : buildActionPanel(activeAction, snapshot, formatCurrency);

  return (
    <main className="mobile-content compact-top">
      <section className="surface-card assistant-destination-box">
        <div className="assistant-destination-head">
          <div>
            <p className="section-label green">DriveMate AI</p>
            <h2>Explain the same predictive payload</h2>
          </div>
          <span className="assistant-live-badge">{snapshot.scenarioStatus.label}</span>
        </div>
        <div className="assistant-destination-row">
          <span className="assistant-destination-icon" aria-hidden="true">
            <Icon name="route" />
          </span>
          <div>
            <strong>{snapshot.tripPrediction.destination}</strong>
            <p>{snapshot.assistantBrief.headline}</p>
          </div>
        </div>
        <div className="assistant-status-row">
          <div>
            <span>ETA</span>
            <strong>
              {liveEta} min{activeTraffic.delta > 0 ? ` (+${activeTraffic.delta})` : ''}
            </strong>
          </div>
          <div>
            <span>Leave at</span>
            <strong>{snapshot.tripPrediction.leaveAt}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatCurrency(snapshot.tripPrediction.totalCostVnd)}</strong>
          </div>
        </div>
        <div className="assistant-scenario-toggle" style={{ marginTop: 10 }}>
          <span>Traffic condition</span>
          <div className="assistant-scenario-buttons">
            {TRAFFIC_SCENARIOS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`assistant-scenario-btn${trafficId === t.id ? ' active' : ''}`}
                onClick={() => setTrafficId(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="traffic-note">{snapshot.tripPrediction.trafficBand}</p>
        </div>
      </section>

      <section className="surface-card assistant-insight-strip">
        <div className="assistant-actions-head">
          <p className="section-label">Trip pulse</p>
          <span className="chat-history-note">TASCO services inside the recommendation</span>
        </div>
        <div className="assistant-insight-grid">
          <div className="assistant-insight-tile">
            <span className="assistant-insight-icon" aria-hidden="true">
              <Icon name="wallet" />
            </span>
            <div>
              <p>Wallet buffer</p>
              <strong>{formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)}</strong>
            </div>
          </div>
          <div className="assistant-insight-tile">
            <span className="assistant-insight-icon" aria-hidden="true">
              <Icon name="route" />
            </span>
            <div>
              <p>Toll stations</p>
              <strong>{snapshot.selectedRoute.tollStations}</strong>
            </div>
          </div>
          <div className="assistant-insight-tile">
            <span className="assistant-insight-icon" aria-hidden="true">
              <Icon name={snapshot.vehicle.powertrain === 'ev' ? 'fuel' : 'document'} />
            </span>
            <div>
              <p>Arrival service</p>
              <strong>{snapshot.selectedRoute.destinationServiceName}</strong>
            </div>
          </div>
          <div className="assistant-insight-tile">
            <span className="assistant-insight-icon" aria-hidden="true">
              <Icon name="sparkles" />
            </span>
            <div>
              <p>Weekly savings</p>
              <strong>{formatCurrency(snapshot.weeklyRecap.moneySavedVnd)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card assistant-actions-card">
        <div className="assistant-actions-head">
          <p className="section-label">Direct actions</p>
          <span className="chat-history-note">No generic AI for AI&apos;s sake</span>
        </div>
        <div className="assistant-action-grid">
          {actionOptions.map((action) => (
            <button
              key={action.serviceType}
              type="button"
              className={`chip-button assistant-action-chip ${activeAction.serviceType === action.serviceType ? 'active' : ''}`}
              onClick={() => setActiveActionId(action.serviceType)}
            >
              <Icon
                name={
                  action.serviceType === 'toll_wallet'
                    ? 'wallet'
                    : action.serviceType === 'toll_station'
                      ? 'route'
                      : action.serviceType === 'charging'
                        ? 'fuel'
                        : action.serviceType === 'car_wash'
                          ? 'wash'
                          : action.serviceType === 'leave_time'
                            ? 'clock'
                            : 'document'
                }
              />
              <span>{action.ctaLabel}</span>
            </button>
          ))}
        </div>
        <div className="assistant-explore-panel">
          <p className="assistant-explore-title">{currentPanel.title}</p>
          <ul className="assistant-explore-list">
            {currentPanel.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <button type="button" className="secondary-action small" onClick={() => setActiveTab(currentPanel.ctaTab)}>
            {currentPanel.cta}
          </button>
        </div>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Route compare</p>
          <strong>Choose the lane that drives every other recommendation</strong>
        </div>
        <div className="assistant-route-list">
          {snapshot.routeOptions.map((route) => (
            <button
              key={route.id}
              type="button"
              className={`assistant-route-item ${snapshot.selectedRoute.id === route.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedRouteId(route.id);
                setActiveTab('routes');
              }}
            >
              <div>
                <p>{route.badge}</p>
                <strong>{route.etaMin} min</strong>
              </div>
              <div>
                <span>Toll</span>
                <span>{formatCurrency(route.tollVnd)}</span>
              </div>
              <div>
                <span>Total</span>
                <span>{formatCurrency(route.totalCostVnd)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Why judges should care</p>
          <strong>Predictive AI only matters if it changes behavior</strong>
        </div>
        <p className="assistant-feature-copy">
          {snapshot.assistantBrief.explanation}
        </p>
        <button type="button" className="secondary-action small" onClick={() => setActiveTab('home')}>
          Back to predictive card
        </button>
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">DriveMate AI Chat</p>
          <strong>Ask about route, fuel, wallet, or departure time</strong>
        </div>
        <div className="assistant-action-grid">
          {snapshot.quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              className="chip-button assistant-action-chip"
              onClick={() => setDraft(q)}
            >
              <Icon name="sparkles" />
              <span>{q}</span>
            </button>
          ))}
        </div>
        <div ref={threadRef} className="conversation-thread" style={{ marginTop: 12 }}>
          {messages.map((m) => (
            <div key={m.id} className={`message-row ${m.role === 'assistant' ? 'assistant' : 'driver'}`}>
              <div className={`message-bubble ${m.role === 'assistant' ? 'assistant' : 'driver'}`}>
                {m.title ? <strong>{m.title}. </strong> : null}
                {m.content}
              </div>
            </div>
          ))}
          {qwenLoading && (
            <div className="message-row assistant">
              <div className="message-bubble assistant">
                <em className="typing-indicator">DriveMate is thinking...</em>
              </div>
            </div>
          )}
        </div>
        <form
          className="chat-composer chat-composer-row"
          style={{ marginTop: 10 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim() && !qwenLoading) {
              onAsk?.(draft);
              setDraft('');
            }
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about route, wallet, fuel..."
            aria-label="Message DriveMate AI"
            disabled={qwenLoading}
          />
          <div className="composer-action-group">
            <button
              type="submit"
              className="composer-icon-btn composer-send-btn"
              disabled={qwenLoading || !draft.trim()}
              aria-label="Send"
            >
              <Icon name="send" />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
