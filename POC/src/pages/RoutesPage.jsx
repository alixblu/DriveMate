import React from 'react';
import { Icon } from '../components/Icon';
import { RouteMap } from '../components/RouteMap';
import { voiceDemoTrip, user, routeCoffeeStop, routeParkingSpot, routes } from '../data/mockData';

export function RoutesPage({
  selectedRoute,
  setSelectedRouteId,
  activeVehicle,
  walletBalance,
  tripCompleted,
  handleCompleteTrip,
  setActiveTab,
  runningCostLabel,
  formatCurrency
}) {
  return (
    <main className="mobile-content compact-top routes-tab-main">
      <section className="page-header routes-page-header">
        <div className="routes-page-header-main">
          <p className="section-label">Heading to</p>
          <h2>{voiceDemoTrip.destination}</h2>
          <p className="routes-page-sub">
            {user.homeLocation} · {routes.length} routes · tap a route under the map
          </p>
        </div>
        <button type="button" className="text-button routes-page-back" onClick={() => setActiveTab('home')}>
          Back
        </button>
      </section>

      <section className="surface-card map-section routes-map-section">
        <RouteMap
          selectedRoute={selectedRoute}
          variant="routes"
          onSelectRoute={setSelectedRouteId}
          runningCostLabel={runningCostLabel}
        />
      </section>

      <div className="routes-coffee-card surface-card">
        <span className="routes-coffee-icon" aria-hidden="true">
          <Icon name="coffee" />
        </span>
        <div className="routes-coffee-copy">
          <p className="section-label">Along the way</p>
          <strong>{routeCoffeeStop.name}</strong>
          <p>{routeCoffeeStop.detail}</p>
        </div>
      </div>

      <div className="routes-coffee-card routes-parking-card surface-card">
        <span className="routes-coffee-icon" aria-hidden="true">
          <Icon name="document" />
        </span>
        <div className="routes-coffee-copy">
          <p className="section-label">Destination support</p>
          <strong>{routeParkingSpot.name}</strong>
          <p>{routeParkingSpot.detail}</p>
        </div>
      </div>
      
      <section className="bottom-cta bottom-cta-routes surface-card">
        <div>
          <p className="section-label green">Drive plan</p>
          <h2>{selectedRoute.tag} selected</h2>
          <p>
            {activeVehicle.shortName} · Wallet after toll:{' '}
            {formatCurrency(Math.max(0, walletBalance - selectedRoute.toll))}
          </p>
        </div>
        <button type="button" className="primary-action primary-action-compact" onClick={handleCompleteTrip}>
          {tripCompleted ? 'Trip done' : 'Start trip'}
        </button>
      </section>
    </main>
  );
}
