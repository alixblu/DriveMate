import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

import { Layout } from './components/Layout';
import { VoiceChatOverlay } from './components/VoiceChatOverlay';

import { Dashboard } from './pages/Dashboard';
import { RoutesPage } from './pages/RoutesPage';
import { AssistantPage } from './pages/AssistantPage';
import { WalletPage } from './pages/WalletPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';

import { vehicles } from './data/mockData';
import {
  DEFAULT_SCENARIO_ID,
  buildAssistantReply,
  createDriveMateSnapshot,
  scenarioCatalog,
} from './lib/predictionEngine';
import { loadLiveForecast, pollTimesFMHealth } from './lib/forecastAdapter';

function pickInitialTab() {
  if (typeof window === 'undefined') {
    return 'home';
  }

  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const allowedTabs = new Set(['home', 'routes', 'assistant', 'wallet', 'profile', 'notifications']);

  return allowedTabs.has(tab) ? tab : 'home';
}

function pickInitialScenario() {
  if (typeof window === 'undefined') {
    return DEFAULT_SCENARIO_ID;
  }

  const params = new URLSearchParams(window.location.search);
  const scenarioId = params.get('scenario');

  return scenarioCatalog.some((scenario) => scenario.id === scenarioId)
    ? scenarioId
    : DEFAULT_SCENARIO_ID;
}

function pickVoice(voices) {
  const preferredVoices = voices.filter((voice) =>
    voice.lang?.toLowerCase().startsWith('en'),
  );
  const searchable = preferredVoices.length ? preferredVoices : voices;

  return (
    searchable.find((voice) =>
      ['jenny', 'samantha', 'aria', 'zira', 'emma', 'davis', 'guy'].some((hint) =>
        `${voice.name} ${voice.voiceURI}`.toLowerCase().includes(hint),
      ),
    ) ?? searchable[0] ?? null
  );
}

