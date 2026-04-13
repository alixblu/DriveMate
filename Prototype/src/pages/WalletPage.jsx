import React from 'react';
import { Icon } from '../components/Icon';
import { services } from '../data/mockData';

export function WalletPage({
  walletBalance,
  weeklySpend,
  recommendedTopUp,
  rewardPoints,
  handleTopUp,
  setActiveTab,
  formatCurrency
}) {
  return (
    <main className="mobile-content compact-top">
      <section className="page-header">
        <div>
          <p className="section-label">My wallet</p>
          <h2>Smart wallet and loyalty</h2>
        </div>
        <button type="button" className="text-button">
          Sort
        </button>
      </section>

      <section className="surface-card wallet-hero">
        <div className="wallet-balance">
          <span>VETC wallet</span>
          <strong>{formatCurrency(walletBalance)}</strong>
        </div>
        <div className="wallet-meta">
          <div>
            <span>Expected weekly spend</span>
            <strong>{formatCurrency(weeklySpend)}</strong>
          </div>
          <div>
            <span>AI top-up suggestion</span>
            <strong>{formatCurrency(recommendedTopUp)}</strong>
          </div>
          <div>
            <span>Reward points</span>
            <strong>{rewardPoints.toLocaleString()}</strong>
          </div>
        </div>
        <div className="button-row">
          <button type="button" className="primary-action" onClick={handleTopUp}>
            Top up {formatCurrency(recommendedTopUp)}
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
        <h2>Wallet services</h2>
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
          <h2>My Loyalty</h2>
          <button type="button" className="text-button">View all</button>
        </div>
        <div className="loyalty-cards">
          <div className="loyalty-card">
            <div className="loyalty-icon coffee">
              <Icon name="coffee" />
            </div>
            <div className="loyalty-info">
              <strong>Free Coffee</strong>
              <span>500 points left to unlock</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
          <div className="loyalty-card">
            <div className="loyalty-icon toll">
              <Icon name="route" />
            </div>
            <div className="loyalty-info">
              <strong>15% Toll Discount</strong>
              <span>Next recommended trip</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
