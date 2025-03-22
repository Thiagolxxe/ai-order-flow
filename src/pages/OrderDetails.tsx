
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftIcon, PhoneIcon, ClipboardListIcon, HomeIcon } from 'lucide-react';
import DeliveryMap from '@/components/tracking/DeliveryMap';
import OrderTracker from '@/components/orders/OrderTracker';
import { useIsMobile } from '@/hooks/use-mobile';

// Dados de exemplo do pedido
const mockOrderDetails = {
  id: '12345',
  date: '15/05/2023',
  time: '19:45',
  status: 'preparing' as const,
  restaurant: {
    name: 'Urban Burger Bistro',
    image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=128&auto=format&fit=crop',
    phone: '(11) 99999-9999'
  },
  items: [
    {
      id: '1',
      name: 'Classic Burger',
      price: 26.90,
      quantity: 2
    },
    {
      id: '5',
      name: 'Batata Frita',
      price: 14.90,
      quantity: 1
    }
  ],
  address: {
    label: 'Casa',
    street: 'Av. Paulista, 1578',
    complement: 'Apto 202',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipcode: '01310-200'
  },
  payment: {
    method: 'Cartão de crédito',
    card: '**** **** **** 1234'
  },
  subtotal: 68.70,
  discount: 6.87,
  deliveryFee: 6.90,
  total: 68.73,
  // Mock positions for the map
  positions: {
    restaurant: { lat: -23.5505, lng: -46.6333 },
    delivery: { lat: -23.5540, lng: -46.6359 },
    user: { lat: -23.5570, lng: -46.6380 }
  }
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState(mockOrderDetails);
  const isMobile = useIsMobile();
  
  // Simular busca de dados
  useEffect(() => {
    console.log(`Buscando detalhes do pedido: ${id}`);
    // Em um app real, faria uma requisição à API para obter os detalhes do pedido
  }, [id]);

  return (
    <div className="container px-4 py-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/pedidos">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Pedido #{order.id}</h1>
          <p className="text-foreground/70">{order.date} às {order.time}</p>
        </div>
      </div>
      
      {/* Rastreador de pedido */}
      <OrderTracker 
        orderId={order.id} 
        initialStatus={order.status}
        className="mb-6"
      />

      {/* Mapa de entrega */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="font-medium mb-4 text-lg">Acompanhe sua entrega</h2>
          <DeliveryMap 
            restaurantPosition={order.positions.restaurant}
            deliveryPosition={order.positions.delivery}
            userPosition={order.positions.user}
            restaurantName={order.restaurant.name}
            vehicleType="Moto"
            deliveryAddress={`${order.address.street}, ${order.address.neighborhood}`}
          />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Restaurante */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img 
                    src={order.restaurant.image}
                    alt={order.restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <h2 className="font-medium text-lg">{order.restaurant.name}</h2>
                  <p className="text-foreground/70">Entregando seu pedido</p>
                </div>
                
                <Button variant="outline" size="sm">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Contatar
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Itens do pedido */}
          <Card>
            <CardContent className="p-6">
              <h2 className="font-medium mb-4 text-lg">Itens do Pedido</h2>
              
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                    </div>
                    <div className="font-medium">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              {/* Detalhes do preço */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Subtotal</span>
                  <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between text-green-600">
                  <span>Desconto (10%)</span>
                  <span>- R$ {order.discount.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-foreground/70">Taxa de Entrega</span>
                  <span>R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar com detalhes */}
        <div className="space-y-6">
          {/* Endereço de entrega */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <HomeIcon className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Endereço de Entrega</h3>
                  <p className="text-sm text-foreground/70">{order.address.street}, {order.address.complement}</p>
                  <p className="text-sm text-foreground/70">{order.address.neighborhood}, {order.address.city} - {order.address.state}</p>
                  <p className="text-sm text-foreground/70">CEP: {order.address.zipcode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Método de pagamento */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <ClipboardListIcon className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Método de Pagamento</h3>
                  <p className="text-sm text-foreground/70">{order.payment.method}</p>
                  {order.payment.card && (
                    <p className="text-sm text-foreground/70">{order.payment.card}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Ações */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              Solicitar Ajuda
            </Button>
            <Button variant="outline" className="w-full">
              Reordenar Itens
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
