// Simulation-first map data for DriveMate MVP
// Source: data/pois.csv, data/route_points.csv, data/users.csv

export const ORIGIN = {
  lat: 10.850620,
  lng: 106.771630,
  label: 'Thu Duc City',
};

// Nearby simulation POIs shown on the real map.
export const POIS = [
  { poi_id: 1, name: 'Thu Duc Toll Gate',        type: 'toll_station',     lat: 10.8429,   lng: 106.7608,  address: 'Thu Duc' },
  { poi_id: 2, name: 'Petrolimex Station 25',     type: 'gas_station',      lat: 10.8355,   lng: 106.7526,  address: 'Thu Duc' },
  { poi_id: 3, name: 'VETC Charging Thu Duc',     type: 'charging_station', lat: 10.838,    lng: 106.754,   address: 'Thu Duc' },
  { poi_id: 4, name: 'Highlands Coffee Landmark', type: 'coffee_shop',      lat: 10.7934,   lng: 106.7212,  address: 'Binh Thanh' },
  { poi_id: 5, name: 'Central Toll Plaza',         type: 'toll_station',     lat: 10.7859,   lng: 106.7105,  address: 'District 1' },
  { poi_id: 6, name: "People's Committee Office", type: 'destination',      lat: 10.775833, lng: 106.701389, address: '86 Le Thanh Ton, District 1' },
  { poi_id: 7, name: 'Nguyen Hue Smart Parking',   type: 'parking_lot',      lat: 10.7732,   lng: 106.7043,   address: 'Nguyen Hue, District 1' },
  { poi_id: 8, name: 'Saigon Centre EV Hub',       type: 'charging_station', lat: 10.7776,   lng: 106.7012,   address: 'Le Loi, District 1' },
  { poi_id: 9, name: 'Bach Dang Express Wash',     type: 'car_wash',         lat: 10.7842,   lng: 106.7158,   address: 'Bach Dang, District 1' },
  { poi_id: 10, name: 'Le Loi Public Parking',     type: 'parking_lot',      lat: 10.7761,   lng: 106.6978,   address: 'Le Loi, District 1' },
];

// POI type → marker color (used by LeafletMap divIcon)
export const POI_COLORS = {
  toll_station:     '#f97316', // orange
  gas_station:      '#ef4444', // red
  charging_station: '#22c55e', // green
  coffee_shop:      '#92400e', // brown
  parking_lot:      '#2563eb', // blue
  car_wash:         '#06b6d4', // cyan
  destination:      '#3b82f6', // blue
  default:          '#6b7280', // gray
};

// Route polylines
// R1: real coordinates from data/route_points.csv
// R2: slightly north of R1 (faster / more highway)
// R3: southern loop (avoids tolls, longer)
const BASE_ROUTE_POLYLINES = {
  'best-value': [
    [10.850620, 106.771630],
    [10.845300, 106.765900],
    [10.842900, 106.760800],
    [10.838000, 106.754000],
    [10.835500, 106.752600],
    [10.820000, 106.740000],
    [10.805000, 106.730000],
    [10.793400, 106.721200],
    [10.785900, 106.710500],
    [10.775833, 106.701389],
  ],
  fastest: [
    [10.850620, 106.771630],
    [10.848000, 106.768000],
    [10.846000, 106.762000],
    [10.841000, 106.757000],
    [10.838000, 106.750000],
    [10.822000, 106.738000],
    [10.808000, 106.727000],
    [10.796000, 106.718000],
    [10.787000, 106.709000],
    [10.775833, 106.701389],
  ],
  cheapest: [
    [10.850620, 106.771630],
    [10.843000, 106.764000],
    [10.835000, 106.758000],
    [10.824000, 106.749000],
    [10.810000, 106.738000],
    [10.798000, 106.727000],
    [10.789000, 106.717000],
    [10.781000, 106.708000],
    [10.778000, 106.703000],
    [10.775833, 106.701389],
  ],
};

