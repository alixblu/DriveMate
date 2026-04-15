import React from 'react';
import { Icon } from '../components/Icon';
import { RouteMap } from '../components/RouteMap';
import { services } from '../data/mockData';

export function Dashboard({
  snapshot,
  scenarioCatalog,
  scenarioId,
  setScenarioId,
  activeVehicle,
  walletBalance,
  selectedRoute,
  setActiveTab,
  formatCurrency,
  onOpenNotifications,
  forecastLoading,
}) {
  const { tripPrediction, primaryAction, secondaryActions, weeklyRecap } = snapshot;

  return (
    <>
      <section className="hero-banner">
        <div className="hero-top">
          <button className="circle-button" type="button" aria-label="Menu">
            <Icon name="menu" />
          </button>
          <button
            className="circle-button notification-button"
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
          >
            <Icon name="bell" />
            <span />
          </button>
        </div>

        <div className="hero-copy">
          <p className="brand-line">DriveMate AI x VETC</p>
          <h1>Predict the trip. Activate the TASCO service.</h1>
          <p>
            DriveMate turns VETC into a daily habit by predicting where you are going, which route makes sense,
            and which TASCO service you need next.
          </p>
        </div>

        <div className="hero-chip">1900 6010</div>
        <div className="hero-car-wrap" aria-hidden="true">
          <div className={`hero-car ${activeVehicle.powertrain === 'ev' ? 'hero-car--ev' : 'hero-car--ice'}`} />
          <div className="hero-car-label">
            <span className="hero-car-name">{activeVehicle.shortName}</span>
            <span className={`hero-car-power ${activeVehicle.powertrain === 'ev' ? 'is-ev' : ''}`}>
              {activeVehicle.vehicleMode}
            </span>
          </div>
        </div>
      </section>

      <main className="mobile-content">
        <section className="commute-card ai-card predictive-action-card">
          <div className="card-header">
            <div>
              <p className="section-label green">Predictive action</p>
              <h2>{tripPrediction.destination}</h2>
            </div>
            <span className="confidence-badge">
              {forecastLoading && tripPrediction.forecastSource !== 'timesfm-live'
                ? 'Warming up...'
                : `${tripPrediction.confidencePct}% likely`}
            </span>
          </div>

          <div className="assistant-scenario-toggle dashboard-scenario-toggle">
            <span>Demo scenarios</span>
            <div className="assistant-scenario-buttons">
              {scenarioCatalog.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={`assistant-scenario-btn ${scenario.id === scenarioId ? 'active' : ''}`}
                  onClick={() => setScenarioId(scenario.id)}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
          </div>

          <p className="body-copy predictive-body-copy">
            Leave at <strong>{tripPrediction.leaveAt}</strong>
            {tripPrediction.forecastSource === 'timesfm-live' && (
              <span className="forecast-live-dot" aria-label="Live forecast" />
            )}
            , take <strong>{selectedRoute.badge}</strong>, and let
            DriveMate turn the commute into a concrete TASCO plan.
          </p>

          <div className="metric-row">
            <div className="mini-metric">
              <span>Total trip</span>
              <strong>{formatCurrency(tripPrediction.totalCostVnd)}</strong>
            </div>
            <div className="mini-metric">
              <span>Toll</span>
              <strong>{formatCurrency(tripPrediction.tollVnd)}</strong>
            </div>
            <div className="mini-metric">
              <span>{snapshot.runningCostLabel}</span>
              <strong>{formatCurrency(tripPrediction.runningCostVnd)}</strong>
            </div>
          </div>

          {tripPrediction.etaRangeMin && (
            <div className="forecast-window-strip">
              <span>Best window</span>
              <strong>{tripPrediction.etaRangeMin[0]}–{tripPrediction.etaRangeMin[1]} min</strong>
              <span className="forecast-source-label">{tripPrediction.forecastSource}</span>
            </div>
          )}

          <div className="predictive-primary-action surface-card">
            <div>
              <p className="section-label green">{primaryAction.timing}</p>
              <h3>{primaryAction.title}</h3>
              <p>{primaryAction.reason}</p>
            </div>
            <button
              type="button"
              className="primary-action"
              onClick={() => setActiveTab(primaryAction.ctaTab)}
            >
              {primaryAction.ctaLabel}
            </button>
          </div>

          <RouteMap
            routes={snapshot.routeOptions}
            selectedRoute={selectedRoute}
            runningCostLabel={snapshot.runningCostLabel}
            destinationLabel={tripPrediction.destination}
          />

          <div className="predictive-secondary-list">
            {secondaryActions.map((action) => (
              <button
                key={`${action.serviceType}-${action.title}`}
                type="button"
                className="predictive-secondary-item"
                onClick={() => setActiveTab(action.ctaTab)}
              >
                <div>
                  <span>{action.timing}</span>
                  <strong>{action.title}</strong>
                </div>
                <small>{action.serviceType.replace('_', ' ')}</small>
              </button>
            ))}
          </div>

          <div className="button-row">
            <button type="button" className="primary-action" onClick={() => setActiveTab('routes')}>
              Compare 3 routes
            </button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => setActiveTab('assistant')}
            >
              Ask DriveMate
            </button>
          </div>
        </section>

        <section className="service-card surface-card lifted">
          <div className="service-card-header">
            <div>
              <p className="section-label">TASCO services</p>
              <h2>Use prediction to trigger action</h2>
            </div>
            <div className="wallet-pill">
              <Icon name="wallet" />
              <span>{formatCurrency(walletBalance)}</span>
            </div>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                className="service-item"
                onClick={() => setActiveTab(service.tab || 'home')}
              >
                <span className="service-icon">
                  <Icon name={service.icon} />
                  {service.badge ? <small>{service.badge}</small> : null}
                </span>
                <span>{service.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="smart-card surface-card">
          <div className="smart-copy">
            <p className="section-label green">Weekly recap</p>
            <h2>{weeklyRecap.moneySavedVnd.toLocaleString('vi-VN')} VND saved this week</h2>
            <p>
              {weeklyRecap.summaryText} Users stay reliant because the same prediction links toll, parking,
              charging, or car wash into one daily decision.
            </p>
          </div>
          <button
            type="button"
            className="link-action"
            onClick={() => setActiveTab('profile')}
          >
            View recap
          </button>
        </section>
      </main>
    </>
  );
}
