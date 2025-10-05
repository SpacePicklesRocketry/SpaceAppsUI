import React from 'react';

export default function MapWidget({ location }) {
  return (
    <div className="widget map-widget">
      <h3>Map</h3>
      <div className="map-placeholder">Lat: {location?.lat || 'N/A'} | Lon: {location?.lon || 'N/A'}</div>
    </div>
  );
}
