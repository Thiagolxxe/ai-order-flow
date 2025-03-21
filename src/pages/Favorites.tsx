
import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartIcon, FilterIcon } from 'lucide-react';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: string;
  nome: string;
  logo_url: string;
  tipo_cozinha: string;
  faixa_preco: number;
  tempo_entrega_estimado: number;
  avaliacao?: number;
}

const Favorites = () => {
  const { isAuthenticated, favorites, toggleFavorite } = useUser();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavoriteRestaurants();
  }, [favorites]);

  const fetchFavoriteRestaurants = async () => {
    if (!favorites || favorites.length === 0) {
      setRestaurants([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .in('id', favorites);

      if (error) {
        throw error;
      }

      if (data) {
        setRestaurants(data as Restaurant[]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar restaurantes favoritos:', error);
      toast.error('Não foi possível carregar seus favoritos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <Card className="max-w-md mx-auto text-center p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <HeartIcon className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Faça login para ver seus favoritos</h2>
            <p className="text-muted-foreground">
              Você precisa estar logado para salvar e visualizar seus restaurantes favoritos.
            </p>
            <Button asChild>
              <a href="/login">Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          <p className="text-muted-foreground mt-1">
            Restaurantes que você salvou como favoritos
          </p>
        </div>
        <Button variant="outline" className="self-start">
          <FilterIcon className="mr-2 h-4 w-4" />
          Filtrar
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse h-64">
              <CardContent className="p-0 h-full bg-muted"></CardContent>
            </Card>
          ))}
        </div>
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.nome}
              image={restaurant.logo_url || '/placeholder.svg'}
              rating={restaurant.avaliacao || 4.5}
              cuisine={restaurant.tipo_cozinha}
              deliveryTime={restaurant.tempo_entrega_estimado || 30}
              priceLevel={restaurant.faixa_preco}
              isFavorite={true}
              onFavoriteToggle={() => handleToggleFavorite(restaurant.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent className="flex flex-col items-center">
            <HeartIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Você ainda não adicionou nenhum restaurante aos seus favoritos.
              Explore nossos restaurantes e adicione-os aos favoritos!
            </p>
            <Button asChild>
              <a href="/restaurantes">Explorar Restaurantes</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Favorites;
