import React from 'react';
import { Icon } from '../components/Icon';
import { RouteMap } from '../components/RouteMap';
import { user } from '../data/mockData';

function RouteCard({ route, isSelected, isRecommended, onSelect, formatCurrency }) {
  return (
    <button
      type="button"
      className={`assistant-route-item route-choice-card ${isSelected ? 'active' : ''}`}
      onClick={() => onSelect(route.id)}
    >
      <div>
        <p>{route.label}</p>
        <strong>{route.badge}</strong>
      </div>
      <div>
        <span>ETA</span>
        <span>{route.etaMin} min</span>
      </div>
      <div>
        <span>Toll</span>
        <span>{formatCurrency(route.tollVnd)}</span>
      </div>
      <div>
        <span>Fuel / charge</span>
        <span>{formatCurrency(route.runningCostVnd)}</span>
      </div>
      <div>
        <span>Total</span>
        <span>{formatCurrency(route.totalCostVnd)}</span>
      </div>
      <div className="route-choice-foot">
        <small>{route.serviceOutcome}</small>
        {isRecommended ? <span className="route-badge recommended">Recommended</span> : null}
      </div>
    </button>
  );
}

export function RoutesPage({
  snapshot,
  selectedRoute,
  setSelectedRouteId,
  activeVehicle,
  walletBalance,
  tripCompleted,
  handleCompleteTrip,
  setActiveTab,
  formatCurrency,
}) {
  const destinationAction =
    snapshot.secondaryActions.find((action) => action.serviceType === 'parking') ??
    snapshot.secondaryActions.find((action) => action.serviceType === 'charging');
  const washAction = snapshot.secondaryActions.find(
    (action) => action.serviceType === 'car_wash',
  );

  return (
    <main className="mobile-content compact-top routes-tab-main">
      <section className="page-header routes-page-header">
        <div className="routes-page-header-main">
          <p className="section-label">Heading to</p>
          <h2>{snapshot.tripPrediction.destination}</h2>
          <p className="routes-page-sub">
            {user.homeLocation} · 3 routes · selected for {activeVehicle.shortName}
          </p>
        </div>
        <button type="button" className="text-button routes-page-back" onClick={() => setActiveTab('home')}>
          Back
        </button>
      </section>

      <section className="surface-card map-section routes-map-section">
        <RouteMap
          routes={snapshot.routeOptions}
          selectedRoute={selectedRoute}
          variant="routes"
          onSelectRoute={setSelectedRouteId}
          runningCostLabel={snapshot.runningCostLabel}
          destinationLabel={snapshot.tripPrediction.destination}
        />
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Route compare</p>
          <strong>Time + total cost + TASCO consequence</strong>
        </div>
        <div className="assistant-route-list">
          {snapshot.routeOptions.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={route.id === selectedRoute.id}
              isRecommended={route.id === snapshot.recommendedRouteId}
              onSelect={setSelectedRouteId}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </section>

      <div className="routes-coffee-card surface-card">
        <span className="routes-coffee-icon" aria-hidden="true">
          <Icon name="route" />
        </span>
        <div className="routes-coffee-copy">
          <p className="section-label">Toll station handoff</p>
          <strong>{selectedRoute.tollStationName}</strong>
          <p>
            {selectedRoute.badge} uses {selectedRoute.tollStations} toll station
            {selectedRoute.tollStations > 1 ? 's' : ''} and relies on VETC balance staying healthy before you leave.
          </p>
        </div>
      </div>

      {destinationAction ? (
        <div className="routes-coffee-card routes-parking-card surface-card">
          <span className="routes-coffee-icon" aria-hidden="true">
            <Icon name={destinationAction.serviceType === 'charging' ? 'fuel' : 'document'} />
          </span>
          <div className="routes-coffee-copy">
            <p className="section-label">Destination support</p>
            <strong>{destinationAction.locationName}</strong>
            <p>{destinationAction.reason}</p>
          </div>
        </div>
      ) : null}

      {washAction ? (
        <div className="routes-coffee-card surface-card">
          <span className="routes-coffee-icon" aria-hidden="true">
            <Icon name="wash" />
          </span>
          <div className="routes-coffee-copy">
            <p className="section-label">After-trip service</p>
            <strong>{washAction.locationName}</strong>
            <p>{washAction.reason}</p>
          </div>
        </div>
      ) : null}

      <section className="bottom-cta bottom-cta-routes surface-card">
        <div>
          <p className="section-label green">Drive plan</p>
          <h2>{selectedRoute.badge} selected</h2>
          <p>
            {activeVehicle.shortName} · Wallet after toll:{' '}
            {formatCurrency(Math.max(0, walletBalance - selectedRoute.tollVnd))}
          </p>
        </div>
        <button type="button" className="primary-action primary-action-compact" onClick={handleCompleteTrip}>
          {tripCompleted ? 'Trip logged' : 'Start trip'}
        </button>
      </section>
    </main>
  );
}
