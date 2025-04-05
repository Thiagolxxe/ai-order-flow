
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Create a custom restaurant icon
const restaurantIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div class="bg-primary p-2 rounded-full text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

interface RestaurantMarkerProps {
  position: [number, number];
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
    address: string;
  };
}

const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({ position, restaurant }) => {
  const navigate = useNavigate();
  
  const handleViewMenu = () => {
    navigate(`/restaurante/${restaurant.id}/menu`);
  };
  
  return (
    <Marker position={position} icon={restaurantIcon}>
      <Popup>
        <div className="text-sm w-48">
          <h3 className="font-medium text-base">{restaurant.name}</h3>
          <p className="text-muted-foreground">{restaurant.cuisine}</p>
          <p className="text-gray-600 mt-1 text-xs">{restaurant.address}</p>
          <Button 
            size="sm" 
            className="w-full mt-2"
            onClick={handleViewMenu}
          >
            Ver Cardápio
          </Button>
        </div>
      </Popup>
    </Marker>
  );
};

export default RestaurantMarker;
