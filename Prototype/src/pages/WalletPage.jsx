import React from 'react';
import { Icon } from '../components/Icon';
import { services } from '../data/mockData';

export function WalletPage({
  snapshot,
  walletBalance,
  rewardPoints,
  handleTopUp,
  setActiveTab,
  formatCurrency,
}) {
  return (
    <main className="mobile-content compact-top">
      <section className="page-header">
        <div>
          <p className="section-label">My wallet</p>
          <h2>Predict toll spend before the route starts</h2>
        </div>
        <button type="button" className="text-button" onClick={() => setActiveTab('home')}>
          Back
        </button>
      </section>

      <section className="surface-card wallet-hero">
        <div className="wallet-balance">
          <span>VETC wallet</span>
          <strong>{formatCurrency(walletBalance)}</strong>
        </div>
        <div className="wallet-meta">
          <div>
            <span>Expected weekly toll spend</span>
            <strong>{formatCurrency(snapshot.walletForecast.expectedWeeklyTollVnd)}</strong>
          </div>
          <div>
            <span>AI top-up suggestion</span>
            <strong>{formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)}</strong>
          </div>
          <div>
            <span>Projected after this route</span>
            <strong>{formatCurrency(snapshot.walletForecast.projectedAfterTripVnd)}</strong>
          </div>
        </div>
        <p className="assistant-feature-copy">
          {snapshot.walletForecast.reason}
        </p>
        <div className="button-row">
          <button type="button" className="primary-action" onClick={handleTopUp}>
            Top up {formatCurrency(snapshot.walletForecast.suggestedTopUpVnd)}
          </button>
          <button
            type="button"
            className="secondary-action"
            onClick={() => setActiveTab('assistant')}
          >
            Ask AI why
          </button>
        </div>
      </section>

      <section className="surface-card service-section">
        <h2>TASCO services linked to wallet health</h2>
        <div className="service-grid compact">
          {services.slice(0, 6).map((service) => (
            <button
              key={service.id}
              type="button"
              className="service-item compact"
              onClick={() => setActiveTab(service.tab || 'wallet')}
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

      <section className="surface-card loyalty-section">
        <div className="section-header">
          <h2>Lightweight rewards</h2>
          <button type="button" className="text-button" onClick={() => setActiveTab('profile')}>
            View recap
          </button>
        </div>
        <div className="loyalty-cards">
          <div className="loyalty-card">
            <div className="loyalty-icon toll">
              <Icon name="route" />
            </div>
            <div className="loyalty-info">
              <strong>Smart route streak</strong>
              <span>{rewardPoints.toLocaleString('vi-VN')} points collected</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
          <div className="loyalty-card">
            <div className="loyalty-icon coffee">
              <Icon name={snapshot.primaryAction.serviceType === 'charging' ? 'fuel' : 'wash'} />
            </div>
            <div className="loyalty-info">
              <strong>Service follow-through</strong>
              <span>{snapshot.weeklyRecap.serviceReliance}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '66%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
