import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

// Components
import { Layout } from './components/Layout';
import { VoiceChatOverlay } from './components/VoiceChatOverlay';

// Pages
import { Dashboard } from './pages/Dashboard';
import { RoutesPage } from './pages/RoutesPage';
import { AssistantPage } from './pages/AssistantPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';

// Data
import { 
  vehicles, 
  routes, 
  promptResponses, 
  scriptedConversation 
} from './data/mockData';

/** Pace on-screen word reveals to roughly match Web Speech TTS length for the same line. */
function estimateScriptLineSpeechMs(text, preferredVoice) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const rate = preferredVoice === 'male' ? 0.98 : 1;
  const wpm = 140 * rate;
  const minutes = words.length / wpm;
  return Math.max(720, minutes * 60 * 1000);
}

function pickVoice(voices, gender) {
  const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('en'));
  const searchableVoices = englishVoices.length ? englishVoices : voices;
  const hints = gender === 'male'
    ? ['male', 'david', 'alex', 'daniel', 'fred', 'thomas', 'ryan', 'andrew', 'guy']
    : ['female', 'zira', 'samantha', 'victoria', 'karen', 'ava', 'emma', 'aria', 'jenny'];

  return searchableVoices.find((voice) =>
    hints.some((hint) => `${voice.name} ${voice.voiceURI}`.toLowerCase().includes(hint))
  ) ?? searchableVoices[0] ?? null;
}

