/**
 * Simulation-first intent engine for DriveMate AI chat.
 *
 * Matches user messages to scripted responses based on convo.txt flows.
 * This runs before any Qwen call so the demo works offline and responds instantly.
 *
 * Intent order matters: more specific patterns are listed first.
 */

const INTENTS = [
  // ── Vehicle selection ────────────────────────────────────────────────────────
  {
    id: 'vehicle_ev',
    match: (t) => /vinfast|vf[\s-]?8|vf\s?e\d|electric\b|ev\b|điện/i.test(t),
    reply: () =>
      `Got it. I'll tune tips for battery use and charging — not petrol — unless you switch vehicles in the app.`,
  },
  {
    id: 'vehicle_ice',
    match: (t) => /volvo|xc60|diesel\b|petrol\b|xăng\b|corolla|toyota/i.test(t),
    reply: () =>
      `Switching to ICE mode. I'll calculate fuel cost in RON95 and suggest petrol stations along the route.`,
  },

  // ── Route start ──────────────────────────────────────────────────────────────
  {
    id: 'start_route',
    match: (t) => /^(start|go now|navigate|let'?s go|begin trip|bắt đầu)/i.test(t.trim()),
    reply: () =>
      `Starting Best Value Route now. Highlands Coffee is on the way — I'll remind you when you're nearby. Navigation is active. Have a safe trip!`,
  },

  // ── Route query ──────────────────────────────────────────────────────────────
  {
    id: 'route_query',
    match: (t) => /route|which way|best way|how (to|do i) get|path|direction|road|tuyến|đường/i.test(t),
    reply: () =>
      `I found 3 options:\n• Best Value — 35 min, 2 toll stations, 30k each. Recommended.\n• Fastest — 31 min, 3 toll stations, 90k total.\n• Cheapest — 42 min, no toll, but adds 7 minutes.\nI recommend Best Value — it saves about 20k vs Fastest with only 4 extra minutes.`,
  },

  // ── Coffee stop ──────────────────────────────────────────────────────────────
  {
    id: 'coffee',
    match: (t) => /coffee|highlands|café|cafe|cà phê|remind me/i.test(t),
    reply: () =>
      `Sure. I'll remind you when you're near Highlands Coffee Landmark in Binh Thanh — usually around minute 24 of the trip.`,
  },

  // ── Traffic ──────────────────────────────────────────────────────────────────
  {
    id: 'traffic',
    match: (t) => /traffic|jam|congestion|peak|slow|kẹt xe|tắc/i.test(t),
    reply: () =>
      `Forecast for your inbound leg: the highway stretch is expected to jam from about 7:50 to 8:30 AM — going through mid-peak often adds around 15 minutes.\nTry to leave before 8:10 AM to miss the worst of the queue — you can usually save roughly 12 minutes compared with leaving mid-peak.`,
  },

  // ── Energy / charging cost (EV) ───────────────────────────────────────────────
  {
    id: 'energy_ev',
    match: (t) =>
      /energy cost|kwh|electricity|charging cost|charge cost|điện phí|tiền điện/i.test(t),
    reply: () =>
      `Blended home and DC fast pricing is up about 120 VND/kWh vs your average last month.\nFor this office run you're looking at roughly 42–48k VND in electricity based on your current charging mix.\nBest Value avoids the longest high-speed pulls in this heat, trimming a few percent off kWh/km.\nAlso, Nguyen Hue Smart Parking near your destination still has EV bays available this morning.`,
  },

  // ── Fuel cost (ICE) ───────────────────────────────────────────────────────────
  {
    id: 'fuel_cost',
    match: (t) => /fuel cost|petrol cost|litre|liter|xăng tốn|bao nhiêu xăng/i.test(t),
    reply: () =>
      `RON95-III is at 24,300 VND/L today. For this 14 km run in the Volvo XC60 you're looking at roughly 58–65k VND in fuel. Best Value avoids stop-start traffic that burns extra.`,
  },

  // ── Parking ───────────────────────────────────────────────────────────────────
  {
    id: 'parking',
    match: (t) => /park|reserve|spot|bay|parking|đỗ xe|giữ chỗ/i.test(t),
    reply: () =>
      `Reserved. You now have one EV parking slot at Nguyen Hue Smart Parking from 8:30 to 10:30 AM — about a 6-minute walk to the office.`,
  },

  // ── Wallet / top-up ───────────────────────────────────────────────────────────
  {
    id: 'wallet',
    match: (t) => /wallet|top.?up|balance|nạp tiền|ví điện tử|số dư|toll balance/i.test(t),
    reply: () =>
      `Your wallet balance is 120,000 VND.\nEstimated toll spending for the next few trips is 300,000 VND.\nI recommend topping up 200,000 VND tonight before the morning commute.`,
  },

  // ── Rewards / points ──────────────────────────────────────────────────────────
  {
    id: 'rewards',
    match: (t) => /reward|point|voucher|redeem|loyalty|phần thưởng|điểm tích lũy/i.test(t),
    reply: () =>
      `You currently have 1,250 reward points.\nYou can redeem a free coffee voucher or a parking discount today — go to Wallet → Loyalty to claim.`,
  },

  // ── Weekly recap ──────────────────────────────────────────────────────────────
  {
    id: 'weekly',
    match: (t) => /this week|weekly|recap|summary|how did i do|tuần này|tổng kết/i.test(t),
    reply: () =>
      `This week you completed 12 trips.\nYou saved 120,000 VND using smart routes.\nYou also reduced travel time by 45 minutes.\nGreat job!`,
  },

  // ── Greeting ──────────────────────────────────────────────────────────────────
  {
    id: 'greeting',
    match: (t) => /^(hi|hello|hey|good morning|xin chào|chào|alo)\b/i.test(t.trim()),
    reply: () =>
      `Hi! I'm about to head to the People's Committee office — let me check which car you're taking today. Your electric VinFast VF 8, or your Volvo XC60?`,
  },

  // ── Destination inquiry ────────────────────────────────────────────────────────
  {
    id: 'destination',
    match: (t) =>
      /committee|people'?s committee|nguyen hue|district 1|đi đâu|where.*go|heading to/i.test(t),
    reply: () =>
      `Heading to People's Committee Office, 86 Le Thanh Ton, District 1. Distance ~14 km from Thu Duc. I'll load the 3 best routes now.`,
  },
];

/**
 * Try to match the user's message to a scripted intent.
 *
 * @param {string} text - raw user message
 * @returns {{ matched: boolean, text: string | null }}
 */
export function simulationReply(text) {
  if (!text || !text.trim()) return { matched: false, text: null };
  const intent = INTENTS.find((i) => i.match(text));
  if (intent) return { matched: true, text: intent.reply() };
  return { matched: false, text: null };
}

/**
 * All supported intent IDs + example phrases — used by the documentation file.
 */
export const INTENT_CATALOG = INTENTS.map((i) => i.id);
