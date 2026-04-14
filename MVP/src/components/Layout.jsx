import React from 'react';
import { Icon } from './Icon';
import { bottomTabs } from '../data/mockData';

export function Layout({ children, activeTab, setActiveTab, openVoiceChat }) {
  return (
    <div className="vetc-page">
      <div className="phone-shell">
        {children}

        <nav className="bottom-nav">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'bottom-tab active' : 'bottom-tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="floating-support"
          onClick={openVoiceChat}
          aria-label="Open DriveMate AI"
        >
          <div className="floating-ring">
            <Icon name="sparkles" />
          </div>
          <small>Ask AI</small>
        </button>
      </div>
    </div>
  );
}
