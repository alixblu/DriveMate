import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const user = {
  name: 'Alex Nguyen',
  carType: 'VinFast VF 8',
  homeLocation: 'Thu Duc City',
  workLocation: 'District 1',
}

const commute = {
  destination: 'Office',
  confidence: 82,
  eta: 24,
  departureTime: '08:10',
  toll: 35,
  fuel: 40,
  traffic: 'Moderate',
}

const routes = [
  {
    id: 'fast',
    label: 'Fast lane',
    tag: 'Fastest',
    eta: 20,
    toll: 50,
    fuel: 45,
    score: 76,
    color: '#1f2937',
    path: 'M36 176 C80 160 112 132 142 118 C174 103 218 98 280 50',
    summary: 'Best when arrival time matters most.',
  },
  {
    id: 'cheap',
    label: 'Saver lane',
    tag: 'Cheapest',
    eta: 28,
    toll: 20,
    fuel: 35,
    score: 72,
    color: '#f59e0b',
    path: 'M38 178 C86 182 108 154 138 150 C170 146 226 126 276 58',
    summary: 'Lower toll and fuel, slightly longer city route.',
  },
  {
    id: 'balance',
    label: 'AI suggested',
    tag: 'Best Value',
    eta: 24,
    toll: 35,
    fuel: 40,
    score: 88,
    color: '#18b46b',
    path: 'M40 178 C84 166 124 138 150 128 C176 116 218 102 278 54',
    summary: 'Best trade-off between time, toll, and fuel today.',
  },
]

const services = [
  { id: 'wallet', label: 'Top up', icon: 'wallet', tab: 'wallet' },
  { id: 'reward', label: 'My Loyalty', icon: 'gift', tab: 'wallet' },
  { id: 'bank', label: 'Bank link', icon: 'link', tab: 'wallet' },
  { id: 'docs', label: 'Docs wallet', icon: 'document', tab: 'profile', badge: 'New' },
  { id: 'route', label: 'AI routes', icon: 'route', tab: 'routes', badge: 'AI' },
  { id: 'rescue', label: 'AI rescue', icon: 'rescue', tab: 'assistant', badge: 'New' },
  { id: 'fuel', label: 'Fuel coach', icon: 'fuel', tab: 'assistant' },
  { id: 'more', label: 'More', icon: 'grid', tab: 'profile' },
]

const quickPrompts = [
  'Cheapest route today?',
  'How long to office?',
  'Need top-up for this week?',
  'Any traffic ahead?',
]

const promptResponses = {
  'Cheapest route today?':
    'The cheapest route is the city bypass: 20k toll, 35k fuel, about 28 minutes. If you still want good balance, I recommend the AI route instead.',
  'How long to office?':
    'Office is 24 minutes away via the AI route right now. If you leave after 8:20, ETA increases by around 9 minutes.',
  'Need top-up for this week?':
    'Yes. Your expected toll spend is 300k and your wallet is only 120k. I suggest a 200k top-up to stay safe.',
  'Any traffic ahead?':
    'Traffic is building near Cat Lai and the expressway merge. The AI route avoids the worst slowdown and keeps toll spend moderate.',
  'Show my rewards':
    'You currently have 1,250 reward points. One more recommended commute unlocks the next toll discount reward.',
}

const articleCards = [
  {
    id: 1,
    theme: 'blue',
    title: 'AI predicts office commute in 24 minutes this morning',
    kicker: 'DriveMate AI',
  },
  {
    id: 2,
    theme: 'green',
    title: 'Top up early to avoid low-balance toll interruption this week',
    kicker: 'VETC Wallet',
  },
  {
    id: 3,
    theme: 'teal',
    title: 'Fuel price is up 500 VND. Choose the balanced route today',
    kicker: 'Fuel Insight',
  },
  {
    id: 4,
    theme: 'dark',
    title: 'Route AI can save 45 minutes weekly with better departure timing',
    kicker: 'Weekly Report',
  },
]

const weeklyMetrics = [
  { label: 'Trips', value: '14' },
  { label: 'Saved', value: '185k' },
  { label: 'Traffic cut', value: '45m' },
  { label: 'Preferred route', value: 'Fast 70%' },
]

const bottomTabs = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'routes', label: 'Routes', icon: 'route' },
  { id: 'assistant', label: 'DriveMate AI', icon: 'sparkles' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'profile', label: 'Me', icon: 'profile' },
]

