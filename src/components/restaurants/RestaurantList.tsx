
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from './RestaurantCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { apiConfig } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
}

interface RestaurantListProps {
  title?: string;
  featured?: boolean;
  limit?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  title = 'Restaurantes',
  featured = false,
  limit = 4,
  showViewAll = true,
  viewAllLink = '/restaurants'
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        
        // Use MongoDB connection
        const { db } = await connectToDatabase();
        
        // Use the appropriate endpoint based on whether we want featured restaurants
        const endpoint = featured 
          ? apiConfig.endpoints.restaurants.featured
          : apiConfig.endpoints.restaurants.base;
          
        // Fetch restaurants using MongoDB or API
        const { data, error } = await httpClient.get(endpoint, {
          params: { limit }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && Array.isArray(data)) {
          setRestaurants(data.map((restaurant: any) => ({
            id: restaurant._id || restaurant.id,
            name: restaurant.nome || restaurant.name,
            image: restaurant.imagem || restaurant.image || '/placeholder.svg',
            cuisine: restaurant.tipo_cozinha || restaurant.cuisine || 'Variada',
            rating: restaurant.avaliacao || restaurant.rating || 0,
            deliveryTime: restaurant.tempo_entrega || restaurant.deliveryTime || '30-45 min',
            minimumOrder: restaurant.pedido_minimo || restaurant.minimumOrder || 0,
            deliveryFee: restaurant.taxa_entrega || restaurant.deliveryFee || 0
          })));
        } else {
          setRestaurants([]);
        }
      } catch (err: any) {
        console.error('Error fetching restaurants:', err);
        setError(err.message || 'Erro ao carregar restaurantes');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [featured, limit]);

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          <p>Erro ao carregar restaurantes: {error}</p>
        </div>
      </div>
    );
  }

  // Render empty state
  if (restaurants.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">Nenhum restaurante encontrado</p>
        </div>
      </div>
    );
  }

  // Render restaurants
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {showViewAll && restaurants.length >= limit && (
          <Link to={viewAllLink}>
            <Button variant="ghost">Ver Todos</Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {restaurants.map(restaurant => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
