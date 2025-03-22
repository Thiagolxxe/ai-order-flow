
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HomeIcon, MapPin, UtensilsCrossed } from 'lucide-react';

// Define the marker icons to fix the missing default icons issue
// This is also part of the reason why images might not be displaying properly
const createLeafletIcon = (iconUrl: string, iconSize: [number, number] = [25, 41]) => {
  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1]],
    popupAnchor: [0, -iconSize[1]]
  });
};

// Using leaflet's marker-icon.png from CDN to avoid issues with static files
const defaultIcon = createLeafletIcon(
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
);

const restaurantIcon = createLeafletIcon(
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
);

const deliveryIcon = createLeafletIcon(
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
);

const userIcon = createLeafletIcon(
  'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
);

interface DeliveryMapProps {
  restaurantPosition: {
    lat: number;
    lng: number;
  };
  deliveryPosition: {
    lat: number;
    lng: number;
  };
  userPosition: {
    lat: number;
    lng: number;
  };
  restaurantName: string;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantPosition,
  deliveryPosition,
  userPosition,
  restaurantName
}) => {
  const center: [number, number] = [
    (restaurantPosition.lat + userPosition.lat) / 2,
    (restaurantPosition.lng + userPosition.lng) / 2
  ];

  return (
    <div className="relative h-64 w-full rounded-md overflow-hidden">
      <MapContainer 
        center={center as L.LatLngExpression} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        className="z-10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          // Use type assertion to fix the attribution type error
          {...{} as any}
        />
        
        <Marker 
          position={[restaurantPosition.lat, restaurantPosition.lng] as L.LatLngExpression} 
          icon={restaurantIcon}
          // Use type assertion to fix the icon type error
          {...{} as any}
        >
          <Popup>
            <b>{restaurantName}</b><br />Restaurante
          </Popup>
        </Marker>
        
        <Marker 
          position={[deliveryPosition.lat, deliveryPosition.lng] as L.LatLngExpression} 
          icon={deliveryIcon}
          // Use type assertion to fix the icon type error
          {...{} as any}
        >
          <Popup>
            Entregador
          </Popup>
        </Marker>
        
        <Marker 
          position={[userPosition.lat, userPosition.lng] as L.LatLngExpression} 
          icon={userIcon}
          // Use type assertion to fix the icon type error
          {...{} as any}
        >
          <Popup>
            Você está aqui
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
