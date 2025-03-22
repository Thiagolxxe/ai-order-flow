
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, type MapContainerProps } from 'react-leaflet';
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

  // Fix: Use LatLngExpression for position props
  const center: L.LatLngExpression = [deliveryPosition.lat, deliveryPosition.lng];
  const restaurantPos: L.LatLngExpression = [restaurantPosition.lat, restaurantPosition.lng];
  const deliveryPos: L.LatLngExpression = [deliveryPosition.lat, deliveryPosition.lng];
  const userPos: L.LatLngExpression = [userPosition.lat, userPosition.lng];

  return (
    <div className="rounded-xl overflow-hidden shadow-md">
      <MapContainer 
        center={center}
        zoom={14} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker 
          position={restaurantPos}
          icon={restaurantIcon as L.Icon}
        >
          <Popup>
            <b>{restaurantName}</b><br/>
            Restaurante
          </Popup>
        </Marker>
        
        <Marker 
          position={deliveryPos}
          icon={deliveryIcon as L.Icon}
        >
          <Popup>
            <b>Entregador</b><br/>
            {vehicleType || 'Moto'}
          </Popup>
        </Marker>
        
        <Marker 
          position={userPos}
          icon={userIcon as L.Icon}
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
