import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import { voiceDemoTrip, commute, scriptedConversation, promptResponses } from '../data/mockData';

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
  const [draftMessage, setDraftMessage] = useState('');
  const [manualMessages, setManualMessages] = useState([]);
  const threadRef = useRef(null);

  const streamedMessages = useMemo(
    () => scriptedConversation.slice(0, streamProgress.mi + 1),
    [streamProgress.mi]
  );

  const allMessages = useMemo(
    () => [...streamedMessages, ...manualMessages],
    [streamedMessages, manualMessages]
  );

  useEffect(() => {
    if (!voiceChatOpen) return;
    setDraftMessage('');
    setManualMessages([]);
  }, [voiceChatOpen]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [streamProgress.mi, streamProgress.wc, manualMessages]);

  function sendTypedMessage(event) {
    event.preventDefault();
    const normalized = draftMessage.trim();
    if (!normalized) return;
    const response = promptResponses[normalized] ?? 'I can help with routing, wallet, and energy insights.';
    setManualMessages((curr) => [
      ...curr,
      { id: `m-u-${Date.now()}`, role: 'driver', content: normalized },
      { id: `m-a-${Date.now() + 1}`, role: 'assistant', content: response },
    ]);
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

              <div ref={threadRef} className="conversation-thread assistant-demo-thread">
                {allMessages.map((msg, idx) => {
                  const isStreamed = idx < streamedMessages.length;
                  const isLastStreamed = isStreamed && idx === streamProgress.mi;
                  const words = msg.content.trim().split(/\s+/).filter(Boolean);
                  const displayContent = isLastStreamed ? words.slice(0, streamProgress.wc).join(' ') : msg.content;

                  if (isLastStreamed && streamProgress.wc === 0) return null;

                  return (
                    <div
                      key={msg.id}
                      id={`conv-msg-${msg.id}`}
                      className={`message-row ${msg.role === 'assistant' ? 'assistant' : 'driver'}`}
                    >
                      <div className={`message-bubble ${msg.role === 'assistant' ? 'assistant' : 'driver'}`}>
                        {displayContent}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="voice-chat-composer-dock">
            <form className="chat-composer chat-composer-row" onSubmit={sendTypedMessage}>
              <input
                type="text"
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder="Type to ask DriveMate AI..."
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
