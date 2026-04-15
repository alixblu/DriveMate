import React, { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { LeafletMap } from '../components/LeafletMap';
import { user } from '../data/mockData';
import {
  DESTINATIONS,
  ORIGIN,
  getRelevantPois,
  getRoutePolyline,
  resolveDestination,
} from '../data/mapData';

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
  activeDestination,
  setActiveDestination,
}) {
  const routeOptions = snapshot.routeOptions ?? [];
  const fallbackRoute = routeOptions[0] ?? null;
  const selectedRouteSafe = selectedRoute ?? fallbackRoute;
  const selectedRouteOptions = selectedRouteSafe
    ? routeOptions.filter((route) => route.id === selectedRouteSafe.id)
    : [];
  const [destDraft, setDestDraft] = useState({
    key: activeDestination.key,
    value: activeDestination.label,
  });
  const destInput = destDraft.key === activeDestination.key ? destDraft.value : activeDestination.label;
  const showDestinationChips = !destInput.trim();
  const destinationAction =
    snapshot.secondaryActions?.find((action) => action.serviceType === 'parking') ??
    snapshot.secondaryActions?.find((action) => action.serviceType === 'charging');
  const washAction = snapshot.secondaryActions?.find(
    (action) => action.serviceType === 'car_wash',
  );
  const visiblePois = useMemo(
    () => getRelevantPois(activeDestination.key),
    [activeDestination.key],
  );
  const routeMapData = useMemo(
    () =>
      (snapshot.routeOptions ?? []).map((route) => ({
        ...route,
        label: route.badge,
        shortLabel:
          route.badge === 'Best Value'
            ? 'B'
            : route.badge === 'Fastest'
              ? 'F'
              : 'C',
        points: getRoutePolyline(route.id, activeDestination.key),
      })),
    [activeDestination.key, snapshot.routeOptions],
  );

  function applyDestination(text) {
    const cleanedText = text.trim();
    const nextDestination = resolveDestination(cleanedText || activeDestination.label);
    setActiveDestination(nextDestination);
    setDestDraft({ key: nextDestination.key, value: nextDestination.label });
  }

  return (
    <main className="mobile-content compact-top routes-tab-main">
      <section className="page-header routes-page-header">
        <div className="routes-page-header-main">
          <p className="section-label">Heading to</p>
          <h2>{activeDestination.label}</h2>
          <p className="routes-page-sub">
            {user.homeLocation} · 3 simulation routes · selected for {activeVehicle.shortName}
          </p>
        </div>
        <button type="button" className="text-button routes-page-back" onClick={() => setActiveTab('home')}>
          Back
        </button>
      </section>

      <section className="surface-card map-section routes-map-section">
        <div className="routes-dest-input-row">
          <span className="routes-dest-input-icon" aria-hidden="true">
            <Icon name="route" />
          </span>
          <input
            type="text"
            value={destInput}
            onChange={(event) =>
              setDestDraft({ key: activeDestination.key, value: event.target.value })
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyDestination(destInput);
              }
            }}
            placeholder="Where are you going? e.g. People's Committee Office"
            aria-label="Destination"
          />
          <button type="button" className="routes-dest-apply" onClick={() => applyDestination(destInput)}>
            <Icon name="send" />
          </button>
        </div>
        {showDestinationChips ? (
          <div className="routes-dest-chips">
            {DESTINATIONS.map((destination) => (
              <button
                key={destination.key}
                type="button"
                className={`chip-button routes-dest-chip${activeDestination.key === destination.key ? ' active' : ''}`}
                onClick={() => {
                  setActiveDestination(destination);
                  setDestDraft({ key: destination.key, value: destination.label });
                }}
              >
                {destination.label}
              </button>
            ))}
          </div>
        ) : null}
        {selectedRouteSafe ? (
          <div className="routes-map-kpis">
            <div>
              <span>Selected</span>
              <strong>{selectedRouteSafe.badge}</strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{selectedRouteSafe.etaMin} min</strong>
            </div>
            <div>
              <span>Total cost</span>
              <strong>{formatCurrency(selectedRouteSafe.totalCostVnd)}</strong>
            </div>
          </div>
        ) : null}
        <LeafletMap
          routes={routeMapData}
          selectedRouteId={selectedRouteSafe?.id ?? null}
          pois={visiblePois}
          origin={ORIGIN}
          destination={activeDestination}
          onSelectRoute={setSelectedRouteId}
        />
      </section>

      <section className="surface-card assistant-feature-card">
        <div className="assistant-feature-head">
          <p className="section-label">Route compare</p>
          <strong>Time + total cost + TASCO consequence</strong>
        </div>
        {routeOptions.length ? (
          <div className="routes-quick-picker">
            {routeOptions.map((route) => (
              <button
                key={`quick-${route.id}`}
                type="button"
                className={`chip-button routes-quick-chip${
                  route.id === selectedRouteSafe?.id ? ' active' : ''
                }`}
                onClick={() => setSelectedRouteId(route.id)}
              >
                {route.badge} · {route.etaMin}m
              </button>
            ))}
          </div>
        ) : null}
        <div className="assistant-route-list">
          {selectedRouteOptions.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              isSelected={route.id === selectedRouteSafe?.id}
              isRecommended={route.id === snapshot.recommendedRouteId}
              onSelect={setSelectedRouteId}
              formatCurrency={formatCurrency}
            />
          ))}
          {!selectedRouteOptions.length ? (
            <div className="routes-empty-card">
              <strong>No route selected</strong>
              <p>Pick one option from quick route picker to view details.</p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="routes-coffee-card surface-card">
        <span className="routes-coffee-icon" aria-hidden="true">
          <Icon name="route" />
        </span>
        <div className="routes-coffee-copy">
          <p className="section-label">Toll station handoff</p>
          <strong>{selectedRouteSafe?.tollStationName ?? 'No toll station selected'}</strong>
          <p>
            {selectedRouteSafe?.badge ?? 'Selected route'} uses {selectedRouteSafe?.tollStations ?? 0}{' '}
            toll station{(selectedRouteSafe?.tollStations ?? 0) > 1 ? 's' : ''} and relies on VETC
            balance staying healthy before you leave.
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

      {tripCompleted ? (
        <section className="bottom-cta bottom-cta-routes surface-card trip-logged-card">
          <div className="trip-logged-content">
            <span className="success-check-mark" aria-hidden="true">✓</span>
            <div>
              <p className="section-label green">Trip Success</p>
              <h2>Trip logged successfully</h2>
              <p>Toll deducted. Rewards +{snapshot.rewards.recommendedRouteBonus} pts added to your wallet.</p>
            </div>
          </div>
          <button type="button" className="secondary-action" onClick={() => setActiveTab('home')}>
            Back home
          </button>
        </section>
      ) : (
        <section className="bottom-cta bottom-cta-routes surface-card">
          <div>
            <p className="section-label green">Drive plan</p>
            <h2>{selectedRouteSafe?.badge ?? 'Route'} selected</h2>
            <p>
              {activeVehicle.shortName} · Wallet after toll:{' '}
              {formatCurrency(Math.max(0, walletBalance - (selectedRouteSafe?.tollVnd ?? 0)))}
            </p>
          </div>
          <button type="button" className="primary-action primary-action-compact" onClick={handleCompleteTrip}>
            Start trip
          </button>
        </section>
      )}
    </main>
  );
}
