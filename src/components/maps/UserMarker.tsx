
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Home } from 'lucide-react';

// Create a custom user icon
const userIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div class="bg-green-500 p-2 rounded-full text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface UserMarkerProps {
  position: [number, number];
  name?: string;
  address: string;
}

const UserMarker: React.FC<UserMarkerProps> = ({ position, name = 'Seu endereço', address }) => {
  return (
    <Marker position={position} icon={userIcon as any}>
      <Popup>
        <div className="text-sm">
          <h3 className="font-medium">{name}</h3>
          <p className="text-gray-600">{address}</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default UserMarker;
