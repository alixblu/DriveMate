import React from 'react';
import { Icon } from './Icon';
import { routes, voiceDemoTrip, user } from '../data/mockData';

export function RouteMap({
  selectedRoute,
  onSelectRoute,
  runningCostLabel,
  destinationLabel,
  originLabel,
  variant = 'default',
}) {
  const dest = destinationLabel ?? voiceDemoTrip.destination;
  const origin = originLabel ?? user.homeLocation;
  const isRoutesTab = variant === 'routes';

  const formatCurrency = (value) => `${value}k`;

  return (
    <div className={`map-vision${isRoutesTab ? ' map-vision-routes' : ''}`}>
      <div className="map-vision-top">
        <span className="map-live">{isRoutesTab ? '3 routes' : 'Live map'}</span>
        <span className="map-area">
          {origin} → {dest}
        </span>
      </div>
      <svg className="map-canvas" viewBox="0 0 320 220" aria-hidden="true">
        <rect x="0" y="0" width="320" height="220" rx="28" fill="#eef4ef" />
        <path d="M28 32C82 52 112 58 170 52C216 48 262 56 298 36" stroke="#dbe8dc" strokeWidth="18" fill="none" />
        <path d="M24 110C70 118 108 102 150 94C198 84 236 96 294 80" stroke="#dce6ef" strokeWidth="16" fill="none" />
        <path d="M46 186C84 150 120 140 150 128C198 108 246 90 278 54" stroke="#cfdad2" strokeWidth="22" fill="none" />
        <path d="M72 40C98 84 108 124 96 192" stroke="#dce8dd" strokeWidth="14" fill="none" />
        <path d="M214 20C208 68 222 126 258 198" stroke="#dfe7f0" strokeWidth="12" fill="none" />

        {routes
          .slice()
          .sort((a, b) => {
            if (a.id === selectedRoute.id) return 1;
            if (b.id === selectedRoute.id) return -1;
            return 0;
          })
          .map((route) => {
            const active = route.id === selectedRoute.id;
            return (
              <path
                key={route.id}
                d={route.path}
                stroke={route.color}
                strokeWidth={active ? '10' : '6'}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={active ? '1' : '0.52'}
              />
            );
          })}

        <circle cx="38" cy="178" r="10" fill="#18b46b" />
        <circle cx="278" cy="54" r="10" fill="#111827" />
        <circle cx="38" cy="178" r="18" fill="rgba(24,180,107,0.18)" />
        <circle cx="278" cy="54" r="18" fill="rgba(17,24,39,0.12)" />
        <text x="26" y="205" fill="#4b5563" fontSize="11" fontWeight="700">
          Start
        </text>
        <text x="210" y="34" fill="#111827" fontSize="10" fontWeight="700">
          Committee
        </text>
      </svg>

      {isRoutesTab ? (
        <div className="route-map-legend" role="radiogroup" aria-label="Select route to show on map">
          {routes.map((route) => {
            const active = route.id === selectedRoute.id;
            return (
              <button
                key={route.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`route-map-legend-item${active ? ' active' : ''}`}
                onClick={() => onSelectRoute?.(route.id)}
              >
                <i className="route-map-legend-swatch" style={{ background: route.color }} aria-hidden="true" />
                {route.tag}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className={`map-insights${isRoutesTab ? ' map-insights-routes' : ''}`}>
        {isRoutesTab ? (
          <>
            <div>
              <span>Heading to</span>
              <strong>{dest}</strong>
            </div>
            <div>
              <span>Toll stations</span>
              <strong>
                {selectedRoute.tollStations} {selectedRoute.tollStations === 1 ? 'station' : 'stations'}
              </strong>
            </div>
            <div>
              <span>Toll</span>
              <strong>
                {formatCurrency(selectedRoute.tollEach)} each · {formatCurrency(selectedRoute.toll)} total
              </strong>
            </div>
            <div>
              <span>ETA</span>
              <strong>{selectedRoute.eta} mins</strong>
            </div>
            <div>
              <span>{runningCostLabel ?? 'Running cost'}</span>
              <strong>{formatCurrency(selectedRoute.fuel)}</strong>
            </div>
          </>
        ) : (
          <>
            <div>
              <span>Current pick</span>
              <strong>{selectedRoute.tag}</strong>
            </div>
            <div>
              <span>Traffic</span>
              <strong>Heavy jam forecast</strong>
            </div>
            <div>
              <span>Depart by</span>
              <strong>08:10 AM</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
