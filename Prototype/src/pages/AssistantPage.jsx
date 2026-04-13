import React from 'react';
import { chatHistorySessions } from '../data/mockData';

export function AssistantPage({ setActiveTab }) {
  return (
    <main className="mobile-content compact-top">
      <section className="assistant-tab-headline surface-card">
        <p className="section-label green">DriveMate AI</p>
        <h2>Your driving assistant</h2>
        <p className="assistant-tab-sub">
          Recent chats below. Open the floating AI button—the voice demo starts automatically with live captions
          and speech.
        </p>
      </section>

      <section className="surface-card chat-history-card">
        <div className="chat-history-head">
          <p className="section-label">Recent chats</p>
          <span className="chat-history-note">Older threads archive automatically</span>
        </div>
        <ul className="chat-history-list">
          {chatHistorySessions.map((session) => (
            <li key={session.id}>
              <button type="button" className="chat-history-item">
                <div className="chat-history-main">
                  <strong>{session.title}</strong>
                  <span className="chat-history-preview">{session.preview}</span>
                </div>
                <span className="chat-history-when">{session.when}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