const initialMessages = [
  {
    role: 'assistant',
    content:
      'Hi Alex, I already predicted your office commute. The AI route gets you there in 24 minutes with balanced toll and fuel cost.',
  },
]

const scriptedConversation = [
  {
    id: 'c1',
    role: 'driver',
    content:
      "Hi, I'm about to head to the People's Committee office. What's the best route today?",
  },
  { id: 'c2', role: 'assistant', content: 'I found 3 options:' },
  {
    id: 'c3',
    role: 'assistant',
    content: 'Best Value Route — 35 mins, 2 toll stations, Toll 30k each.',
  },
  {
    id: 'c4',
    role: 'assistant',
    content: 'I recommend Best Value because it saves 20k with only 4 extra minutes.',
  },
  {
    id: 'c5',
    role: 'assistant',
    content:
      "There are also 2 other options: Fastest Route and Cheapest Route, if you'd like to hear them.",
  },
  { id: 'c6', role: 'driver', content: 'Just start the best route.' },
  { id: 'c7', role: 'assistant', content: 'Starting Best Value Route now.' },
  {
    id: 'c8',
    role: 'assistant',
    content:
      "There is a Highlands Coffee on the way. Would you like to grab one as usual? I can remind you when you're nearby.",
  },
  { id: 'c9', role: 'driver', content: "Yes, remind me when I'm close." },
  {
    id: 'c10',
    role: 'assistant',
    content: "Sure. I'll remind you when you're near the coffee shop.",
  },
  { id: 'c11', role: 'driver', content: 'Any traffic I should know about?' },
  {
    id: 'c12',
    role: 'assistant',
    content: 'Yes. Heavy congestion is building on your usual highway route.',
  },
  {
    id: 'c13',
    role: 'assistant',
    content: 'Leaving before 8:10 AM can save around 12 minutes.',
  },
  { id: 'c14', role: 'driver', content: 'How about fuel prices today?' },
  { id: 'c15', role: 'assistant', content: 'Fuel increased by 500 VND/L today.' },
  {
    id: 'c16',
    role: 'assistant',
    content: 'Based on your weekly driving pattern, your cost may rise by about 80k this week.',
  },
  {
    id: 'c17',
    role: 'assistant',
    content: 'Choosing the fuel-efficient route can reduce that impact.',
  },
  { id: 'c18', role: 'driver', content: 'Do I need to top up my wallet?' },
  { id: 'c19', role: 'assistant', content: 'Your wallet balance is 120k.' },
  {
    id: 'c20',
    role: 'assistant',
    content: 'Estimated toll spending for the next few trips is 300k.',
  },
  { id: 'c21', role: 'assistant', content: 'I recommend topping up 200k.' },
  { id: 'c22', role: 'driver', content: 'How many reward points do I have?' },
  { id: 'c23', role: 'assistant', content: 'You currently have 1,250 points.' },
  {
    id: 'c24',
    role: 'assistant',
    content: 'You can redeem a coffee voucher or parking discount today.',
  },
  { id: 'c25', role: 'driver', content: 'How did I do this week?' },
  { id: 'c26', role: 'assistant', content: 'This week you completed 12 trips.' },
  { id: 'c27', role: 'assistant', content: 'You saved 120k using smart routes.' },
  {
    id: 'c28',
    role: 'assistant',
    content: 'You also reduced travel time by 45 minutes.',
  },
  { id: 'c29', role: 'assistant', content: 'Great job!' },
  { id: 'c30', role: 'driver', content: 'Nice.' },
  { id: 'c31', role: 'assistant', content: 'Navigation is active. Have a safe trip!' },
]

function formatCurrency(value) {
  return `${value}k`
}

function pickVoice(voices, gender) {
  const englishVoices = voices.filter((voice) => voice.lang?.toLowerCase().startsWith('en'))
  const searchableVoices = englishVoices.length ? englishVoices : voices
  const hints =
    gender === 'male'
      ? ['male', 'david', 'alex', 'daniel', 'fred', 'thomas', 'ryan', 'andrew', 'guy']
      : ['female', 'zira', 'samantha', 'victoria', 'karen', 'ava', 'emma', 'aria', 'jenny']

  return (
    searchableVoices.find((voice) =>
      hints.some((hint) => `${voice.name} ${voice.voiceURI}`.toLowerCase().includes(hint)),
    ) ??
    searchableVoices[0] ??
    null
  )
}

