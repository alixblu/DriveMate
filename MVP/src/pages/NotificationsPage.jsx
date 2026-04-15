import React from 'react';
import { Icon } from '../components/Icon';

export function NotificationsPage({ snapshot, setActiveTab }) {
  return (
    <main className="mobile-content compact-top">
      <section className="surface-card notifications-head-card">
        <div className="assistant-actions-head">
          <p className="section-label green">Predictive alerts</p>
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
        {snapshot.fuelAlert?.active && (
          <article className="notification-item">
            <div>
              <span className="notification-pill">Live fuel alert</span>
              <strong>
                Fuel rising +{snapshot.fuelAlert.deltaVnd.toLocaleString('vi-VN')} VND/L tomorrow
              </strong>
              <p>
                Estimated weekly impact: ~{snapshot.fuelAlert.weeklyImpactVnd.toLocaleString('vi-VN')} VND. Top up tonight before the price changes.
              </p>
            </div>
            <button
              type="button"
              className="primary-action small"
              onClick={() => setActiveTab('wallet')}
            >
              Top up wallet
            </button>
          </article>
        )}
        {snapshot.notificationItems.map((notification) => (
          <article key={notification.id} className="notification-item">
            <div>
              <span className="notification-pill">{notification.pill}</span>
              <strong>{notification.title}</strong>
              <p>{notification.detail}</p>
            </div>
            <button
              type="button"
              className={notification.ctaTab === 'wallet' ? 'primary-action small' : 'secondary-action small'}
              onClick={() => setActiveTab(notification.ctaTab)}
            >
              {notification.ctaLabel}
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
