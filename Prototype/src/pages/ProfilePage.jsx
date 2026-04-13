import React from 'react';
import { vehicles, user, weeklyMetrics } from '../data/mockData';

export function ProfilePage({ 
  activeVehicle, 
  activeVehicleId, 
  setActiveVehicleId, 
  runningCostLabel,
  setActiveTab 
}) {
  return (
    <main className="mobile-content compact-top">
      <section className="surface-card profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{user.name[0]}</div>
          <div>
            <p className="section-label green">Driver profile</p>
            <h2>{user.name}</h2>
            <p>
              Active: {activeVehicle.name} • {user.homeLocation} to {user.workLocation}
            </p>
          </div>
        </div>

        <section className="surface-card garage-card" aria-label="My cars">
          <div className="garage-card-head">
            <p className="section-label">Garage</p>
            <h2>My cars</h2>
            <p className="garage-card-sub">Choose today&apos;s vehicle for toll and {runningCostLabel.toLowerCase()} hints.</p>
          </div>
          <div className="garage-list">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                className={
                  vehicle.id === activeVehicleId ? 'garage-tile active' : 'garage-tile'
                }
                onClick={() => setActiveVehicleId(vehicle.id)}
              >
                <span className={`garage-badge ${vehicle.powertrain === 'ev' ? 'garage-badge-ev' : ''}`}>
                  {vehicle.powertrain === 'ev' ? 'EV' : 'ICE'}
                </span>
                <span className="garage-tile-main">
                  <strong>{vehicle.name}</strong>
                  <span>{vehicle.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="weekly-grid">
          {weeklyMetrics.map((metric) => (
            <article key={metric.label} className="weekly-tile">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card info-card">
        <p className="section-label">AI recap</p>
        <h2>What DriveMate adds inside VETC</h2>
        <ul className="feature-list">
          <li>Morning commute prediction with confidence score.</li>
          <li>Map-based route recommendation instead of plain route text.</li>
          <li>Wallet, fuel or EV energy, rewards, and rescue in one assistant layer.</li>
          <li>Weekly insight card for business value and retention story.</li>
        </ul>
      </section>
    </main>
  );
}
