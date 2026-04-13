export const user = {
  name: 'Alex Nguyen',
  homeLocation: 'Thu Duc City',
  workLocation: 'District 1',
}

/** Garage — VF 8 is BEV; Volvo is ICE for mixed-household demo copy. */
export const vehicles = [
  {
    id: 'vinfast-vf8',
    name: 'VinFast VF 8',
    shortName: 'VF 8',
    powertrain: 'ev',
    detail: '82% charge · ~22 kWh/100 km blended',
  },
  {
    id: 'volvo-xc60',
    name: 'Volvo XC60',
    shortName: 'XC60',
    powertrain: 'ice',
    detail: 'Diesel · ~6.8 L/100 km highway',
  },
]

export const commute = {
  destination: 'Office',
  confidence: 82,
  eta: 24,
  departureTime: '08:10',
  toll: 35,
  charging: 40,
  traffic: 'Peak jam ~7:50–8:30',
}

/** AI suggested lane first (list + map draw order). aiFit = higher better; jamRisk = higher worse (Best Value carries more highway / toll stress). */
export const routes = [
  {
    id: 'balance',
    label: 'AI suggested',
    tag: 'Best Value',
    eta: 35,
    toll: 60,
    tollStations: 2,
    tollEach: 30,
    charging: 38,
    aiFit: 91,
    jamRisk: 46,
    color: '#18b46b',
    path: 'M40 178 C84 166 124 138 150 128 C176 116 218 102 278 54',
    summary: 'Best trade-off between time, toll, and running cost today.',
    coffeeStop: 'Highlands Coffee',
    parkingSpot: 'Nguyen Hue Smart Parking',
  },
  {
    id: 'fast',
    label: 'Fast lane',
    tag: 'Fastest',
    eta: 19,
    toll: 50,
    tollStations: 1,
    tollEach: 50,
    charging: 47,
    aiFit: 68,
    jamRisk: 18,
    color: '#1f2937',
    path: 'M36 176 C80 160 112 132 142 118 C174 103 218 98 280 50',
    summary: 'Best when arrival time matters most.',
    coffeeStop: null,
    parkingSpot: 'District 1 Basement Parking',
  },
  {
    id: 'cheap',
    label: 'Saver lane',
    tag: 'Cheapest',
    eta: 30,
    toll: 18,
    tollStations: 1,
    tollEach: 18,
    charging: 34,
    aiFit: 65,
    jamRisk: 31,
    color: '#f59e0b',
    path: 'M38 178 C86 182 108 154 138 150 C170 146 226 126 276 58',
    summary: 'Lower toll and running cost, slightly longer city route.',
    coffeeStop: null,
    parkingSpot: 'Le Loi Public Parking',
  },
]

export const routeCoffeeStop = {
  name: 'Highlands Coffee',
  detail: 'On the AI suggested lane — we can remind you when you are nearby.',
}

export const routeParkingSpot = {
  name: 'Nguyen Hue Smart Parking',
  detail: '6-minute walk to the office, 14 EV bays available, reserve from DriveMate AI.',
}

export const services = [
  { id: 'wallet', label: 'Top up', icon: 'wallet', tab: 'wallet' },
  { id: 'reward', label: 'My Loyalty', icon: 'gift', tab: 'wallet' },
  { id: 'bank', label: 'Bank link', icon: 'link', tab: 'wallet' },
  { id: 'docs', label: 'Docs wallet', icon: 'document', tab: 'profile', badge: 'New' },
  { id: 'route', label: 'AI routes', icon: 'routes', badge: 'AI' },
  { id: 'rescue', label: 'AI rescue', icon: 'rescue', tab: 'assistant', badge: 'New' },
  { id: 'charging', label: 'Charging coach', icon: 'fuel', tab: 'assistant' },
  { id: 'more', label: 'More', icon: 'grid', tab: 'profile' },
]