function Icon({ name }) {
  const commonProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '2',
  }

  switch (name) {
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      )
    case 'bell':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
          <path {...commonProps} d="M10 20a2 2 0 0 0 4 0" />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
          <path {...commonProps} d="M4 9V6a2 2 0 0 1 2-2h10" />
          <path {...commonProps} d="M15 13h5" />
        </svg>
      )
    case 'gift':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M20 12v8H4v-8" />
          <path {...commonProps} d="M2 8h20v4H2zM12 8v12" />
          <path {...commonProps} d="M12 8H8.5a2.5 2.5 0 1 1 0-5c2 0 3.5 2 3.5 5ZM12 8h3.5a2.5 2.5 0 1 0 0-5c-2 0-3.5 2-3.5 5Z" />
        </svg>
      )
    case 'link':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10 6" />
          <path {...commonProps} d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 1 0 7.07 7.07L14 18" />
        </svg>
      )
    case 'document':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path {...commonProps} d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      )
    case 'route':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path {...commonProps} d="M7 14V6a3 3 0 0 1 3-3h4M17 10v8a3 3 0 0 1-3 3h-4" />
        </svg>
      )
    case 'rescue':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M12 3v18M3 12h18" />
          <circle {...commonProps} cx="12" cy="12" r="8" />
        </svg>
      )
    case 'fuel':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M7 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
          <path {...commonProps} d="M7 11h8M17 7h2l2 2v8a2 2 0 0 1-4 0v-4" />
        </svg>
      )
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
        </svg>
      )
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M3 10.5 12 3l9 7.5" />
          <path {...commonProps} d="M5 9.5V21h14V9.5" />
        </svg>
      )
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="m12 3 1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />
          <path {...commonProps} d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
        </svg>
      )
    case 'profile':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="8" r="4" />
          <path {...commonProps} d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="12" r="9" />
          <path {...commonProps} d="M12 7v5l3 2" />
        </svg>
      )
    case 'volume':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path {...commonProps} d="M5 14h3l4 4V6L8 10H5z" />
          <path {...commonProps} d="M16 9a5 5 0 0 1 0 6M18.5 6.5a8.5 8.5 0 0 1 0 11" />
        </svg>
      )
    case 'record':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'stop':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle {...commonProps} cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

