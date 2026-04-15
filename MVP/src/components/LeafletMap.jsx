import React, { useMemo, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { POI_COLORS } from '../data/mapData';

function createPinIcon(color, glyph) {
  return L.divIcon({
    className: 'leaflet-div-icon-reset',
    html: `
      <div class="drivemate-map-pin" style="--pin-color: ${color}">
        <span>${glyph}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -24],
  });
}

function getPoiGlyph(type) {
  switch (type) {
    case 'toll_station':
      return 'T';
    case 'gas_station':
      return 'F';
    case 'charging_station':
      return 'C';
    case 'coffee_shop':
      return 'K';
    case 'parking_lot':
      return 'P';
    case 'car_wash':
      return 'W';
    case 'destination':
      return 'D';
    default:
      return '•';
  }
}

function getPoiLabel(type) {
  switch (type) {
    case 'toll_station':
      return 'Toll';
    case 'gas_station':
      return 'Gas';
    case 'charging_station':
      return 'Charging';
    case 'coffee_shop':
      return 'Coffee';
    case 'parking_lot':
      return 'Parking';
    case 'car_wash':
      return 'Car wash';
    case 'destination':
      return 'Destination';
    default:
      return 'POI';
  }
}

function FitBounds({ routes, origin, destination }) {
  const bounds = useMemo(() => {
    const points = [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
      ...routes.flatMap((route) => route.points),
    ];
    if (points.length === 0) {
      return L.latLngBounds([[10.81, 106.74], [10.81, 106.74]]);
    }
    return L.latLngBounds(points);
  }, [destination.lat, destination.lng, origin.lat, origin.lng, routes]);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [28, 28] }}
      className="leaflet-map-container"
      scrollWheelZoom={false}
      zoomControl={false}
    >
      <RefreshMapLayout />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routes
        .slice()
        .sort((a, b) => {
          if (a.id === b.id) return 0;
          if (a.selected) return 1;
          if (b.selected) return -1;
          return 0;
        })
        .map((route) => (
          <Polyline
            key={route.id}
            positions={route.points}
            pathOptions={{
              color: route.color,
              weight: route.selected ? 6 : 3,
              opacity: route.selected ? 0.95 : 0.45,
            }}
            eventHandlers={{ click: () => route.onSelect(route.id) }}
          >
            <Tooltip sticky>{route.label}</Tooltip>
          </Polyline>
        ))}

      <Marker position={[origin.lat, origin.lng]} icon={createPinIcon('#18b46b', 'S')}>
        <Popup>
          <strong>{origin.label}</strong>
          <div>Trip origin</div>
        </Popup>
      </Marker>

      <Marker position={[destination.lat, destination.lng]} icon={createPinIcon('#2563eb', 'D')}>
        <Popup>
          <strong>{destination.label}</strong>
          <div>Simulation destination</div>
        </Popup>
      </Marker>

      {routes.map((route) => {
        const lastPoint = route.points.at(-1);
        if (!lastPoint) return null;
        return (
          <Marker
            key={`${route.id}-arrival`}
            position={lastPoint}
            icon={createPinIcon(route.color, route.shortLabel)}
          >
            <Popup>
              <strong>{route.label}</strong>
              <div>{route.shortLabel} arrival path</div>
            </Popup>
          </Marker>
        );
      })}

      {(routes[0]?.pois ?? []).map((poi) => (
        <Marker
          key={poi.poi_id}
          position={[poi.lat, poi.lng]}
          icon={createPinIcon(POI_COLORS[poi.type] ?? POI_COLORS.default, getPoiGlyph(poi.type))}
        >
          <Popup>
            <strong>{poi.name}</strong>
            <div>{getPoiLabel(poi.type)}</div>
            <div>{poi.address}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function RefreshMapLayout() {
  useMap();

  return null;
}

export function LeafletMap({
  routes,
  selectedRouteId,
  pois,
  origin,
  destination,
  onSelectRoute,
}) {
  const shellRef = useRef(null);
  const safeRoutes = useMemo(() => (Array.isArray(routes) ? routes : []), [routes]);
  const routesWithState = useMemo(
    () =>
      safeRoutes.map((route) => ({
        ...route,
        selected: route.id === selectedRouteId,
        onSelect: onSelectRoute,
        pois,
      })),
    [onSelectRoute, pois, safeRoutes, selectedRouteId],
  );
  const mapPointsCount = routesWithState.reduce((sum, route) => sum + (route.points?.length ?? 0), 0);

  if (!routesWithState.length || mapPointsCount === 0) {
    return (
      <div className="leaflet-map-shell leaflet-map-shell-empty" ref={shellRef}>
        <div className="leaflet-map-empty-state">
          <strong>Map is getting ready</strong>
          <span>Route paths are loading. Try another destination or route.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="leaflet-map-shell" ref={shellRef}>
      <div className="leaflet-map-topbar">
        <span className="map-live">Live map</span>
        <span className="map-area">
          {origin.label} to {destination.label}
        </span>
      </div>
      <FitBounds
        routes={routesWithState}
        origin={origin}
        destination={destination}
      />
      <div className="leaflet-map-legend">
        {[
          ['Toll', POI_COLORS.toll_station],
          ['Gas', POI_COLORS.gas_station],
          ['Charging', POI_COLORS.charging_station],
          ['Parking', POI_COLORS.parking_lot],
          ['Wash', POI_COLORS.car_wash],
        ].map(([label, color]) => (
          <span key={label} className="leaflet-map-legend-item">
            <i style={{ background: color }} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
