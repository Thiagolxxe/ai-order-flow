
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, ArrowRightIcon, ClockIcon, ShoppingBag, Inbox as InboxIcon, Star, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

// Status dos pedidos
const orderStatuses = {
  'confirmed': { label: 'Confirmado', color: 'bg-blue-500 text-white' },
  'preparing': { label: 'Preparando', color: 'bg-amber-500 text-white' },
  'out-for-delivery': { label: 'A Caminho', color: 'bg-orange-500 text-white' },
  'delivered': { label: 'Entregue', color: 'bg-green-500 text-white' },
  'canceled': { label: 'Cancelado', color: 'bg-red-500 text-white' }
};

// Pedidos de exemplo
const mockOrders = [
  {
    id: '12345',
    date: '15/05/2023',
    time: '19:45',
    restaurant: {
      name: 'Urban Burger Bistro',
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=128&auto=format&fit=crop'
    },
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'Batata Frita', quantity: 1 }
    ],
    total: 68.73,
    status: 'delivered' as keyof typeof orderStatuses,
    rated: false
  },
  {
    id: '12346',
    date: '12/05/2023',
    time: '20:30',
    restaurant: {
      name: 'Sake Sushi House',
      image: 'https://images.unsplash.com/photo-1584010065233-8eb0c867f467?q=80&w=128&auto=format&fit=crop'
    },
    items: [
      { name: 'Combo Sushi', quantity: 1 },
      { name: 'Temaki', quantity: 2 }
    ],
    total: 89.90,
    status: 'delivered' as keyof typeof orderStatuses,
    rated: true,
    rating: 4
  },
  {
    id: '12347',
    date: '16/05/2023',
    time: '12:15',
    restaurant: {
      name: 'Taco Fiesta',
      image: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa6c?q=80&w=128&auto=format&fit=crop'
    },
    items: [
      { name: 'Combo Tacos', quantity: 1 },
      { name: 'Nachos', quantity: 1 }
    ],
    total: 45.50,
    status: 'preparing' as keyof typeof orderStatuses,
    rated: false
  }
];

const OrderHistory = () => {
  const [activeTab, setActiveTab] = useState('all');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [orders, setOrders] = useState(mockOrders);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [comment, setComment] = useState('');
  
  // Filtrar pedidos com base na aba ativa
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['confirmed', 'preparing', 'out-for-delivery'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'delivered';
    if (activeTab === 'canceled') return order.status === 'canceled';
    return true;
  });

  const openRatingSheet = (orderId: string) => {
    setCurrentOrderId(orderId);
    setRatingValue(0);
    setComment('');
    setIsRatingOpen(true);
  };

  const handleRateOrder = () => {
    if (ratingValue === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação de estrelas.",
        variant: "destructive",
      });
      return;
    }

    // Atualizar o pedido com a avaliação
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === currentOrderId 
          ? { ...order, rated: true, rating: ratingValue, comment } 
          : order
      )
    );

    // Exibir confirmação
    toast({
      title: "Avaliação enviada",
      description: "Obrigado por avaliar seu pedido!",
    });

    // Fechar o sheet
    setIsRatingOpen(false);
  };

  // Componente de estrelas para avaliação
  const RatingStars = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
    return (
      <div className="flex items-center justify-center space-x-1 py-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-all ${
              star <= value ? 'text-amber-400 scale-110' : 'text-gray-300'
            }`}
          >
            <Star className="w-8 h-8 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="container px-4 py-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Meus Pedidos</h1>
      </div>
      
      {/* Abas de filtro */}
      <Tabs 
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
          <TabsTrigger value="canceled">Cancelados</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <Link to={`/pedido/${order.id}`}>
                    <CardContent className="p-0">
                      {/* Status do pedido */}
                      <div className={`w-full h-2 ${orderStatuses[order.status].color}`} />
                      
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Imagem do restaurante */}
                          <div className="w-16 h-16 rounded-full overflow-hidden hidden sm:block">
                            <img 
                              src={order.restaurant.image}
                              alt={order.restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Detalhes do pedido */}
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <h3 className="font-medium">{order.restaurant.name}</h3>
                              <Badge className={orderStatuses[order.status].color}>
                                {orderStatuses[order.status].label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center text-sm text-foreground/70 mb-3">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>{order.date} às {order.time}</span>
                            </div>
                            
                            {/* Itens do pedido */}
                            <div className="text-sm">
                              {order.items.map((item, index) => (
                                <span key={index} className="mr-1">
                                  {item.quantity}x {item.name}
                                  {index < order.items.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Preço e ação */}
                          <div className="text-right">
                            <div className="font-semibold">
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </div>
                            <div className="mt-4 flex items-center justify-end text-primary text-sm font-medium">
                              Ver Detalhes <ArrowRightIcon className="h-4 w-4 ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>

                  {/* Botão de avaliação ou exibição da avaliação dada */}
                  {order.status === 'delivered' && (
                    <div className="px-4 pb-4 -mt-2">
                      {!order.rated ? (
                        <Button 
                          variant="outline" 
                          className="w-full text-amber-500 border-amber-200 hover:bg-amber-50" 
                          onClick={(e) => {
                            e.preventDefault();
                            openRatingSheet(order.id);
                          }}
                        >
                          <Star className="mr-2 h-4 w-4 fill-amber-500" />
                          Avaliar Pedido
                        </Button>
                      ) : (
                        <div className="flex justify-between items-center py-2 px-3 bg-amber-50 rounded-md">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < (order.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="ml-2 text-sm text-foreground/70">Avaliado</span>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            Obrigado!
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary/50 rounded-lg">
              <InboxIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-medium mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mb-8">Você ainda não tem pedidos nesta categoria</p>
              <Button asChild>
                <Link to="/">Explorar Restaurantes</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sheet para avaliação do pedido */}
      <Sheet open={isRatingOpen} onOpenChange={setIsRatingOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-center">Avaliar seu pedido</SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="text-center">
              <p className="text-foreground/80 mb-2">Como você avalia o seu pedido?</p>
              <RatingStars value={ratingValue} onChange={setRatingValue} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-medium">
                Comentário (opcional)
              </label>
              <Textarea
                id="comment"
                placeholder="Conte-nos mais sobre sua experiência..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>
            
            <div className="pt-4 space-y-2">
              <Button className="w-full" onClick={handleRateOrder}>
                Enviar Avaliação
              </Button>
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrderHistory;
