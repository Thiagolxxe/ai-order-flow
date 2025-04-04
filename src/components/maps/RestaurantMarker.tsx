
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Store } from 'lucide-react';

// Create a custom restaurant icon
const restaurantIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div class="bg-red-500 p-2 rounded-full text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2v0"/><path d="M18 12v0a2 2 0 0 1-2-2v0"/><path d="M14 12v0a2 2 0 0 1-2-2v0"/><path d="M10 12v0a2 2 0 0 1-2-2v0"/><path d="M6 12v0a2 2 0 0 1-2-2v0"/><path d="M2 7v3a2 2 0 0 0 2 2v0"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface RestaurantMarkerProps {
  position: [number, number];
  name: string;
  address?: string;
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ position, name, address }) => {
  return (
    <Marker position={position} icon={restaurantIcon}>
      <Popup>
        <div className="text-sm">
          <h3 className="font-medium">{name}</h3>
          {address && <p className="text-gray-600">{address}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
