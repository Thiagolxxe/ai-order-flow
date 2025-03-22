
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define the marker icons to fix the missing default icons issue
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
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  [25, 41]
);

const deliveryIcon = createLeafletIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  [25, 41]
);

const userIcon = createLeafletIcon(
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  [25, 41]
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
  restaurantName?: string;
  vehicleType?: string;
  deliveryAddress?: string;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantPosition,
  deliveryPosition,
  userPosition,
  restaurantName = 'Restaurante',
  vehicleType,
  deliveryAddress
}) => {
  // Calculate the center position based on restaurant and user positions
  const centerPosition = [
    (restaurantPosition.lat + userPosition.lat) / 2,
    (restaurantPosition.lng + userPosition.lng) / 2
  ];

  // Fix the TypeScript errors by setting proper initial attributes
  useEffect(() => {
    // Make sure the map container is ready for Leaflet
    const container = L.DomUtil.get('map');
    if (container) {
      // @ts-ignore - Necessary to avoid TypeScript error with _leaflet_id property
      if (container._leaflet_id) {
        // @ts-ignore
        container._leaflet_id = null;
      }
    }
  }, []);

  return (
    <div className="relative h-64 w-full rounded-md overflow-hidden">
      <MapContainer 
        id="map"
        style={{ height: '100%', width: '100%' }} 
        className="z-10"
        center={[centerPosition[0], centerPosition[1]] as [number, number]}
        zoom={13}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker 
          position={[restaurantPosition.lat, restaurantPosition.lng]} 
          icon={restaurantIcon}
        >
          <Popup>
            <b>{restaurantName}</b><br />Restaurante
          </Popup>
        </Marker>
        
        <Marker 
          position={[deliveryPosition.lat, deliveryPosition.lng]} 
          icon={deliveryIcon}
        >
          <Popup>
            Entregador{vehicleType ? ` (${vehicleType})` : ''}
          </Popup>
        </Marker>
        
        <Marker 
          position={[userPosition.lat, userPosition.lng]} 
          icon={userIcon}
        >
          <Popup>
            {deliveryAddress ? deliveryAddress : 'Seu endereço de entrega'}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