function RouteMap({ selectedRoute }) {
  return (
    <div className="map-vision">
      <div className="map-vision-top">
        <span className="map-live">Live map vision</span>
        <span className="map-area">Thu Duc to District 1</span>
      </div>
      <svg className="map-canvas" viewBox="0 0 320 220" aria-hidden="true">
        <rect x="0" y="0" width="320" height="220" rx="28" fill="#eef4ef" />
        <path d="M28 32C82 52 112 58 170 52C216 48 262 56 298 36" stroke="#dbe8dc" strokeWidth="18" fill="none" />
        <path d="M24 110C70 118 108 102 150 94C198 84 236 96 294 80" stroke="#dce6ef" strokeWidth="16" fill="none" />
        <path d="M46 186C84 150 120 140 150 128C198 108 246 90 278 54" stroke="#cfdad2" strokeWidth="22" fill="none" />
        <path d="M72 40C98 84 108 124 96 192" stroke="#dce8dd" strokeWidth="14" fill="none" />
        <path d="M214 20C208 68 222 126 258 198" stroke="#dfe7f0" strokeWidth="12" fill="none" />

        {routes.map((route) => (
          <path
            key={route.id}
            d={route.path}
            stroke={route.color}
            strokeWidth={route.id === selectedRoute.id ? '10' : '6'}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={route.id === selectedRoute.id ? '1' : '0.35'}
          />
        ))}

        <circle cx="38" cy="178" r="10" fill="#18b46b" />
        <circle cx="278" cy="54" r="10" fill="#111827" />
        <circle cx="38" cy="178" r="18" fill="rgba(24,180,107,0.18)" />
        <circle cx="278" cy="54" r="18" fill="rgba(17,24,39,0.12)" />
        <text x="26" y="205" fill="#4b5563" fontSize="12" fontWeight="700">
          Home
        </text>
        <text x="248" y="34" fill="#111827" fontSize="12" fontWeight="700">
          Office
        </text>
      </svg>
      <div className="map-insights">
        <div>
          <span>Current pick</span>
          <strong>{selectedRoute.tag}</strong>
        </div>
        <div>
          <span>Traffic</span>
          <strong>{commute.traffic}</strong>
        </div>
        <div>
          <span>Depart by</span>
          <strong>{commute.departureTime}</strong>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedRouteId, setSelectedRouteId] = useState('balance')
  const [walletBalance, setWalletBalance] = useState(120)
  const [rewardPoints, setRewardPoints] = useState(1250)
  const [tripCompleted, setTripCompleted] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [draftMessage, setDraftMessage] = useState('')
  const [voiceState, setVoiceState] = useState('idle')
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [isFullConversationPlaying, setIsFullConversationPlaying] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])
  const [voiceError, setVoiceError] = useState('')
  const speechUtteranceRef = useRef(null)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const fullPlaybackSeqRef = useRef(0)
  const fullPlaybackActiveRef = useRef(false)

  const weeklySpend = 300
  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === selectedRouteId) ?? routes[2],
    [selectedRouteId],
  )
  const recommendedTopUp = Math.max(200, weeklySpend - walletBalance)
  const hasSpeechSupport =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window
  const hasRecognitionSupport =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  const maleVoice = useMemo(() => pickVoice(availableVoices, 'male'), [availableVoices])
  const femaleVoice = useMemo(() => pickVoice(availableVoices, 'female'), [availableVoices])

  function cancelQueuedConversationPlayback() {
    fullPlaybackSeqRef.current += 1
    fullPlaybackActiveRef.current = false
    setIsFullConversationPlaying(false)
  }

  function stopFullConversationPlayback() {
    cancelQueuedConversationPlayback()
    stopSpeechPlayback()
  }

  function playFullConversationThread() {
    if (!hasSpeechSupport) {
      setVoiceError('This browser does not support spoken playback.')
      return
    }

    if (fullPlaybackActiveRef.current) {
      stopFullConversationPlayback()
      return
    }

    stopRecognition()
    stopSpeechPlayback()
    setVoiceError('')

    const seq = ++fullPlaybackSeqRef.current
    fullPlaybackActiveRef.current = true
    setIsFullConversationPlaying(true)

    function playAt(index) {
      if (seq !== fullPlaybackSeqRef.current) {
        return
      }

      if (index >= scriptedConversation.length) {
        fullPlaybackActiveRef.current = false
        setIsFullConversationPlaying(false)
        setSpeakingMessageId(null)
        return
      }

      const entry = scriptedConversation[index]
      speakText(
        entry.content,
        entry.role === 'driver' ? 'male' : 'female',
        () => {
          if (seq !== fullPlaybackSeqRef.current) {
            return
          }
          window.setTimeout(() => playAt(index + 1), 80)
        },
        { messageId: entry.id },
      )
    }

    playAt(0)
  }

  function stopSpeechPlayback() {
    if (!hasSpeechSupport) {
      return
    }

    window.speechSynthesis.cancel()
    speechUtteranceRef.current = null
    setSpeakingMessageId(null)
  }

  function stopRecognition() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  function speakText(text, preferredVoice, onDone, options = {}) {
    if (!hasSpeechSupport) {
      onDone?.()
      return
    }

    stopSpeechPlayback()
    setSpeakingMessageId(options.messageId ?? null)

    const utterance = new window.SpeechSynthesisUtterance(text)
    const voice = preferredVoice === 'male' ? maleVoice : femaleVoice
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = 'en-US'
    }
    utterance.rate = preferredVoice === 'male' ? 0.98 : 1
    utterance.pitch = preferredVoice === 'male' ? 0.88 : 1.14
    utterance.volume = 1
    utterance.onend = () => {
      speechUtteranceRef.current = null
      setSpeakingMessageId(null)
      onDone?.()
    }
    utterance.onerror = () => {
      speechUtteranceRef.current = null
      setSpeakingMessageId(null)
      setVoiceState('paused')
      setVoiceError('Speech playback could not start on this device.')
    }

    speechUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  function deliverAiResponse(prompt) {
    cancelQueuedConversationPlayback()
    const aiResponse = handleAsk(prompt)
    if (!aiResponse) {
      setVoiceState('idle')
      return
    }
    setVoiceState('playing')
    speakText(aiResponse, 'female', () => {
      setVoiceState('idle')
    })
  }

  function handleConversationPlayback(entry) {
    if (!hasSpeechSupport) {
      setVoiceError('This browser does not support spoken playback.')
      return
    }

    if (speakingMessageId === entry.id) {
      if (fullPlaybackActiveRef.current) {
        stopFullConversationPlayback()
      } else {
        stopSpeechPlayback()
      }
      return
    }

    cancelQueuedConversationPlayback()
    setVoiceError('')
    speakText(
      entry.content,
      entry.role === 'driver' ? 'male' : 'female',
      undefined,
      { messageId: entry.id },
    )
  }

  function startLiveRecognition() {
    if (!hasRecognitionSupport) {
      setVoiceError('Speech recognition is not available in this browser. Type in the chat instead.')
      setVoiceState('idle')
      return
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognition.continuous = false

      recognition.onstart = () => {
        setVoiceState('listening')
      }

      recognition.onresult = (event) => {
        let transcript = ''

        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript
        }

        setVoiceState('transcribing')
        finalTranscriptRef.current = transcript.trim()

        const lastResult = event.results[event.results.length - 1]
        if (lastResult?.isFinal) {
          finalTranscriptRef.current = transcript.trim()
        }
      }

      recognition.onerror = (event) => {
        setVoiceError(
          event.error === 'not-allowed'
            ? 'Microphone access was blocked. Allow the mic or type in the chat.'
            : 'Speech recognition is unavailable right now.',
        )
        setVoiceState('paused')
      }

      recognition.onend = () => {
        const finalTranscript = finalTranscriptRef.current.trim()

        if (finalTranscript) {
          setVoiceState('answering')
          deliverAiResponse(finalTranscript)
          finalTranscriptRef.current = ''
          return
        }

        setVoiceState('idle')
      }

      recognitionRef.current = recognition
    }

    cancelQueuedConversationPlayback()
    stopSpeechPlayback()
    setVoiceError('')
    finalTranscriptRef.current = ''
    recognitionRef.current.start()
  }

  function handleAsk(prompt) {
    const normalized = prompt.trim()

    if (!normalized) {
      return
    }

    cancelQueuedConversationPlayback()
    stopSpeechPlayback()

    const response =
      promptResponses[normalized] ??
      'I can help with route choice, wallet balance, fuel timing, rescue support, and weekly driving insights.'

    setMessages((current) => [
      ...current,
      { role: 'user', content: normalized },
      { role: 'assistant', content: response },
    ])
    setDraftMessage('')
    return response
  }

  function handleTopUp() {
    setWalletBalance((current) => current + recommendedTopUp)
  }

  function handleCompleteTrip() {
    if (tripCompleted) {
      return
    }

    setTripCompleted(true)
    setWalletBalance((current) => Math.max(0, current - selectedRoute.toll))
    setRewardPoints((current) => current + 25)
    setActiveTab('profile')
  }

  useEffect(() => {
    if (!hasSpeechSupport) {
      return undefined
    }

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices())
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [hasSpeechSupport])

  useEffect(() => {
    return () => {
      if (hasSpeechSupport) {
        window.speechSynthesis.cancel()
        speechUtteranceRef.current = null
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [hasSpeechSupport])

  useEffect(() => {
    if (!speakingMessageId) {
      return
    }

    window.requestAnimationFrame(() => {
      document.getElementById(`conv-msg-${speakingMessageId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [speakingMessageId])

  return (
    <div className="vetc-page">
      <div className="phone-shell">
        <div className="status-bar">
          <strong>12:51</strong>
          <div className="status-icons">
            <span />
            <span />
            <span className="status-battery">46</span>
          </div>
        </div>

        {activeTab === 'home' ? (
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
            <div className="hero-car" aria-hidden="true" />
          </section>
        ) : null}

        <main className={activeTab === 'home' ? 'mobile-content' : 'mobile-content compact-top'}>
          {activeTab === 'home' ? (
            <>
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
                      onClick={() => setActiveTab(service.tab)}
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
                    <span>Fuel</span>
                    <strong>{formatCurrency(commute.fuel)}</strong>
                  </div>
                </div>

                <RouteMap selectedRoute={selectedRoute} />

                <div className="button-row">
                  <button type="button" className="primary-action" onClick={() => setActiveTab('routes')}>
                    View AI route
                  </button>
                  <button type="button" className="secondary-action" onClick={() => setActiveTab('assistant')}>
                    Ask DriveMate
                  </button>
                </div>
              </section>

              <section className="smart-card surface-card">
                <div className="smart-copy">
                  <p className="section-label green">Smart alert</p>
                  <h2>Fuel up 500 VND today</h2>
                  <p>Based on your weekly travel, choosing the AI route can reduce extra cost by around 80k.</p>
                </div>
                <button type="button" className="link-action" onClick={() => setActiveTab('assistant')}>
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
            </>
          ) : null}

          {activeTab === 'routes' ? (
            <>
              <section className="page-header">
                <div>
                  <p className="section-label">AI route compare</p>
                  <h2>Today&apos;s route map</h2>
                </div>
                <button type="button" className="text-button" onClick={() => setActiveTab('home')}>
                  Back
                </button>
              </section>

              <section className="surface-card map-section">
                <RouteMap selectedRoute={selectedRoute} />
              </section>

              <section className="route-list">
                {routes.map((route) => (
                  <button
                    key={route.id}
                    type="button"
                    className={route.id === selectedRouteId ? 'route-tile active' : 'route-tile'}
                    onClick={() => setSelectedRouteId(route.id)}
                  >
                    <div className="route-tile-top">
                      <div>
                        <span className="route-kicker">{route.label}</span>
                        <strong>{route.tag}</strong>
                      </div>
                      <span className="route-score">{route.score}</span>
                    </div>
                    <p>{route.summary}</p>
                    <div className="route-stats">
                      <span>{route.eta} mins</span>
                      <span>{formatCurrency(route.toll)} toll</span>
                      <span>{formatCurrency(route.fuel)} fuel</span>
                    </div>
                  </button>
                ))}
              </section>

              <section className="bottom-cta surface-card">
                <div>
                  <p className="section-label green">Drive plan</p>
                  <h2>{selectedRoute.tag} selected</h2>
                  <p>Wallet after toll: {formatCurrency(Math.max(0, walletBalance - selectedRoute.toll))}</p>
                </div>
                <button type="button" className="primary-action" onClick={handleCompleteTrip}>
                  {tripCompleted ? 'Trip done' : 'Start trip'}
                </button>
              </section>
            </>
          ) : null}

          {activeTab === 'assistant' ? (
            <>
              <section className="assistant-modal surface-card">
                <div className="assistant-head">
                  <div>
                    <p className="section-label green">DriveMate AI</p>
                    <h2>Assistant for VETC drivers</h2>
                  </div>
                  <button
                    type="button"
                    className={voiceState === 'listening' || voiceState === 'transcribing' ? 'mic-button active' : 'mic-button'}
                    onClick={() =>
                      voiceState === 'listening' || voiceState === 'transcribing'
                        ? stopRecognition()
                        : startLiveRecognition()
                    }
                    aria-label="Start live speech to text"
                  >
                    <Icon name="sparkles" />
                  </button>
                </div>

                <div className="assistant-summary">
                  <div>
                    <span>Smart wallet</span>
                    <strong>{formatCurrency(walletBalance)}</strong>
                  </div>
                  <div>
                    <span>Reward points</span>
                    <strong>{rewardPoints}</strong>
                  </div>
                  <div>
                    <span>Best departure</span>
                    <strong>{commute.departureTime}</strong>
                  </div>
                </div>

                <div className="prompt-chips">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" className="chip-button" onClick={() => handleAsk(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>

                {voiceError ? <p className="voice-error assistant-voice-error">{voiceError}</p> : null}

                <section className="conversation-section">
                  <div className="conversation-header">
                    <div>
                      <span className="section-label">Assistant chat</span>
                      <strong>Route and wallet updates</strong>
                    </div>
                    <button
                      type="button"
                      className={isFullConversationPlaying ? 'record-thread-btn playing' : 'record-thread-btn'}
                      onClick={playFullConversationThread}
                      aria-label={
                        isFullConversationPlaying ? 'Stop playing conversation' : 'Play full conversation aloud'
                      }
                    >
                      {isFullConversationPlaying ? <Icon name="stop" /> : <Icon name="record" />}
                    </button>
                  </div>

                  <div className="conversation-thread">
                    {scriptedConversation.map((entry) => (
                      <article
                        id={`conv-msg-${entry.id}`}
                        key={entry.id}
                        className={entry.role === 'assistant' ? 'message-row assistant' : 'message-row driver'}
                      >
                        <div className="message-meta">
                          <span className={entry.role === 'assistant' ? 'message-avatar assistant' : 'message-avatar driver'}>
                            {entry.role === 'assistant' ? 'AI' : 'DR'}
                          </span>
                          <span className="message-name">
                            {entry.role === 'assistant' ? 'DriveMate AI' : 'Driver'}
                          </span>
                        </div>

                        <div className={entry.role === 'assistant' ? 'message-bubble assistant' : 'message-bubble driver'}>
                          <p>{entry.content}</p>
                          <button
                            type="button"
                            className={speakingMessageId === entry.id ? 'message-audio active' : 'message-audio'}
                            onClick={() => handleConversationPlayback(entry)}
                          >
                            <Icon name="volume" />
                            <span>{speakingMessageId === entry.id ? 'Stop' : 'Play'}</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <div className="chat-list">
                  {messages.map((message, index) => (
                    <article
                      key={`${message.role}-${index}`}
                      className={message.role === 'assistant' ? 'chat-card assistant' : 'chat-card user'}
                    >
                      <span>{message.role === 'assistant' ? 'DriveMate AI' : 'You'}</span>
                      <p>{message.content}</p>
                    </article>
                  ))}
                </div>

                <form
                  className="chat-composer"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleAsk(draftMessage)
                  }}
                >
                  <input
                    type="text"
                    value={draftMessage}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder="Ask about route, fuel, wallet, rewards..."
                  />
                  <button type="submit" className="primary-action small">
                    Send
                  </button>
                </form>
              </section>

              <section className="surface-card info-card">
                <p className="section-label">AI abilities</p>
                <ul className="feature-list">
                  <li>Predict destination from routine and recent trips.</li>
                  <li>Compare route cost, time, and toll on a map view.</li>
                  <li>Recommend top-up amount and fuel-saving timing.</li>
                  <li>Play real browser text-to-speech when the device/browser supports it.</li>
                  <li>Support rescue and vehicle reminders as part of VETC services.</li>
                </ul>
              </section>
            </>
          ) : null}

          {activeTab === 'wallet' ? (
            <>
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
                </div>
                <div className="button-row">
                  <button type="button" className="primary-action" onClick={handleTopUp}>
                    Top up {formatCurrency(recommendedTopUp)}
                  </button>
                  <button type="button" className="secondary-action" onClick={() => setActiveTab('assistant')}>
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
                      onClick={() => setActiveTab(service.tab)}
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
            </>
          ) : null}

          {activeTab === 'profile' ? (
            <>
              <section className="surface-card profile-card">
                <div className="profile-top">
                  <div className="profile-avatar">{user.name[0]}</div>
                  <div>
                    <p className="section-label green">Driver profile</p>
                    <h2>{user.name}</h2>
                    <p>{user.carType} • {user.homeLocation} to {user.workLocation}</p>
                  </div>
                </div>

                <div className="weekly-grid">
                  {weeklyMetrics.map((metric) => (
                    <article key={metric.label} className="weekly-tile">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                    </article>
                  ))}
                </div>
              </section>

              <section className="surface-card info-card">
                <p className="section-label">AI recap</p>
                <h2>What DriveMate adds inside VETC</h2>
                <ul className="feature-list">
                  <li>Morning commute prediction with confidence score.</li>
                  <li>Map-based route recommendation instead of plain route text.</li>
                  <li>Wallet, fuel, reward, and rescue assistance in one assistant layer.</li>
                  <li>Weekly insight card for business value and retention story.</li>
                </ul>
              </section>
            </>
          ) : null}
        </main>

        <button type="button" className="floating-support" onClick={() => setActiveTab('assistant')}>
          <span className="floating-ring">
            <Icon name="sparkles" />
          </span>
          <small>AI</small>
        </button>

        <nav className="bottom-nav" aria-label="Main">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? 'bottom-tab active' : 'bottom-tab'}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default App
