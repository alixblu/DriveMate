export const user = {
  name: 'Mai Tran',
  homeLocation: 'Thu Duc City',
  workLocation: 'District 1',
};

export const vehicles = [
  {
    id: 'toyota-vios',
    name: 'Toyota Vios',
    shortName: 'Vios',
    powertrain: 'ice',
    vehicleMode: 'ICE',
    detail: 'RON95-III · 7.2 L/100 km city mix',
    fuelType: 'RON95-III',
  },
  {
    id: 'vinfast-vf8',
    name: 'VinFast VF 8',
    shortName: 'VF 8',
    powertrain: 'ev',
    vehicleMode: 'EV',
    detail: '74% battery · 20.8 kWh/100 km city mix',
    fuelType: 'Electric',
  },
];

export const routeCatalog = [
  {
    id: 'best-value',
    label: 'AI suggested',
    badge: 'Best Value',
    baseEtaMin: 27,
    tollVnd: 34000,
    tollStations: 2,
    tollEachVnd: 17000,
    litresUsed: 1.52,
    kwhUsed: 4.7,
    color: '#18b46b',
    path: 'M40 178 C84 166 124 138 150 128 C176 116 218 102 278 54',
    rationale:
      'Balances a short ETA with lower toll and energy spend than the fastest route.',
    tollStationName: 'Phu My express gate',
    parkingLotName: 'Nguyen Hue Smart Parking',
    parkingDetail: '5-minute walk to the office, reserve inside VETC.',
    chargingStationName: 'Saigon Centre EV Hub',
    chargingDetail: '150 kW charging bays beside the parking entrance.',
    carWashName: 'Bach Dang Express Wash',
    carWashDetail: 'Fast exterior wash on the way home after rainy traffic.',
  },
  {
    id: 'fastest',
    label: 'Fast lane',
    badge: 'Fastest',
    baseEtaMin: 23,
    tollVnd: 52000,
    tollStations: 1,
    tollEachVnd: 52000,
    litresUsed: 1.71,
    kwhUsed: 5.1,
    color: '#1f2937',
    path: 'M36 176 C80 160 112 132 142 118 C174 103 218 98 280 50',
    rationale:
      'Wins on arrival time, but the premium toll lane makes it the most expensive option.',
    tollStationName: 'Long Thanh premium gate',
    parkingLotName: 'District 1 Basement Parking',
    parkingDetail: 'Closest arrival path, but parking fills earliest.',
    chargingStationName: 'Opera House DC Fast Charge',
    chargingDetail: 'Quick top-up, but it adds a detour after arrival.',
    carWashName: 'District 1 Premium Wash',
    carWashDetail: 'Convenient after meetings, but pricier than the best-value route.',
  },
  {
    id: 'cheapest',
    label: 'Saver lane',
    badge: 'Cheapest',
    baseEtaMin: 34,
    tollVnd: 18000,
    tollStations: 1,
    tollEachVnd: 18000,
    litresUsed: 1.42,
    kwhUsed: 4.2,
    color: '#f59e0b',
    path: 'M38 178 C86 182 108 154 138 150 C170 146 226 126 276 58',
    rationale:
      'Lowest cash outlay, but the longer city traffic window makes it the slowest choice.',
    tollStationName: 'Mai Chi Tho city gate',
    parkingLotName: 'Le Loi Public Parking',
    parkingDetail: 'Lowest parking fee, but a longer walk to the office.',
    chargingStationName: 'Le Loi Public Charger',
    chargingDetail: 'Cheapest charge, but queues are less predictable.',
    carWashName: 'Ben Nghe Quick Wash',
    carWashDetail: 'Budget-friendly wash stop near the cheap lane exit.',
  },
];

export const serviceLocations = {
  tollStations: [
    {
      name: 'Phu My express gate',
      detail: 'Auto-pay compatible with VETC and lowest queue risk for the best-value route.',
    },
    {
      name: 'Long Thanh premium gate',
      detail: 'Fastest entry to District 1, but highest toll burn.',
    },
    {
      name: 'Mai Chi Tho city gate',
      detail: 'Cheaper than the express option, but city traffic is less predictable.',
    },
  ],
  parkingLots: [
    {
      name: 'Nguyen Hue Smart Parking',
      detail: '5-minute walk to the office, live slot count, reserve in-app.',
    },
    {
      name: 'Le Loi Public Parking',
      detail: 'Lower rate with a longer walk and fewer guaranteed spaces.',
    },
  ],
  chargingStations: [
    {
      name: 'Saigon Centre EV Hub',
      detail: '150 kW fast charge, beside the destination parking entrance.',
    },
    {
      name: 'Opera House DC Fast Charge',
      detail: 'Premium fast-charge option near the fastest route exit.',
    },
  ],
  carWashLocations: [
    {
      name: 'Bach Dang Express Wash',
      detail: 'Recommended after rainy peak-hour traffic for the best-value route.',
    },
    {
      name: 'Ben Nghe Quick Wash',
      detail: 'Budget wash stop near the cheaper return route.',
    },
  ],
};

export const services = [
  { id: 'wallet', label: 'Toll top-up', icon: 'wallet', tab: 'wallet' },
  { id: 'route', label: 'AI routes', icon: 'route', tab: 'routes', badge: 'AI' },
  { id: 'parking', label: 'Parking', icon: 'document', tab: 'routes' },
  { id: 'charging', label: 'Charging', icon: 'fuel', tab: 'assistant' },
  { id: 'car-wash', label: 'Car wash', icon: 'wash', tab: 'assistant' },
  { id: 'alerts', label: 'Alerts', icon: 'bell', tab: 'notifications' },
  { id: 'assistant', label: 'Ask DriveMate', icon: 'sparkles', tab: 'assistant' },
  { id: 'garage', label: 'Garage', icon: 'profile', tab: 'profile' },
];

export const bottomTabs = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'routes', label: 'Routes', icon: 'route' },
  { id: 'assistant', label: 'DriveMate AI', icon: 'sparkles' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'profile', label: 'Me', icon: 'profile' },
];
