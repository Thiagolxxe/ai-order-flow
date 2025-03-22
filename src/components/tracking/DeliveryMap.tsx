
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MarkerPosition {
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  restaurantPosition: MarkerPosition;
  deliveryPosition: MarkerPosition;
  userPosition: MarkerPosition;
  restaurantName?: string;
  vehicleType?: string | null;
  deliveryAddress?: string;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantPosition,
  deliveryPosition,
  userPosition,
  restaurantName = 'Restaurante',
  vehicleType = 'Moto',
  deliveryAddress = 'Endereço de entrega'
}) => {
  // Create custom icons for the map
  const restaurantIcon = new L.Icon({
    iconUrl: '/restaurant-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  
  const deliveryIcon = new L.Icon({
    iconUrl: '/delivery-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  
  const userIcon = new L.Icon({
    iconUrl: '/user-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="rounded-xl overflow-hidden shadow-md">
      <MapContainer 
        zoom={14} 
        style={{ height: '500px', width: '100%' }}
        // @ts-ignore - Needed because of type mismatch with react-leaflet
        center={[deliveryPosition.lat, deliveryPosition.lng]}
      >
        <TileLayer
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker 
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          position={[restaurantPosition.lat, restaurantPosition.lng]}
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          icon={restaurantIcon}
        >
          <Popup>
            <b>{restaurantName}</b><br/>
            Restaurante
          </Popup>
        </Marker>
        
        <Marker 
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          position={[deliveryPosition.lat, deliveryPosition.lng]}
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          icon={deliveryIcon}
        >
          <Popup>
            <b>Entregador</b><br/>
            {vehicleType || 'Moto'}
          </Popup>
        </Marker>
        
        <Marker 
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          position={[userPosition.lat, userPosition.lng]}
          // @ts-ignore - Needed because of type mismatch with react-leaflet
          icon={userIcon}
        >
          <Popup>
            <b>Seu endereço</b><br/>
            {deliveryAddress}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
