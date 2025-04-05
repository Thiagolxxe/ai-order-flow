
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: [number, number];
  zoom: number;
  children: React.ReactNode;
}

const Map: React.FC<MapProps> = ({ center, zoom, children }) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Ensure Leaflet is ready by waiting for the document to be fully loaded
    if (document.readyState === 'complete') {
      setMapReady(true);
    } else {
      window.addEventListener('load', () => setMapReady(true));
      return () => window.removeEventListener('load', () => setMapReady(true));
    }
  }, []);

  if (!mapReady) {
    return <div className="h-full w-full bg-gray-100 animate-pulse rounded-md"></div>;
  }

  return (
    <MapContainer 
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-md shadow-md z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
};

export default Map;
