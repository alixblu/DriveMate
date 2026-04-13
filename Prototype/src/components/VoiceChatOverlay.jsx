import React from 'react';
import { Icon } from './Icon';
import { voiceDemoTrip, commute, scriptedConversation } from '../data/mockData';

export function VoiceChatOverlay({
  voiceChatOpen,
  closeVoiceChat,
  voiceState,
  voiceError,
  startLiveRecognition,
  stopRecognition,
  showVoiceTripContext,
  showVoiceDestination,
  showVoiceRouteBlock,
  showVoiceNextAction,
  showVoiceBonus,
  streamProgress,
}) {
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
              <h2 id="voice-chat-title">Voice chat</h2>
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
              <Icon name="sparkles" />
            </button>
            <button type="button" className="voice-chat-close" onClick={closeVoiceChat} aria-label="Close">
              <Icon name="close" />
            </button>
          </div>
        </header>

        <div className="voice-chat-body">
          <div className="voice-chat-scroll">
            {showVoiceTripContext ? (
              <section className="voice-trip-context surface-card" aria-label="Trip context">
                <h3 className="voice-trip-context-title">Trip context</h3>
                <div className="voice-trip-facts">
                  {showVoiceDestination ? (
                    <div className="voice-trip-fact">
                      <span className="voice-trip-fact-label">Destination</span>
                      <span className="voice-trip-fact-value">{voiceDemoTrip.destination}</span>
                    </div>
                  ) : null}
                  {showVoiceRouteBlock ? (
                    <>
                      <div className="voice-trip-fact">
                        <span className="voice-trip-fact-label">Route Selected</span>
                        <span className="voice-trip-fact-value">{voiceDemoTrip.routeLabel}</span>
                      </div>
                      <div className="voice-trip-fact">
                        <span className="voice-trip-fact-label">ETA</span>
                        <span className="voice-trip-fact-value">{voiceDemoTrip.etaMins} mins</span>
                      </div>
                      <div className="voice-trip-fact">
                        <span className="voice-trip-fact-label">Toll</span>
                        <span className="voice-trip-fact-value">{voiceDemoTrip.tollSummary}</span>
                      </div>
                    </>
                  ) : null}
                  {showVoiceNextAction ? (
                    <div className="voice-trip-fact">
                      <span className="voice-trip-fact-label">Next Action</span>
                      <span className="voice-trip-fact-value">
                        Leave before {commute.departureTime}
                      </span>
                    </div>
                  ) : null}
                  {showVoiceBonus ? (
                    <div className="voice-trip-fact voice-trip-fact-bonus">
                      <span className="voice-trip-fact-label">Bonus</span>
                      <span className="voice-trip-fact-value">{voiceDemoTrip.bonusLine}</span>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {voiceError ? <p className="voice-error assistant-voice-error">{voiceError}</p> : null}

            <section className="conversation-section voice-overlay-script">
              <div className="conversation-header assistant-demo-head">
                <div>
                  <span className="section-label">Assistant chat</span>
                </div>
              </div>

              <div className="message-list">
                {scriptedConversation.slice(0, streamProgress.mi + 1).map((msg, idx) => {
                  const isLast = idx === streamProgress.mi;
                  const words = msg.content.trim().split(/\s+/).filter(Boolean);
                  const displayContent = isLast ? words.slice(0, streamProgress.wc).join(' ') : msg.content;

                  if (isLast && streamProgress.wc === 0) return null;

                  return (
                    <div
                      key={msg.id}
                      id={`conv-msg-${msg.id}`}
                      className={`message-item ${msg.role === 'assistant' ? 'assistant-msg' : 'user-msg'}`}
                    >
                      <div className="message-bubble">{displayContent}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