export const quickPrompts = [
  'Cheapest route today?',
  'VF 8 energy cost today?',
  'Need top-up for this week?',
  'Any traffic ahead?',
]

export const promptResponses = {
  'Cheapest route today?':
    'The cheapest lane is about 18k toll and 34k in running cost, near 30 minutes. Your AI lane balances time and kWh a bit better in heat like today.',
  'VF 8 energy cost today?':
    'Blended charging is up roughly 120 VND per kWh. For your office run in the VF 8, budget about 42 to 48k in electricity depending on home and fast-charging share.',
  'How long to office?':
    'Office is about 24 to 35 minutes depending on lane. If you leave after 8:20, ETA often increases by around 9 minutes.',
  'Need top-up for this week?':
    'Yes. Your expected toll spend is 300k and your wallet is only 120k. I suggest a 200k top-up to stay safe.',
  'Any traffic ahead?':
    'Typical inbound peak on your corridor is about 7:50 to 8:30 AM—often around 15 extra minutes if you drive through the thick of it. Leaving before about 8:10 usually saves roughly 12 minutes.',
  'Any parking near office?':
    'Yes. Nguyen Hue Smart Parking has EV slots available this morning. It is around a 6-minute walk from your office and you can reserve a bay now.',
  'Show my rewards':
    'You currently have 1,250 reward points. One more recommended commute unlocks the next toll discount reward.',
}

export const articleCards = [
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
    title: 'EV rates edged up—balanced route saves a few percent on kWh in the heat',
    kicker: 'Energy insight',
  },
  {
    id: 4,
    theme: 'dark',
    title: 'Route AI can save 45 minutes weekly with better departure timing',
    kicker: 'Weekly Report',
  },
]

export const weeklyMetrics = [
  { label: 'Trips', value: '14' },
  { label: 'Saved', value: '185k' },
  { label: 'Traffic cut', value: '45m' },
  { label: 'Preferred car', value: 'VF 8' },
]

export const bottomTabs = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'routes', label: 'Routes', icon: 'route' },
  { id: 'assistant', label: 'DriveMate AI', icon: 'sparkles' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'profile', label: 'Me', icon: 'profile' },
]

export const chatHistorySessions = [
  {
    id: 'h1',
    title: 'Office route & toll',
    preview: 'Best Value Route, charging stop, parking reservation…',
    when: 'Today · 8:02',
  },
  {
    id: 'h2',
    title: 'VF 8 energy & weekly cost',
    preview: 'kWh pricing, Volvo comparison, smart route savings…',
    when: 'Yesterday',
  },
  {
    id: 'h3',
    title: 'Rewards & trip recap',
    preview: 'Points balance, 12 trips, time saved…',
    when: 'Mon',
  },
  {
    id: 'h4',
    title: 'Traffic & departure',
    preview: 'Jam forecast 7:50–8:30, leave before 8:10…',
    when: 'Last week',
  },
]

