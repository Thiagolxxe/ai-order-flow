
import React from 'react';
import { Marker, Popup, MarkerProps } from 'react-leaflet';
import L from 'leaflet';
import { Utensils } from 'lucide-react';

// Create a custom restaurant icon
const restaurantIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div class="bg-red-500 p-2 rounded-full text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M3 11v9"/><path d="M17 2v9"/><path d="M17 14h.01"/><path d="M17 17h.01"/><path d="M17 20h.01"/><path d="M9 22h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface RestaurantMarkerProps extends Omit<MarkerProps, 'position' | 'icon'> {
  position: [number, number];
  restaurantName?: string;
  address?: string;
  cuisine?: string;
  name?: string;
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ 
  position, 
  restaurantName, 
  address, 
  cuisine,
  name,
  ...props
}) => {
  const displayName = name || restaurantName || 'Restaurante';
  
  return (
    <Marker 
      position={position} 
      // Cast icon to any to avoid TypeScript errors
      {...{ icon: restaurantIcon } as any}
      {...props}
    >
      <Popup>
        <div className="text-sm">
          <h3 className="font-medium">{displayName}</h3>
          {address && <p className="text-gray-600">{address}</p>}
          {cuisine && <p className="text-gray-600 italic">{cuisine}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