const DESTINATION_ROUTE_OVERRIDES = {
  committee: BASE_ROUTE_POLYLINES,
  highlands: {
    'best-value': BASE_ROUTE_POLYLINES['best-value'].slice(0, 8),
    fastest: BASE_ROUTE_POLYLINES.fastest.slice(0, 8),
    cheapest: BASE_ROUTE_POLYLINES.cheapest.slice(0, 8),
  },
  central_toll: {
    'best-value': BASE_ROUTE_POLYLINES['best-value'].slice(0, 9),
    fastest: BASE_ROUTE_POLYLINES.fastest.slice(0, 9),
    cheapest: BASE_ROUTE_POLYLINES.cheapest.slice(0, 9),
  },
  thu_duc_toll: {
    'best-value': BASE_ROUTE_POLYLINES['best-value'].slice(0, 3),
    fastest: BASE_ROUTE_POLYLINES.fastest.slice(0, 4),
    cheapest: BASE_ROUTE_POLYLINES.cheapest.slice(0, 3),
  },
  nguyen_hue_parking: {
    'best-value': [
      ...BASE_ROUTE_POLYLINES['best-value'].slice(0, -1),
      [10.7732, 106.7043],
    ],
    fastest: [
      ...BASE_ROUTE_POLYLINES.fastest.slice(0, -1),
      [10.7732, 106.7043],
    ],
    cheapest: [
      ...BASE_ROUTE_POLYLINES.cheapest.slice(0, -1),
      [10.7732, 106.7043],
    ],
  },
};

export const ROUTE_POLYLINES = DESTINATION_ROUTE_OVERRIDES.committee;

// Supported destinations for the simulation
export const DESTINATIONS = [
  {
    key: 'committee',
    label: "People's Committee Office",
    lat: 10.775833,
    lng: 106.701389,
    keywords: ['committee', 'office', "people's", 'peoples', 'ủy ban', 'nguyen hue', 'district 1'],
  },
  {
    key: 'highlands',
    label: 'Highlands Coffee Landmark',
    lat: 10.793400,
    lng: 106.721200,
    keywords: ['highlands', 'coffee', 'cafe', 'café', 'cà phê', 'binh thanh'],
  },
  {
    key: 'central_toll',
    label: 'Central Toll Plaza',
    lat: 10.785900,
    lng: 106.710500,
    keywords: ['central toll', 'toll plaza', 'central plaza'],
  },
  {
    key: 'thu_duc_toll',
    label: 'Thu Duc Toll Gate',
    lat: 10.842900,
    lng: 106.760800,
    keywords: ['thu duc toll', 'thu duc gate', 'thu đức'],
  },
  {
    key: 'nguyen_hue_parking',
    label: 'Nguyen Hue Smart Parking',
    lat: 10.773200,
    lng: 106.704300,
    keywords: ['nguyen hue parking', 'smart parking', 'parking lot', 'parking'],
  },
];

/**
 * Match free-form text to a supported destination or return null.
 */
export function matchDestination(text) {
  if (!text || !text.trim()) return null;
  const lower = text.toLowerCase().trim();
  return DESTINATIONS.find((d) => d.keywords.some((kw) => lower.includes(kw))) ?? null;
}

/**
 * Match free-form text to a supported destination.
 * Falls back to People's Committee Office (index 0) if no match.
 */
export function resolveDestination(text) {
  return matchDestination(text) ?? DESTINATIONS[0];
}

export function getRoutePolyline(routeId, destinationKey = DESTINATIONS[0].key) {
  const destinationRoutes =
    DESTINATION_ROUTE_OVERRIDES[destinationKey] ?? DESTINATION_ROUTE_OVERRIDES.committee;
  return destinationRoutes[routeId] ?? BASE_ROUTE_POLYLINES[routeId] ?? [];
}

export function getRelevantPois(destinationKey = DESTINATIONS[0].key) {
  const committeeCluster = [
    "People's Committee Office",
    'Nguyen Hue Smart Parking',
    'Saigon Centre EV Hub',
    'Bach Dang Express Wash',
    'Le Loi Public Parking',
    'Central Toll Plaza',
    'Highlands Coffee Landmark',
  ];
  const highlandsCluster = [
    'Highlands Coffee Landmark',
    'Central Toll Plaza',
    'Bach Dang Express Wash',
    'Petrolimex Station 25',
    'VETC Charging Thu Duc',
  ];
  const thuDucCluster = [
    'Thu Duc Toll Gate',
    'Petrolimex Station 25',
    'VETC Charging Thu Duc',
  ];

  const namesByDestination = {
    committee: committeeCluster,
    nguyen_hue_parking: committeeCluster,
    highlands: highlandsCluster,
    central_toll: [...highlandsCluster, 'Nguyen Hue Smart Parking'],
    thu_duc_toll: thuDucCluster,
  };

  const allowedNames = new Set(namesByDestination[destinationKey] ?? committeeCluster);
  return POIS.filter((poi) => allowedNames.has(poi.name));
}
