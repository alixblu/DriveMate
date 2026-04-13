import React from 'react';
import { Icon } from '../components/Icon';

export function NotificationsPage({ setActiveTab, recommendedTopUp, formatCurrency }) {
  return (
    <main className="mobile-content compact-top">
      <section className="surface-card notifications-head-card">
        <div className="assistant-actions-head">
          <p className="section-label green">Notifications</p>
          <button
            type="button"
            className="text-button notifications-back-btn"
            onClick={() => setActiveTab('home')}
            aria-label="Back home"
          >
            <Icon name="back" />
          </button>
        </div>
      </section>

      <section className="surface-card notifications-list-card">
        <article className="notification-item">
          <div>
            <span className="notification-pill">Price alert</span>
            <strong>Charging tariff may increase tomorrow</strong>
            <p>Charge tonight to potentially save around {formatCurrency(18)} this week.</p>
          </div>
          <button type="button" className="secondary-action small" onClick={() => setActiveTab('assistant')}>
            View charging tips
          </button>
        </article>

        <article className="notification-item">
          <div>
            <span className="notification-pill">Commute alert</span>
            <strong>Going to work today?</strong>
            <p>Leave before 8:00 AM to avoid peak queue and save about 12 minutes.</p>
          </div>
          <button type="button" className="secondary-action small" onClick={() => setActiveTab('home')}>
            Plan departure
          </button>
        </article>

        <article className="notification-item">
          <div>
            <span className="notification-pill">Wallet alert</span>
            <strong>Top up before going out</strong>
            <p>Your suggested top-up today is {formatCurrency(recommendedTopUp)} to cover upcoming tolls.</p>
          </div>
          <button type="button" className="primary-action small" onClick={() => setActiveTab('wallet')}>
            Top up now
          </button>
        </article>
      </section>
    </main>
  );
}
