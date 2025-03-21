import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockIcon, LocationIcon, SuccessIcon } from "@/assets/icons";

// Fix: Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const LiveTrackingMap = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState(null);
  const [position, setPosition] = useState([51.505, -0.09]); // Default coordinates
  const [deliveryStatus, setDeliveryStatus] = useState('preparing'); // Default status

  useEffect(() => {
    // Mock order data loading
    const mockOrder = {
      id: id,
      restaurantName: 'Burger Joint',
      deliveryAddress: '123 Main St, Anytown',
      estimatedTime: '30-40 minutes',
      status: deliveryStatus,
      deliveryGuy: {
        name: 'John Doe',
        phone: '123-456-7890',
        location: position,
      },
    };
    setOrder(mockOrder);

    // Mock location updates
    const intervalId = setInterval(() => {
      // Simulate delivery guy moving
      setPosition([
        position[0] + (Math.random() - 0.5) * 0.01,
        position[1] + (Math.random() - 0.5) * 0.01,
      ]);
    }, 5000);

    // Mock status update
    setTimeout(() => {
      setDeliveryStatus('en route');
      mockOrder.status = 'en route';
    }, 10000);

    setTimeout(() => {
      setDeliveryStatus('arriving');
      mockOrder.status = 'arriving';
    }, 20000);

    setTimeout(() => {
      setDeliveryStatus('delivered');
      mockOrder.status = 'delivered';
    }, 30000);

    return () => clearInterval(intervalId);
  }, [id, position, deliveryStatus]);

  // Function to get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'preparing': return 'Preparando';
      case 'en route': return 'A caminho';
      case 'arriving': return 'Chegando';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparing': return <ClockIcon className="h-4 w-4 mr-2" />;
      case 'en route': return <LocationIcon className="h-4 w-4 mr-2" />;
      case 'arriving': return <LocationIcon className="h-4 w-4 mr-2" />;
      case 'delivered': return <SuccessIcon className="h-4 w-4 mr-2" />;
      default: return null;
    }
  };

  if (!order) {
    return <div>Carregando mapa...</div>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Rastreamento do Pedido #{order.id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card className="h-[500px]">
          <CardHeader>
            <CardTitle>Localização do Entregador</CardTitle>
            <CardDescription>Acompanhe em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={position}>
                <Popup>
                  {order.deliveryGuy.name} está aqui!
                </Popup>
              </Marker>
            </MapContainer>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Pedido</CardTitle>
            <CardDescription>Informações sobre sua entrega</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <span className="font-semibold w-32">Restaurante:</span>
              <span>{order.restaurantName}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-32">Endereço:</span>
              <span>{order.deliveryAddress}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-32">Tempo Estimado:</span>
              <span>{order.estimatedTime}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-32">Entregador:</span>
              <span>{order.deliveryGuy.name} ({order.deliveryGuy.phone})</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold w-32">Status:</span>
              <span className="inline-flex items-center font-medium">
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
