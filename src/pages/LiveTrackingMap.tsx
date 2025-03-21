
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LocationIcon, 
  DeliveryIcon, 
  RestaurantIcon,
  HomeIcon,
  ChatIcon,
  ClockIcon
} from '@/assets/icons';
import OrderTracker from '@/components/orders/OrderTracker';

const LiveTrackingMap = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState({
    id: id || '41293',
    status: 'preparing' as 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered',
    restaurant: {
      name: 'Urban Burger Bistro',
      address: 'Av. Paulista, 1000',
      phone: '(11) 91234-5678'
    },
    customer: {
      name: 'João Silva',
      address: 'Rua Augusta, 500, Apto 42',
      phone: '(11) 98765-4321'
    },
    delivery: {
      name: 'Carlos Oliveira',
      phone: '(11) 99876-5432',
      eta: '15 minutos',
      currentLocation: { lat: -23.562, lng: -46.655 }
    },
    items: [
      { name: 'Classic Burger', quantity: 1, price: 26.90 },
      { name: 'Batata Frita', quantity: 1, price: 14.90 },
      { name: 'Refrigerante', quantity: 1, price: 6.90 }
    ],
    total: 48.70,
    estimatedDelivery: '19:30'
  });

  // Esta função seria substituída por uma chamada real a uma API de mapas
  const renderMap = () => {
    return (
      <div className="relative bg-muted w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <p className="text-muted-foreground text-sm">
            Aqui seria renderizado um mapa de rastreamento em tempo real usando 
            uma biblioteca como Google Maps, Mapbox ou Leaflet.
          </p>
        </div>
        
        {/* Marcadores de localização simplificados para demonstração */}
        <div className="absolute left-1/4 top-1/3 w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <RestaurantIcon className="w-5 h-5" />
        </div>
        
        <div className="absolute left-1/2 top-1/2 w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <DeliveryIcon className="w-5 h-5" />
        </div>
        
        <div className="absolute right-1/4 bottom-1/3 w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <HomeIcon className="w-5 h-5" />
        </div>
      </div>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Rastreamento do Pedido #{id}</h1>
      
      {/* Mapa */}
      <div className="w-full">
        {renderMap()}
      </div>
      
      {/* Rastreador de status */}
      <OrderTracker orderId={id || '41293'} initialStatus={order.status} />
      
      {/* Cards de informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações do pedido */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Detalhes do Pedido</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <ClockIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora estimada de entrega</p>
                  <p className="font-medium">{order.estimatedDelivery}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <RestaurantIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Restaurante</p>
                  <p className="font-medium">{order.restaurant.name}</p>
                  <p className="text-sm">{order.restaurant.address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <HomeIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Endereço de entrega</p>
                  <p className="font-medium">{order.customer.address}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Itens</h3>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {item.price.toFixed(2).replace('.', ',')}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-semibold mt-3 pt-3 border-t">
                  <span>Total</span>
                  <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Informações do entregador */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Entregador</h2>
            
            {order.status === 'out-for-delivery' || order.status === 'preparing' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <DeliveryIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.delivery.name}</p>
                    <p className="text-sm text-muted-foreground">Entregador</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <ChatIcon className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Ligar para o Entregador
                  </Button>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-center">
                    O entregador chegará em aproximadamente {order.delivery.eta}
                  </p>
                </div>
              </div>
            ) : order.status === 'delivered' ? (
              <div className="text-center py-6">
                <SuccessIcon className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <h3 className="text-xl font-medium mb-2">Pedido Entregue!</h3>
                <p className="text-muted-foreground">
                  Seu pedido foi entregue com sucesso.
                </p>
                <Button className="mt-4">Avaliar Entrega</Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <DeliveryIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">Aguardando atribuição</h3>
                <p className="text-muted-foreground">
                  Assim que seu pedido estiver pronto, um entregador será designado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
