
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Define our custom type for order tracking data
interface TrackingData {
  id: string;
  status: string;
  entregador: {
    nome: string;
    telefone: string;
    latitude_atual: number;
    longitude_atual: number;
  } | null;
  restaurante: {
    nome: string;
    endereco: string;
    latitude: number;
    longitude: number;
  } | null;
  cliente_endereco: {
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    latitude: number;
    longitude: number;
  } | null;
}

const defaultLocation = [-23.5505, -46.6333]; // São Paulo

const LiveTrackingMap = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('map');
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // This is a mock query as we don't have the real database structure yet
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            id, 
            status,
            entregador:entregador_id (
              nome, 
              telefone,
              latitude_atual,
              longitude_atual
            ),
            restaurante:restaurante_id (
              nome, 
              endereco,
              latitude,
              longitude
            ),
            cliente_endereco:endereco_entrega_id (
              endereco,
              bairro,
              cidade,
              estado,
              latitude,
              longitude
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          toast({
            title: 'Erro ao carregar dados do pedido',
            description: error.message,
            variant: 'destructive',
          });
          // For development, create a mock order
          setOrder({
            id: id || '1',
            status: 'em_transito',
            entregador: {
              nome: 'João Entregador',
              telefone: '(11) 98765-4321',
              latitude_atual: -23.551,
              longitude_atual: -46.634,
            },
            restaurante: {
              nome: 'Restaurante Teste',
              endereco: 'Av. Paulista, 1578',
              latitude: -23.561,
              longitude: -46.655,
            },
            cliente_endereco: {
              endereco: 'Rua Augusta, 1200',
              bairro: 'Consolação',
              cidade: 'São Paulo',
              estado: 'SP',
              latitude: -23.553,
              longitude: -46.644,
            },
          });
        } else {
          setOrder(data as unknown as TrackingData);
        }
      } catch (err) {
        console.error('Failed to fetch order:', err);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os dados do pedido',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    // Set up interval to refresh location data (every 20 seconds)
    const intervalId = setInterval(() => {
      if (!loading) {
        fetchOrderData();
      }
    }, 20000);

    return () => clearInterval(intervalId);
  }, [id, toast, loading]);

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Get map markers locations
  const driverLocation = order?.entregador
    ? [order.entregador.latitude_atual, order.entregador.longitude_atual]
    : defaultLocation;
  
  const restaurantLocation = order?.restaurante
    ? [order.restaurante.latitude, order.restaurante.longitude]
    : defaultLocation;
  
  const customerLocation = order?.cliente_endereco
    ? [order.cliente_endereco.latitude, order.cliente_endereco.longitude]
    : defaultLocation;

  // Create custom icons
  const deliveryIcon = new L.Icon({
    iconUrl: '/delivery-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const restaurantIcon = new L.Icon({
    iconUrl: '/restaurant-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const customerIcon = new L.Icon({
    iconUrl: '/customer-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Rastreamento em Tempo Real</h1>
      <p className="text-muted-foreground mb-6">
        Acompanhe seu pedido #{id} em tempo real
      </p>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="details">Detalhes do Pedido</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="p-0">
          <div className="bg-muted rounded-lg overflow-hidden shadow-lg">
            <MapContainer
              center={[-23.550, -46.633]} // São Paulo coordinates
              zoom={13}
              style={{ height: '600px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Driver Marker */}
              {order?.entregador && (
                <Marker 
                  position={[order.entregador.latitude_atual, order.entregador.longitude_atual] as [number, number]}
                  // icon={deliveryIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{order.entregador.nome}</p>
                      <p>{order.entregador.telefone}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Restaurant Marker */}
              {order?.restaurante && (
                <Marker 
                  position={[order.restaurante.latitude, order.restaurante.longitude] as [number, number]}
                  // icon={restaurantIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{order.restaurante.nome}</p>
                      <p>{order.restaurante.endereco}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Customer Marker */}
              {order?.cliente_endereco && (
                <Marker 
                  position={[order.cliente_endereco.latitude, order.cliente_endereco.longitude] as [number, number]}
                  // icon={customerIcon}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">Seu endereço</p>
                      <p>{order.cliente_endereco.endereco}</p>
                      <p>{order.cliente_endereco.bairro}, {order.cliente_endereco.cidade} - {order.cliente_endereco.estado}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Entregador</CardTitle>
              </CardHeader>
              <CardContent>
                {order?.entregador ? (
                  <div>
                    <p className="font-medium text-lg">{order.entregador.nome}</p>
                    <p className="text-muted-foreground">{order.entregador.telefone}</p>
                    <Button size="sm" className="mt-4">
                      Entrar em contato
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Entregador ainda não atribuído</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Restaurante</CardTitle>
              </CardHeader>
              <CardContent>
                {order?.restaurante ? (
                  <div>
                    <p className="font-medium text-lg">{order.restaurante.nome}</p>
                    <p className="text-muted-foreground">{order.restaurante.endereco}</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link to={`/restaurante/${id}`}>Ver restaurante</Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Informações do restaurante não disponíveis</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Status do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ['confirmado', 'em_preparo', 'pronto', 'em_transito', 'entregue'].includes(order?.status || '') 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      1
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Pedido Confirmado</p>
                      <p className="text-sm text-muted-foreground">Seu pedido foi recebido pelo restaurante</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ['em_preparo', 'pronto', 'em_transito', 'entregue'].includes(order?.status || '') 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      2
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Em Preparo</p>
                      <p className="text-sm text-muted-foreground">O restaurante está preparando seu pedido</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ['pronto', 'em_transito', 'entregue'].includes(order?.status || '') 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      3
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Pronto para Entrega</p>
                      <p className="text-sm text-muted-foreground">Seu pedido está pronto e aguardando o entregador</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ['em_transito', 'entregue'].includes(order?.status || '') 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      4
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Em Trânsito</p>
                      <p className="text-sm text-muted-foreground">Seu pedido está a caminho</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      ['entregue'].includes(order?.status || '') 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      5
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Entregue</p>
                      <p className="text-sm text-muted-foreground">Seu pedido foi entregue com sucesso</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button asChild variant="outline">
          <Link to="/pedidos">Voltar para meus pedidos</Link>
        </Button>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
