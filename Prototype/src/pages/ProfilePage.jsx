import React from 'react';
import { user, vehicles } from '../data/mockData';

export function ProfilePage({
  snapshot,
  activeVehicleId,
  setActiveVehicleId,
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
              Active: {snapshot.vehicle.name} · {user.homeLocation} to {user.workLocation}
            </p>
          </div>
        </div>

        <section className="surface-card garage-card" aria-label="My cars">
          <div className="garage-card-head">
            <p className="section-label">Garage</p>
            <h2>Switch the predictive service mix</h2>
            <p className="garage-card-sub">
              ICE centers toll + parking + car wash. EV swaps those moments into charging support.
            </p>
          </div>
          <div className="garage-list">
            {vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                className={vehicle.id === activeVehicleId ? 'garage-tile active' : 'garage-tile'}
                onClick={() => setActiveVehicleId(vehicle.id)}
              >
                <span className={`garage-badge ${vehicle.powertrain === 'ev' ? 'garage-badge-ev' : ''}`}>
                  {vehicle.vehicleMode}
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
          <article className="weekly-tile">
            <span>Trips</span>
            <strong>{snapshot.weeklyRecap.trips}</strong>
          </article>
          <article className="weekly-tile">
            <span>Saved</span>
            <strong>{snapshot.weeklyRecap.moneySavedVnd.toLocaleString('vi-VN')} VND</strong>
          </article>
          <article className="weekly-tile">
            <span>Traffic cut</span>
            <strong>{snapshot.weeklyRecap.trafficMinutesSaved} min</strong>
          </article>
          <article className="weekly-tile">
            <span>Service loop</span>
            <strong>{snapshot.weeklyRecap.serviceReliance}</strong>
          </article>
        </div>
      </section>

      <section className="surface-card info-card">
        <p className="section-label">Predictive recap</p>
        <h2>What this hackathon build proves</h2>
        <ul className="feature-list">
          <li>Prediction chooses the route and the TASCO service action from one payload.</li>
          <li>Wallet, toll stations, parking, charging, and car wash all stay inside the same user story.</li>
          <li>Switching vehicles changes the service recommendation, not just the icon.</li>
          <li>The demo remains reliable because it is deterministic and video-friendly on main.</li>
        </ul>
      </section>
    </main>
  );
}