function formatCurrency(value) {
  return `${value}k`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeVehicleId, setActiveVehicleId] = useState('vinfast-vf8');
  const [selectedRouteId, setSelectedRouteId] = useState('balance');
  const [walletBalance, setWalletBalance] = useState(120);
  const [rewardPoints, setRewardPoints] = useState(1250);
  const [tripCompleted, setTripCompleted] = useState(false);
  const [, setMessages] = useState([]);
  const [fullDemoActive, setFullDemoActive] = useState(false);
  const [, setDraftMessage] = useState('');
  const [voiceState, setVoiceState] = useState('idle');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceError, setVoiceError] = useState('');
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [streamProgress, setStreamProgress] = useState({ mi: 0, wc: 0 });

  const speechUtteranceRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const streamProgressRef = useRef(streamProgress);
  const scriptTimersRef = useRef([]);
  const scriptDemoCancelledRef = useRef(false);

  const VOICE_CTX_DEST_MI = 0;
  const VOICE_CTX_ROUTE_MI = 5;
  const VOICE_CTX_BONUS_MI = 10;
  const VOICE_CTX_NEXT_ACTION_MI = 15;

  function clearScriptTimers() {
    scriptTimersRef.current.forEach((id) => window.clearTimeout(id));
    scriptTimersRef.current = [];
  }

  const weeklySpend = 300;
  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[0],
    [selectedRouteId]
  );
  const activeVehicle = useMemo(
    () => vehicles.find((v) => v.id === activeVehicleId) ?? vehicles[0],
    [activeVehicleId]
  );
  const runningCostLabel = activeVehicle.powertrain === 'ev' ? 'Energy est.' : 'Fuel est.';
  const recommendedTopUp = Math.max(200, weeklySpend - walletBalance);

  const hasSpeechSupport = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasRecognitionSupport = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const maleVoice = useMemo(() => pickVoice(availableVoices, 'male'), [availableVoices]);
  const femaleVoice = useMemo(() => pickVoice(availableVoices, 'female'), [availableVoices]);

  function stopSpeechPlayback() {
    if (!hasSpeechSupport) return;
    window.speechSynthesis.cancel();
    speechUtteranceRef.current = null;
  }

  function stopRecognition() {
    if (recognitionRef.current) recognitionRef.current.stop();
  }

  function speakText(text, preferredVoice, onDone) {
    if (!hasSpeechSupport) { onDone?.(); return; }
    stopSpeechPlayback();
    const utterance = new window.SpeechSynthesisUtterance(text);
    const voice = preferredVoice === 'male' ? maleVoice : femaleVoice;
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang; } else { utterance.lang = 'en-US'; }
    utterance.rate = preferredVoice === 'male' ? 0.98 : 1;
    utterance.pitch = preferredVoice === 'male' ? 0.88 : 1.14;
    
    let finished = false;
    utterance.onend = () => { if (!finished) { finished = true; speechUtteranceRef.current = null; onDone?.(); } };
    utterance.onerror = () => { setVoiceState('paused'); if (!finished) { finished = true; speechUtteranceRef.current = null; onDone?.(); } };
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function deliverAiResponse(prompt) {
    const aiResponse = handleAsk(prompt);
    if (!aiResponse) { setVoiceState('idle'); return; }
    setVoiceState('playing');
    speakText(aiResponse, 'female', () => setVoiceState('idle'));
  }

  function startLiveRecognition() {
    if (!hasRecognitionSupport) {
      setVoiceError('Speech recognition is not available in this browser.');
      setVoiceState('idle');
      return;
    }
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setVoiceState('listening');
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
        setVoiceState('transcribing');
        finalTranscriptRef.current = transcript.trim();
      };
      recognition.onerror = () => { setVoiceError('Speech recognition error.'); setVoiceState('paused'); };
      recognition.onend = () => {
        const final = finalTranscriptRef.current.trim();
        if (final) { setVoiceState('answering'); deliverAiResponse(final); finalTranscriptRef.current = ''; return; }
        setVoiceState('idle');
      };
      recognitionRef.current = recognition;
    }
    stopSpeechPlayback();
    setVoiceError('');
    finalTranscriptRef.current = '';
    recognitionRef.current.start();
  }

  function handleAsk(prompt) {
    const normalized = prompt.trim();
    if (!normalized) return;
    const response = promptResponses[normalized] ?? 'I can help with routing, wallet, and energy insights.';
    setMessages((curr) => [...curr, { role: 'user', content: normalized }, { role: 'assistant', content: response }]);
    setDraftMessage('');
    return response;
  }

  function handleTopUp() { setWalletBalance((c) => c + recommendedTopUp); }
  function handleCompleteTrip() {
    if (tripCompleted) return;
    setTripCompleted(true);
    setWalletBalance((c) => Math.max(0, c - selectedRoute.toll));
    setRewardPoints((c) => c + 25);
    setActiveTab('profile');
  }

  useEffect(() => {
    if (!hasSpeechSupport) return;
    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [hasSpeechSupport]);

  useEffect(() => {
    streamProgressRef.current = streamProgress;
  }, [streamProgress]);

  function playScriptMessageAtIndex(mi, onComplete) {
    const entry = scriptedConversation[mi];
    if (!entry) { onComplete?.(); return; }
    const words = entry.content.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) { setStreamProgress({ mi: mi + 1, wc: 0 }); onComplete?.(); return; }
    const voice = entry.role === 'driver' ? 'male' : 'female';
    const speechMs = estimateScriptLineSpeechMs(entry.content, voice);
    const gapMs = words.length <= 1 ? 0 : Math.round(speechMs / (words.length - 1));
    let wi = 0; let streamDone = false; let speechDone = !hasSpeechSupport; let speechStarted = false;
    function tryFinish() { if (streamDone && speechDone) { if (!scriptDemoCancelledRef.current) { setStreamProgress({ mi: mi + 1, wc: 0 }); onComplete?.(); } } }
    function wordTick() {
      if (scriptDemoCancelledRef.current) return;
      wi += 1; setStreamProgress({ mi, wc: wi });
      if (hasSpeechSupport && wi === 1 && !speechStarted) {
        speechStarted = true;
        speakText(entry.content, voice, () => {
          if (scriptDemoCancelledRef.current) return;
          if (wi < words.length) { clearScriptTimers(); wi = words.length; setStreamProgress({ mi, wc: words.length }); streamDone = true; }
          speechDone = true; tryFinish();
        });
      }
      if (wi < words.length) {
        const tid = window.setTimeout(wordTick, gapMs);
        scriptTimersRef.current.push(tid);
        return;
      }
      streamDone = true;
      if (!hasSpeechSupport) speechDone = true;
      tryFinish();
    }
    wordTick();
  }

  function startFullScriptDemo() {
    const { mi } = streamProgressRef.current;
    if (mi >= scriptedConversation.length) return;
    scriptDemoCancelledRef.current = false;
    setFullDemoActive(true);
    const run = (idx) => {
      if (scriptDemoCancelledRef.current || idx >= scriptedConversation.length) { setFullDemoActive(false); return; }
      playScriptMessageAtIndex(idx, () => run(idx + 1));
    };
    run(mi);
  }

  useEffect(() => {
    if (!voiceChatOpen) return;
    scriptDemoCancelledRef.current = false;
    clearScriptTimers();
    setStreamProgress({ mi: 0, wc: 0 });
    streamProgressRef.current = { mi: 0, wc: 0 };
    const tid = setTimeout(() => startFullScriptDemo(), 100);
    return () => {
      scriptDemoCancelledRef.current = true;
      clearTimeout(tid);
      clearScriptTimers();
      stopSpeechPlayback();
    };
  }, [voiceChatOpen]);

  function closeVoiceChat() {
    scriptDemoCancelledRef.current = true;
    clearScriptTimers();
    setFullDemoActive(false);
    setVoiceChatOpen(false);
    stopRecognition();
    stopSpeechPlayback();
    setVoiceError('');
  }

  const voiceScriptStarted = fullDemoActive || streamProgress.mi > 0 || streamProgress.wc > 0;
  const showVoiceDestination = voiceScriptStarted && streamProgress.mi >= VOICE_CTX_DEST_MI;
  const showVoiceRouteBlock = voiceScriptStarted && streamProgress.mi >= VOICE_CTX_ROUTE_MI;
  const showVoiceBonus = voiceScriptStarted && streamProgress.mi >= VOICE_CTX_BONUS_MI;
  const showVoiceNextAction = voiceScriptStarted && streamProgress.mi >= VOICE_CTX_NEXT_ACTION_MI;
  const showVoiceTripContext = showVoiceDestination || showVoiceRouteBlock || showVoiceBonus || showVoiceNextAction;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} openVoiceChat={() => setVoiceChatOpen(true)}>
      {activeTab === 'home' && (
        <Dashboard
          activeVehicle={activeVehicle}
          walletBalance={walletBalance}
          selectedRoute={selectedRoute}
          setActiveTab={setActiveTab}
          runningCostLabel={runningCostLabel}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'routes' && (
        <RoutesPage
          selectedRoute={selectedRoute}
          setSelectedRouteId={setSelectedRouteId}
          activeVehicle={activeVehicle}
          walletBalance={walletBalance}
          tripCompleted={tripCompleted}
          handleCompleteTrip={handleCompleteTrip}
          setActiveTab={setActiveTab}
          runningCostLabel={runningCostLabel}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'assistant' && (
        <AssistantPage
          setActiveTab={setActiveTab}
          setSelectedRouteId={setSelectedRouteId}
          selectedRoute={selectedRoute}
          activeVehicle={activeVehicle}
          walletBalance={walletBalance}
          recommendedTopUp={recommendedTopUp}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'wallet' && (
        <WalletPage
          walletBalance={walletBalance}
          weeklySpend={weeklySpend}
          recommendedTopUp={recommendedTopUp}
          rewardPoints={rewardPoints}
          handleTopUp={handleTopUp}
          setActiveTab={setActiveTab}
          formatCurrency={formatCurrency}
        />
      )}
      {activeTab === 'profile' && (
        <ProfilePage
          activeVehicle={activeVehicle}
          activeVehicleId={activeVehicleId}
          setActiveVehicleId={setActiveVehicleId}
          runningCostLabel={runningCostLabel}
          setActiveTab={setActiveTab}
        />
      )}

      <VoiceChatOverlay
        voiceChatOpen={voiceChatOpen}
        closeVoiceChat={closeVoiceChat}
        voiceState={voiceState}
        voiceError={voiceError}
        startLiveRecognition={startLiveRecognition}
        stopRecognition={stopRecognition}
        showVoiceTripContext={showVoiceTripContext}
        showVoiceDestination={showVoiceDestination}
        showVoiceRouteBlock={showVoiceRouteBlock}
        showVoiceNextAction={showVoiceNextAction}
        showVoiceBonus={showVoiceBonus}
        streamProgress={streamProgress}
      />
    </Layout>
  );
}
