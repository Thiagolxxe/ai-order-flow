
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StarIcon, ClockIcon, SearchIcon, MapPinIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// Dados fictícios do restaurante (em um app real, viria de uma API)
const mockRestaurant = {
  id: '1',
  name: 'Urban Burger Bistro',
  coverImage: 'https://images.unsplash.com/photo-1561758033-7e924f619b47?q=80&w=1920&auto=format&fit=crop',
  logo: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=128&auto=format&fit=crop',
  cuisine: 'Hambúrgueres, Americana',
  rating: 4.8,
  reviewCount: 243,
  deliveryTime: '20-35 min',
  minOrder: 'R$25',
  deliveryFee: 'R$6,90',
  distance: '1,2 km',
  address: 'Av. Paulista, 1578 - Bela Vista, São Paulo',
  openingHours: 'Aberto agora: 11:00 - 23:00',
  featured: true,
  priceRange: '$$',
  description: 'Os melhores hambúrgueres artesanais da cidade, com ingredientes frescos e selecionados. Temos opções veganas e sem glúten.',
  photos: [
    'https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop'
  ]
};

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState(mockRestaurant);
  const isMobile = useIsMobile();
  
  // Simular busca de dados
  useEffect(() => {
    // Em um app real, faria uma requisição à API
    console.log(`Buscando detalhes do restaurante: ${id}`);
    // setRestaurant(data);
  }, [id]);

  return (
    <div className="pb-20">
      {/* Imagem de capa do restaurante */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-muted">
        <img 
          src={restaurant.coverImage}
          alt={`${restaurant.name} - Capa`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Logo do restaurante */}
        <div className="absolute bottom-4 left-4 flex items-end">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
            <img 
              src={restaurant.logo}
              alt={`${restaurant.name} - Logo`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="ml-3 text-white">
            <h1 className="text-xl sm:text-2xl font-semibold">{restaurant.name}</h1>
            <p className="text-sm text-white/90">{restaurant.cuisine}</p>
          </div>
        </div>
      </div>
      
      {/* Informações e estatísticas */}
      <div className="container px-4 py-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          {/* Avaliação e estatísticas */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
              <StarIcon className="w-4 h-4 mr-1" />
              <span className="font-medium">{restaurant.rating}</span>
              <span className="text-foreground/60 text-sm ml-1">({restaurant.reviewCount})</span>
            </div>
            
            <div className="flex items-center text-sm text-foreground/70">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            
            <div className="flex items-center text-sm text-foreground/70">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{restaurant.distance}</span>
            </div>
          </div>
          
          {/* Botão de pedido */}
          <Button asChild>
            <Link to={`/restaurante/${id}/menu`}>
              Ver Cardápio
            </Link>
          </Button>
        </div>
        
        {/* Tags e informações adicionais */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{restaurant.priceRange}</Badge>
          <Badge variant="secondary">Taxa: {restaurant.deliveryFee}</Badge>
          <Badge variant="secondary">Pedido mínimo: {restaurant.minOrder}</Badge>
          <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30">
            {restaurant.openingHours}
          </Badge>
        </div>
        
        {/* Descrição */}
        <p className="text-foreground/80 mb-6">{restaurant.description}</p>
        
        {/* Abas: Sobre, Fotos, Avaliações */}
        <Tabs defaultValue="about">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="about" className="flex-1">Sobre</TabsTrigger>
            <TabsTrigger value="photos" className="flex-1">Fotos</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Avaliações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Endereço</h3>
                    <p className="text-foreground/70">{restaurant.address}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Horário de Funcionamento</h3>
                    <div className="space-y-1 text-foreground/70">
                      <p>Segunda a Sexta: 11:00 - 23:00</p>
                      <p>Sábado e Domingo: 11:00 - 00:00</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Métodos de Pagamento</h3>
                    <div className="space-y-1 text-foreground/70">
                      <p>Cartão de Crédito</p>
                      <p>Cartão de Débito</p>
                      <p>Vale-Refeição</p>
                      <p>Pix</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {restaurant.photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`${restaurant.name} - Foto ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Avaliações dos Clientes</h3>
                    <div className="flex items-center">
                      <StarIcon className="w-5 h-5 text-amber-500 mr-1" />
                      <span className="font-semibold">{restaurant.rating}</span>
                      <span className="text-foreground/60 text-sm ml-1">({restaurant.reviewCount})</span>
                    </div>
                  </div>
                  
                  {/* Exemplos de avaliações */}
                  <div className="space-y-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="border-b border-border pb-4 last:border-none">
                        <div className="flex justify-between mb-2">
                          <div className="font-medium">Cliente Anônimo</div>
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-amber-500 mr-1" />
                            <span>{Math.floor(Math.random() * 2) + 4}</span>
                          </div>
                        </div>
                        <p className="text-foreground/70 text-sm">
                          A comida estava deliciosa e chegou quente. Entrega dentro do prazo. Recomendo!
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RestaurantDetails;