function createDecisionMessages(snapshot) {
  return [
    {
      id: `assistant-seed-${snapshot.scenario.id}-${snapshot.vehicle.id}`,
      role: 'assistant',
      title: 'Daily decision',
      content: snapshot.assistantBrief.explanation,
    },
  ];
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} VND`;
}

export default function App() {
  const initialScenarioId = pickInitialScenario();
  const initialVehicleId = 'toyota-vios';
  const initialSnapshot = createDriveMateSnapshot({
    scenarioId: initialScenarioId,
    vehicleId: initialVehicleId,
  });

  const [activeTab, setActiveTab] = useState(pickInitialTab);
  const [scenarioId, setScenarioId] = useState(initialScenarioId);
  const [activeVehicleId, setActiveVehicleId] = useState(initialVehicleId);
  const [selectedRouteId, setSelectedRouteId] = useState(initialSnapshot.recommendedRouteId);
  const [walletBalance, setWalletBalance] = useState(initialSnapshot.walletForecast.balanceVnd);
  const [rewardPoints, setRewardPoints] = useState(initialSnapshot.rewards.points);
  const [tripCompleted, setTripCompleted] = useState(false);
  const [messages, setMessages] = useState(() => createDecisionMessages(initialSnapshot));
  const [voiceState, setVoiceState] = useState('idle');
  const [voiceError, setVoiceError] = useState('');
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [forecastData, setForecastData] = useState({ fuelTrend: null, commuteWindow: null });
  const [forecastLoading, setForecastLoading] = useState(true);
  const [timesfmReady, setTimesfmReady] = useState(false);
  const [qwenLoading, setQwenLoading] = useState(false);

  const recognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const snapshot = useMemo(
    () =>
      createDriveMateSnapshot({
        scenarioId,
        vehicleId: activeVehicleId,
        selectedRouteId,
        walletBalance,
        rewardPoints,
        tripCompleted,
        fuelTrend: forecastData.fuelTrend,
        commuteWindow: forecastData.commuteWindow,
      }),
    [activeVehicleId, rewardPoints, scenarioId, selectedRouteId, tripCompleted, walletBalance,
     forecastData.fuelTrend, forecastData.commuteWindow],
  );

  const activeVehicle =
    vehicles.find((vehicle) => vehicle.id === activeVehicleId) ?? vehicles[0];

  function resetDemoState(nextScenarioId, nextVehicleId) {
    const seededSnapshot = createDriveMateSnapshot({
      scenarioId: nextScenarioId,
      vehicleId: nextVehicleId,
    });

    setSelectedRouteId(seededSnapshot.recommendedRouteId);
    setWalletBalance(seededSnapshot.walletForecast.balanceVnd);
    setRewardPoints(seededSnapshot.rewards.points);
    setTripCompleted(false);
    setMessages(createDecisionMessages(seededSnapshot));
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    params.set('scenario', scenarioId);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [activeTab, scenarioId]);

  const hasSpeechSupport =
    typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasRecognitionSupport =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const preferredVoice = useMemo(() => pickVoice(availableVoices), [availableVoices]);

  useEffect(() => {
    if (!hasSpeechSupport) return;
    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [hasSpeechSupport]);

  // Poll TimesFM /health every 30s; promote to live forecasts once model is ready
  useEffect(() => {
    let cancelled = false;
    async function check() {
      const health = await pollTimesFMHealth();
      if (!cancelled && health.modelLoaded) setTimesfmReady(true);
    }
    check();
    const id = window.setInterval(check, 30_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, []);

  // Load live forecasts when scenario changes or TimesFM becomes ready
  useEffect(() => {
    let cancelled = false;
    setForecastLoading(true);
    loadLiveForecast(scenarioId).then(({ fuelTrend, commuteWindow }) => {
      if (!cancelled) {
        setForecastData({ fuelTrend, commuteWindow });
        setForecastLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [scenarioId, timesfmReady]);

  function stopSpeechPlayback() {
    if (!hasSpeechSupport) return;
    window.speechSynthesis.cancel();
    speechUtteranceRef.current = null;
  }

  function stopRecognition() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

  function speakText(text, onDone) {
    if (!hasSpeechSupport) {
      onDone?.();
      return;
    }

    stopSpeechPlayback();
    const utterance = new window.SpeechSynthesisUtterance(text);

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.98;
    utterance.pitch = 1;

    let finished = false;
    utterance.onend = () => {
      if (finished) return;
      finished = true;
      speechUtteranceRef.current = null;
      onDone?.();
    };
    utterance.onerror = () => {
      if (finished) return;
      finished = true;
      speechUtteranceRef.current = null;
      setVoiceState('paused');
      onDone?.();
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function handleAsk(prompt) {
    const normalized = prompt.trim();
    if (!normalized) return '';

    const response = buildAssistantReply(normalized, snapshot);
    const timestamp = Date.now();
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: `user-${timestamp}`, role: 'driver', content: normalized },
      {
        id: `assistant-${timestamp + 1}`,
        role: 'assistant',
        title: response.title,
        content: response.answer,
      },
    ]);
    setActiveTab('assistant');

    return response.answer;
  }

  const ASSISTANT_URL = (
    import.meta.env.VITE_ASSISTANT_SERVICE_URL?.trim() || 'http://127.0.0.1:8009'
  ).replace(/\/$/, '');

  async function handleQwenAsk(prompt) {
    const text = prompt.trim();
    if (!text) return;
    const ts = Date.now();
    setMessages((prev) => [...prev, { id: `user-${ts}`, role: 'driver', content: text }]);
    setQwenLoading(true);
    setActiveTab('assistant');

    const context = {
      vehicleType: activeVehicle.powertrain,
      walletBalance,
      selectedRoute: {
        name: snapshot.selectedRoute.badge,
        eta: snapshot.selectedRoute.etaMin,
        toll: snapshot.selectedRoute.tollVnd,
      },
      fuelTrend: forecastData.fuelTrend
        ? {
            direction: forecastData.fuelTrend.trendDirection,
            delta: forecastData.fuelTrend.deltaVnd,
            confidence: forecastData.fuelTrend.confidence,
          }
        : null,
      commuteWindow: forecastData.commuteWindow
        ? {
            bestDepartureTime: forecastData.commuteWindow.bestDepartureTime,
            confidencePct: forecastData.commuteWindow.confidencePct,
          }
        : null,
    };

    try {
      const res = await fetch(`${ASSISTANT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context }),
        signal: AbortSignal.timeout(35_000),
      });
      const data = res.ok ? await res.json() : null;
      const reply = data?.reply ?? buildAssistantReply(text, snapshot).answer;
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${ts + 1}`, role: 'assistant', title: 'DriveMate AI', content: reply },
      ]);
    } catch {
      const fallback = buildAssistantReply(text, snapshot);
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${ts + 1}`, role: 'assistant', title: fallback.title, content: fallback.answer },
      ]);
    } finally {
      setQwenLoading(false);
    }
  }

  function deliverAiResponse(prompt) {
    const aiResponse = handleAsk(prompt);
    if (!aiResponse) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('speaking');
    speakText(aiResponse, () => setVoiceState('idle'));
  }

  function startLiveRecognition() {
    if (!hasRecognitionSupport) {
      setVoiceError('Speech recognition is not available in this browser.');
      setVoiceState('idle');
      return;
    }

    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setVoiceState('listening');
      recognition.onresult = (event) => {
        let transcript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript;
        }
        finalTranscriptRef.current = transcript.trim();
        setVoiceState('transcribing');
      };
      recognition.onerror = () => {
        setVoiceError('Speech recognition error.');
        setVoiceState('paused');
      };
      recognition.onend = () => {
        const finalPrompt = finalTranscriptRef.current.trim();
        if (finalPrompt) {
          setVoiceState('answering');
          deliverAiResponse(finalPrompt);
          finalTranscriptRef.current = '';
          return;
        }
        setVoiceState('idle');
      };

      recognitionRef.current = recognition;
    }

    stopSpeechPlayback();
    setVoiceError('');
    finalTranscriptRef.current = '';
    recognitionRef.current.start();
  }

  function handleReadAloud() {
    const latestAssistantMessage = [...messages]
      .reverse()
      .find((message) => message.role === 'assistant');

    if (!latestAssistantMessage) {
      return;
    }

    setVoiceState('speaking');
    speakText(
      `${latestAssistantMessage.title ? `${latestAssistantMessage.title}. ` : ''}${latestAssistantMessage.content}`,
      () => setVoiceState('idle'),
    );
  }

  function handleTopUp() {
    setWalletBalance(
      (currentBalance) => currentBalance + snapshot.walletForecast.suggestedTopUpVnd,
    );
    setRewardPoints((currentPoints) => currentPoints + 20);
  }

  function handleCompleteTrip() {
    if (tripCompleted) return;

    setTripCompleted(true);
    setWalletBalance((currentBalance) =>
      Math.max(0, currentBalance - snapshot.selectedRoute.tollVnd),
    );
    setRewardPoints(
      (currentPoints) => currentPoints + snapshot.rewards.recommendedRouteBonus,
    );
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `assistant-trip-${Date.now()}`,
        role: 'assistant',
        title: 'Trip logged',
        content:
          snapshot.scenario.carWashPrompt && snapshot.vehicle.powertrain === 'ice'
            ? 'Trip saved. Rainy traffic is why DriveMate now suggests a car wash after work.'
            : 'Trip saved. DriveMate will keep using this corridor pattern to time wallet, toll, and destination support.',
      },
    ]);
    setActiveTab('notifications');
  }

  function closeVoiceChat() {
    stopRecognition();
    stopSpeechPlayback();
    setVoiceError('');
    setVoiceState('idle');
    setVoiceChatOpen(false);
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      openVoiceChat={() => setVoiceChatOpen(true)}
    >
      {activeTab === 'home' && (
        <Dashboard
          snapshot={snapshot}
          scenarioCatalog={scenarioCatalog}
          scenarioId={scenarioId}
          setScenarioId={(nextScenarioId) => {
            setScenarioId(nextScenarioId);
            resetDemoState(nextScenarioId, activeVehicleId);
            setActiveTab('home');
          }}
          activeVehicle={activeVehicle}
          walletBalance={walletBalance}
          selectedRoute={snapshot.selectedRoute}
          setActiveTab={setActiveTab}
          formatCurrency={formatCurrency}
          onOpenNotifications={() => setActiveTab('notifications')}
          forecastLoading={forecastLoading}
        />
      )}

      {activeTab === 'notifications' && (
        <NotificationsPage
          snapshot={snapshot}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'routes' && (
        <RoutesPage
          snapshot={snapshot}
          selectedRoute={snapshot.selectedRoute}
          setSelectedRouteId={setSelectedRouteId}
          activeVehicle={activeVehicle}
          walletBalance={walletBalance}
          tripCompleted={tripCompleted}
          handleCompleteTrip={handleCompleteTrip}
          setActiveTab={setActiveTab}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 'assistant' && (
        <AssistantPage
          snapshot={snapshot}
          setActiveTab={setActiveTab}
          setSelectedRouteId={setSelectedRouteId}
          formatCurrency={formatCurrency}
          messages={messages}
          onAsk={handleQwenAsk}
          qwenLoading={qwenLoading}
        />
      )}

      {activeTab === 'wallet' && (
        <WalletPage
          snapshot={snapshot}
          walletBalance={walletBalance}
          rewardPoints={rewardPoints}
          handleTopUp={handleTopUp}
          setActiveTab={setActiveTab}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === 'profile' && (
        <ProfilePage
          snapshot={snapshot}
          activeVehicleId={activeVehicleId}
          setActiveVehicleId={(nextVehicleId) => {
            setActiveVehicleId(nextVehicleId);
            resetDemoState(scenarioId, nextVehicleId);
          }}
        />
      )}

      <VoiceChatOverlay
        voiceChatOpen={voiceChatOpen}
        closeVoiceChat={closeVoiceChat}
        voiceState={voiceState}
        voiceError={voiceError}
        startLiveRecognition={startLiveRecognition}
        stopRecognition={stopRecognition}
        voiceContext={snapshot.voiceContext}
        quickPrompts={snapshot.quickPrompts}
        messages={messages}
        onAsk={handleAsk}
        onReadAloud={handleReadAloud}
      />
    </Layout>
  );
}