export const scriptedConversation = [
  {
    id: 'c1',
    role: 'driver',
    content:
      "Hi, I'm about to head to the People's Committee office. What's the best route today?",
  },
  {
    id: 'c2',
    role: 'assistant',
    content:
      'Quick check—which car are you taking today? Your electric VinFast VF 8, or your Volvo XC60?',
  },
  {
    id: 'c3',
    role: 'driver',
    content: "The VinFast VF 8—I'm going electric today.",
  },
  {
    id: 'c4',
    role: 'assistant',
    content:
      "Got it. I'll tune tips for battery use and charging—not petrol—unless you switch vehicles in the app.",
  },
  { id: 'c5', role: 'assistant', content: 'I found 3 options:' },
  {
    id: 'c6',
    role: 'assistant',
    content: 'Best Value Route — 35 mins, 2 toll stations, Toll 30k each.',
  },
  {
    id: 'c7',
    role: 'assistant',
    content: 'I recommend Best Value because it saves about 20k in running cost with only a few extra minutes.',
  },
  {
    id: 'c8',
    role: 'assistant',
    content:
      "There are also Fastest and Cheapest lanes if you want to hear them—energy use looks a bit different on each.",
  },
  { id: 'c9', role: 'driver', content: 'Just start the best route.' },
  { id: 'c10', role: 'assistant', content: 'Starting Best Value Route now.' },
  {
    id: 'c11',
    role: 'assistant',
    content:
      "There is a Highlands Coffee on the way. Would you like to grab one as usual? I can remind you when you're nearby.",
  },
  { id: 'c12', role: 'driver', content: "Yes, remind me when I'm close." },
  {
    id: 'c13',
    role: 'assistant',
    content: "Sure. I'll remind you when you're near the coffee shop.",
  },
  { id: 'c13b', role: 'assistant', content: 'Nearby parking: Nguyen Hue Smart Parking has EV slots now.' },
  { id: 'c13c', role: 'driver', content: 'Please reserve one slot close to the office.' },
  {
    id: 'c13d',
    role: 'assistant',
    content: 'Done. One EV slot is reserved from 8:30 to 10:30 AM, about a 6-minute walk to your office.',
  },
  { id: 'c14', role: 'driver', content: 'Any traffic I should know about?' },
  {
    id: 'c15',
    role: 'assistant',
    content:
      'Forecast for your inbound leg: the highway stretch is expected to jam from about 7:50 to 8:30 AM—going through the middle often adds around 15 minutes.',
  },
  {
    id: 'c16',
    role: 'assistant',
    content:
      'Try to leave before about 8:10 AM to miss the worst queue—you can usually save roughly 12 minutes compared with leaving mid-peak.',
  },
  {
    id: 'c17',
    role: 'driver',
    content: 'What should I expect for energy cost on the VF 8 for this commute?',
  },
  {
    id: 'c18',
    role: 'assistant',
    content:
      'Blended home and DC fast pricing is up about 120 VND per kilowatt-hour versus your average last month.',
  },
  {
    id: 'c19',
    role: 'assistant',
    content:
      'For this office run you are looking at roughly 42 to 48k in electricity based on your current charging mix.',
  },
  {
    id: 'c20',
    role: 'assistant',
    content:
      'The Best Value lane avoids the longest high-speed pulls in this heat, which trims a few percent off kWh per kilometer.',
  },
  { id: 'c21', role: 'driver', content: 'Do I need to top up my wallet?' },
  { id: 'c22', role: 'assistant', content: 'Your wallet balance is 120k.' },
  {
    id: 'c23',
    role: 'assistant',
    content: 'Estimated toll spending for the next few trips is 300k.',
  },
  { id: 'c24', role: 'assistant', content: 'I recommend topping up 200k.' },
  { id: 'c25', role: 'driver', content: 'How many reward points do I have?' },
  { id: 'c26', role: 'assistant', content: 'You currently have 1,250 points.' },
  {
    id: 'c27',
    role: 'assistant',
    content: 'You can redeem a coffee voucher or parking discount today.',
  },
  { id: 'c28', role: 'driver', content: 'How did I do this week?' },
  { id: 'c29', role: 'assistant', content: 'This week you completed 12 trips.' },
  { id: 'c30', role: 'assistant', content: 'You saved 120k using smart routes.' },
  {
    id: 'c31',
    role: 'assistant',
    content: 'You also reduced travel time by 45 minutes.',
  },
  { id: 'c32', role: 'assistant', content: 'Great job!' },
  { id: 'c33', role: 'driver', content: 'Nice.' },
  { id: 'c34', role: 'assistant', content: 'Navigation is active. Have a safe trip!' },
]

export const voiceDemoTrip = {
  destination: "People's Committee Office",
  routeLabel: 'Best Value',
  etaMins: 35,
  tollSummary: '2 stations • 30k each',
  bonusLine: 'Coffee + parking reminder on the way',
}
