
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Set center position component to workaround TypeScript issues
const SetMapView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

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
  const centerPosition: [number, number] = [
    (restaurantPosition.lat + userPosition.lat) / 2,
    (restaurantPosition.lng + userPosition.lng) / 2
  ];
  
  // Create ref for map container
  const mapRef = useRef<L.Map | null>(null);

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
    
    // Return cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="relative h-64 w-full rounded-md overflow-hidden">
      <MapContainer 
        id="map"
        style={{ height: '100%', width: '100%' }} 
        className="z-10"
        zoom={13}
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <SetMapView center={centerPosition} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker 
          position={[restaurantPosition.lat, restaurantPosition.lng]} 
          icon={restaurantIcon as unknown as L.Icon<L.IconOptions>}
        >
          <Popup>
            <b>{restaurantName}</b><br />Restaurante
          </Popup>
        </Marker>
        
        <Marker 
          position={[deliveryPosition.lat, deliveryPosition.lng]} 
          icon={deliveryIcon as unknown as L.Icon<L.IconOptions>}
        >
          <Popup>
            Entregador{vehicleType ? ` (${vehicleType})` : ''}
          </Popup>
        </Marker>
        
        <Marker 
          position={[userPosition.lat, userPosition.lng]} 
          icon={userIcon as unknown as L.Icon<L.IconOptions>}
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
