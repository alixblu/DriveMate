import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

export function VoiceChatOverlay({
  voiceChatOpen,
  closeVoiceChat,
  voiceState,
  voiceError,
  startLiveRecognition,
  stopRecognition,
  voiceContext,
  quickPrompts,
  messages,
  onAsk,
  onReadAloud,
  liveTranscript,
  qwenLoading,
}) {
  const [draftMessage, setDraftMessage] = useState('');
  const threadRef = useRef(null);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);

  function sendTypedMessage(event) {
    event.preventDefault();
    const normalized = draftMessage.trim();
    if (!normalized) return;
    onAsk(normalized);
    setDraftMessage('');
  }

  if (!voiceChatOpen) return null;

  return (
    <div
      className="voice-chat-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-chat-title"
    >
      <button type="button" className="voice-chat-backdrop" onClick={closeVoiceChat} aria-label="Close voice chat" />
      <div className="voice-chat-sheet">
        <div className="voice-chat-handle" aria-hidden="true" />
        <header className="voice-chat-top">
          <div className="voice-chat-brand">
            <span className="voice-chat-brand-mark" aria-hidden="true">
              <Icon name="sparkles" />
            </span>
            <div>
              <p className="section-label green">DriveMate AI</p>
              <h2 id="voice-chat-title">Voice companion</h2>
            </div>
          </div>
          <div className="voice-chat-top-actions">
            <button
              type="button"
              className={voiceState === 'listening' || voiceState === 'transcribing' ? 'mic-button active' : 'mic-button'}
              onClick={() =>
                voiceState === 'listening' || voiceState === 'transcribing'
                  ? stopRecognition()
                  : startLiveRecognition()
              }
              aria-label="Speak to the assistant"
            >
              <Icon name="mic" />
            </button>
            <button type="button" className="voice-chat-close" onClick={closeVoiceChat} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
        </header>

        <div className="voice-chat-body">
          <div className="voice-chat-scroll">
            <section className="voice-trip-context surface-card" aria-label="Trip context">
              <h3 className="voice-trip-context-title">Current trip</h3>
              <div className="voice-trip-facts">
                <div className="voice-trip-fact">
                  <span className="voice-trip-fact-label">Destination</span>
                  <span className="voice-trip-fact-value">{voiceContext.destination}</span>
                </div>
                <div className="voice-trip-fact">
                  <span className="voice-trip-fact-label">Selected route</span>
                  <span className="voice-trip-fact-value">{voiceContext.routeLabel}</span>
                </div>
                <div className="voice-trip-fact">
                  <span className="voice-trip-fact-label">ETA</span>
                  <span className="voice-trip-fact-value">{voiceContext.etaMins} mins</span>
                </div>
                <div className="voice-trip-fact">
                  <span className="voice-trip-fact-label">Toll</span>
                  <span className="voice-trip-fact-value">{voiceContext.tollSummary}</span>
                </div>
                <div className="voice-trip-fact">
                  <span className="voice-trip-fact-label">Leave at</span>
                  <span className="voice-trip-fact-value">{voiceContext.leaveAt}</span>
                </div>
                <div className="voice-trip-fact voice-trip-fact-bonus">
                  <span className="voice-trip-fact-label">Next action</span>
                  <span className="voice-trip-fact-value">{voiceContext.nextAction}</span>
                </div>
              </div>
              <p className="voice-trip-bonus">{voiceContext.bonusLine}</p>
            </section>

            <section className="surface-card assistant-quick-prompts">
              <div className="assistant-actions-head">
                <p className="section-label">Quick prompts</p>
                <button type="button" className="text-button" onClick={onReadAloud}>
                  Read summary
                </button>
              </div>
              <div className="assistant-action-grid">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="chip-button assistant-action-chip"
                    onClick={() => onAsk(prompt)}
                  >
                    <Icon name="sparkles" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </section>

            {voiceError ? <p className="voice-error assistant-voice-error">{voiceError}</p> : null}

            <section className="conversation-section voice-overlay-script">
              <div className="conversation-header assistant-demo-head">
                <div>
                  <span className="section-label">Assistant chat</span>
                </div>
              </div>

              <div ref={threadRef} className="conversation-thread assistant-demo-thread">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-row ${message.role === 'assistant' ? 'assistant' : 'driver'}`}
                  >
                    <div className="message-meta">
                      <span
                        className={`message-avatar ${message.role === 'assistant' ? 'assistant' : 'driver'}`}
                        aria-hidden="true"
                      >
                        {message.role === 'assistant' ? 'AI' : 'You'}
                      </span>
                      <span className="message-name">
                        {message.role === 'assistant' ? 'DriveMate' : 'You'}
                      </span>
                    </div>
                    <div className={`message-bubble ${message.role === 'assistant' ? 'assistant' : 'driver'}`}>
                      {message.title ? <strong>{message.title}. </strong> : null}
                      {message.content}
                    </div>
                  </div>
                ))}
                {(voiceState === 'listening' || voiceState === 'transcribing') && (
                  <div className="message-row driver">
                    <div className="message-meta">
                      <span className="message-avatar driver" aria-hidden="true">
                        You
                      </span>
                      <span className="message-name">You</span>
                    </div>
                    <div className="message-bubble driver voice-listening-bubble">
                      <span className="voice-pulse-dot" aria-hidden="true" />
                      {liveTranscript || (voiceState === 'listening' ? 'Listening...' : 'Transcribing...')}
                    </div>
                  </div>
                )}
                {qwenLoading && (
                  <div className="message-row assistant">
                    <div className="message-meta">
                      <span className="message-avatar assistant" aria-hidden="true">
                        AI
                      </span>
                      <span className="message-name">DriveMate</span>
                    </div>
                    <div className="message-bubble assistant">
                      <em className="typing-indicator">DriveMate is thinking...</em>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="voice-chat-composer-dock">
            <form className="chat-composer chat-composer-row" onSubmit={sendTypedMessage}>
              <input
                type="text"
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder="Ask about route, wallet, parking, charging, or car wash"
                aria-label="Message DriveMate AI"
              />
              <div className="composer-action-group">
                <button
                  type="button"
                  className="composer-icon-btn"
                  onClick={() =>
                    voiceState === 'listening' || voiceState === 'transcribing'
                      ? stopRecognition()
                      : startLiveRecognition()
                  }
                  aria-label="Start voice input"
                >
                  <Icon name="mic" />
                </button>
                <button type="submit" className="composer-icon-btn composer-send-btn" aria-label="Send message">
                  <Icon name="send" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
