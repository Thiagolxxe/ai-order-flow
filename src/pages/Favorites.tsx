import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeartIcon, StarIcon, Location } from "@/assets/icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';

// Tipos
interface Restaurant {
  id: string;
  nome: string;
  banner_url?: string;
  logo_url?: string;
  tipo_cozinha?: string;
  rating?: number | string;
  reviews?: number;
  faixa_preco?: number;
  tempo_entrega_estimado?: number;
  cidade: string;
  estado: string;
}

// Componente de lista de restaurantes
const RestaurantList = ({ restaurants }: { restaurants: Restaurant[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link to={`/restaurante/${restaurant.id}`}>
            <div className="h-48 overflow-hidden">
              <img 
                src={restaurant.banner_url || '/placeholder.svg'} 
                alt={restaurant.nome} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
          </Link>
          
          <CardContent className="pt-4">
            <div className="flex justify-between items-start mb-2">
              <Link to={`/restaurante/${restaurant.id}`} className="hover:underline">
                <h3 className="font-bold text-lg line-clamp-1">{restaurant.nome}</h3>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </Button>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <div className="flex items-center mr-4">
                {renderStars(restaurant.rating || '4.2')}
                <span className="ml-1">({restaurant.reviews || '45'})</span>
              </div>
              <div className="flex items-center">
                <span>
                  {restaurant.tipo_cozinha || 'Brasileira'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Location className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{restaurant.cidade}, {restaurant.estado}</span>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 pb-4 px-6">
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-1">
                {'$$$'.slice(0, restaurant.faixa_preco || 2).split('').map((_, idx) => (
                  <span key={idx} className="text-green-600">$</span>
                ))}
                {'$$$'.slice(restaurant.faixa_preco || 2).split('').map((_, idx) => (
                  <span key={idx + 10} className="text-gray-300">$</span>
                ))}
              </div>
              <div className="text-sm">
                {restaurant.tempo_entrega_estimado 
                  ? `${restaurant.tempo_entrega_estimado} min` 
                  : '30-45 min'}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Update this function to fix the type issue
const renderStars = (rating: string | number) => {
  // Convert rating to number if it's a string
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`h-4 w-4 ${
            star <= numericRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// Página principal
const Favorites = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();
  
  useEffect(() => {
    const fetchFavoriteRestaurants = async () => {
      setIsLoading(true);
      try {
        // Aqui seria a chamada real para a API
        // Por enquanto, vamos usar dados de exemplo
        const mockRestaurants: Restaurant[] = [
          {
            id: '1',
            nome: 'Restaurante Sabor Brasileiro',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Brasileira',
            rating: 4.7,
            reviews: 128,
            faixa_preco: 2,
            tempo_entrega_estimado: 35,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '2',
            nome: 'Cantina Italiana',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Italiana',
            rating: 4.5,
            reviews: 96,
            faixa_preco: 3,
            tempo_entrega_estimado: 45,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '3',
            nome: 'Sushi Express',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Japonesa',
            rating: 4.8,
            reviews: 215,
            faixa_preco: 3,
            tempo_entrega_estimado: 40,
            cidade: 'São Paulo',
            estado: 'SP'
          },
        ];
        
        // Simulando um atraso de rede
        setTimeout(() => {
          setRestaurants(mockRestaurants);
          setIsLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
        toast({
          title: "Erro ao carregar restaurantes",
          description: "Não foi possível carregar a lista de restaurantes. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchFavoriteRestaurants();
  }, [toast, user]);
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Restaurantes Favoritos</h1>
      
      {/* Resultados */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando restaurantes...</p>
        </div>
      ) : restaurants.length > 0 ? (
        <>
          <p className="text-muted-foreground mb-6">
            {restaurants.length} restaurantes encontrados
          </p>
          <RestaurantList restaurants={restaurants} />
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-xl font-semibold mb-2">Nenhum restaurante favorito encontrado</p>
          <p className="text-muted-foreground mb-6">
            Adicione restaurantes aos seus favoritos para vê-los aqui!
          </p>
          <Button asChild>
            <Link to="/restaurantes">
              Explorar Restaurantes
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
