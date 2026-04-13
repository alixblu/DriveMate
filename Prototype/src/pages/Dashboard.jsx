import React from 'react';
import { Icon } from '../components/Icon';
import { RouteMap } from '../components/RouteMap';
import { services, articleCards, commute } from '../data/mockData';

export function Dashboard({ 
  activeVehicle, 
  walletBalance, 
  selectedRoute, 
  setActiveTab, 
  runningCostLabel,
  formatCurrency 
}) {
  return (
    <>
      <section className="hero-banner">
        <div className="hero-top">
          <button className="circle-button" type="button" aria-label="Menu">
            <Icon name="menu" />
          </button>
          <button className="circle-button notification-button" type="button" aria-label="Notifications">
            <Icon name="bell" />
            <span />
          </button>
        </div>

        <div className="hero-copy">
          <p className="brand-line">DriveMate AI x VETC</p>
          <h1>Smarter trips inside VETC</h1>
          <p>
            AI mobility companion inside the VETC experience with route intelligence, smart wallet, and trip
            insights.
          </p>
        </div>

        <div className="hero-chip">1900 6010</div>
        <div className="hero-car-wrap" aria-hidden="true">
          <div className={`hero-car ${activeVehicle.powertrain === 'ev' ? 'hero-car--ev' : 'hero-car--ice'}`} />
          <div className="hero-car-label">
            <span className="hero-car-name">{activeVehicle.shortName}</span>
            <span className={`hero-car-power ${activeVehicle.powertrain === 'ev' ? 'is-ev' : ''}`}>
              {activeVehicle.powertrain === 'ev' ? 'Electric' : 'Petrol'}
            </span>
          </div>
        </div>
      </section>

      <main className="mobile-content">
        <section className="service-card surface-card lifted">
          <div className="service-card-header">
            <div>
              <p className="section-label">VETC services</p>
              <h2>My services</h2>
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

        <section className="commute-card ai-card">
          <div className="card-header">
            <div>
              <p className="section-label green">AI commute</p>
              <h2>{commute.destination} in {commute.eta} mins</h2>
            </div>
            <span className="confidence-badge">{commute.confidence}% likely</span>
          </div>

          <p className="body-copy">
            Leave at {commute.departureTime} and DriveMate AI recommends the balanced route for better value.
          </p>

          <div className="metric-row">
            <div className="mini-metric">
              <span>Traffic</span>
              <strong>{commute.traffic}</strong>
            </div>
            <div className="mini-metric">
              <span>Toll</span>
              <strong>{formatCurrency(commute.toll)}</strong>
            </div>
            <div className="mini-metric">
              <span>{runningCostLabel.replace(' est.', '')}</span>
              <strong>{formatCurrency(commute.fuel)}</strong>
            </div>
          </div>

          <RouteMap selectedRoute={selectedRoute} />

          <div className="button-row">
            <button type="button" className="primary-action" onClick={() => setActiveTab('routes')}>
              View AI route
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

        <section className="smart-card surface-card">
          <div className="smart-copy">
            <p className="section-label green">Smart alert</p>
            <h2>{activeVehicle.shortName}: charging rates up slightly</h2>
            <p>
              Blended kWh is higher this week. The balanced lane trims highway drag—worth it when you are in the
              electric car; switch to the {activeVehicle.shortName === 'VF 8' ? 'Volvo' : 'VF 8'} in Garage if you need {activeVehicle.shortName === 'VF 8' ? 'diesel' : 'electric'} estimates.
            </p>
          </div>
          <button
            type="button"
            className="link-action"
            onClick={() => setActiveTab('assistant')}
          >
            View advice
          </button>
        </section>

        <section className="article-section">
          <div className="section-heading">
            <h2>More insights</h2>
            <button type="button" className="text-button" onClick={() => setActiveTab('profile')}>
              Sort
            </button>
          </div>

          <div className="article-grid">
            {articleCards.map((article) => (
              <article key={article.id} className={`article-card ${article.theme}`}>
                <span>{article.kicker}</span>
                <h3>{article.title}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
