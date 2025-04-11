import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RestaurantCard from './RestaurantCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { normalizeMongoData } from '@/utils/mongodb-helpers';

// Definindo a interface do RestaurantCard para garantir compatibilidade
interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string; // Alterado de imageUrl para image (obrigatório)
  deliveryTime?: string;
  deliveryFee?: number;
  distance?: string;
  minOrder: number; // Adicionando propriedade obrigatória
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageUrl?: string;
  deliveryTime?: string;
  deliveryFee?: number;
  distance?: string;
  minOrder?: number;
}

interface RestaurantListProps {
  title?: string;
  filter?: string;
  maxItems?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}

export default function RestaurantList({
  title = 'Restaurantes',
  filter,
  maxItems,
  showSearch = false,
  showFilters = false,
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        const { db } = await connectToDatabase();
        
        let query = {};
        if (filter) {
          query = { tipo_cozinha: filter };
        }
        
        const result = await db.collection('restaurants').find(query);
        const restaurantsData = await result.toArray();
        
        // Transform MongoDB data to the format expected by the component
        const transformedData = restaurantsData.map((rest: any) => ({
          id: rest._id?.toString() || rest.id,
          name: rest.nome || rest.name,
          cuisine: rest.tipo_cozinha || rest.cuisine,
          rating: rest.rating || Math.floor(Math.random() * 5) + 1,
          imageUrl: rest.banner_url || rest.imageUrl || 'https://source.unsplash.com/random/300x200/?restaurant',
          deliveryTime: rest.deliveryTime || `${Math.floor(Math.random() * 30) + 15}-${Math.floor(Math.random() * 20) + 30} min`,
          deliveryFee: rest.deliveryFee || Math.floor(Math.random() * 8) + 3,
          distance: rest.distance || `${(Math.random() * 5).toFixed(1)} km`,
          minOrder: rest.minOrder || Math.floor(Math.random() * 10) + 10,
        }));
        
        setRestaurants(normalizeMongoData<Restaurant[]>(transformedData));
        setFilteredRestaurants(normalizeMongoData<Restaurant[]>(transformedData));
      } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
        toast.error('Erro ao carregar restaurantes');
        
        // Fallback data for development
        const fallbackData = Array.from({ length: 8 }, (_, i) => ({
          id: `rest-${i}`,
          name: `Restaurante ${i + 1}`,
          cuisine: ['Italiana', 'Japonesa', 'Brasileira', 'Fast Food'][i % 4],
          rating: Math.floor(Math.random() * 5) + 1,
          imageUrl: `https://source.unsplash.com/random/300x200/?restaurant,${i}`,
          deliveryTime: `${Math.floor(Math.random() * 30) + 15}-${Math.floor(Math.random() * 20) + 30} min`,
          deliveryFee: Math.floor(Math.random() * 8) + 3,
          distance: `${(Math.random() * 5).toFixed(1)} km`,
          minOrder: Math.floor(Math.random() * 10) + 10,
        }));
        
        setRestaurants(fallbackData);
        setFilteredRestaurants(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [filter]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchTerm, restaurants]);
  
  // Limit the number of restaurants shown
  const restaurantsToShow = maxItems ? filteredRestaurants.slice(0, maxItems) : filteredRestaurants;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {!maxItems && (
          <Link to="/restaurants">
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </Link>
        )}
      </div>
      
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar restaurantes ou culinária..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
          <Button size="sm" variant="outline">Mais próximos</Button>
          <Button size="sm" variant="outline">Melhor avaliação</Button>
          <Button size="sm" variant="outline">Menor preço</Button>
          <Button size="sm" variant="outline">Mais rápidos</Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-[150px] w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurantsToShow.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {restaurantsToShow.map((restaurant) => (
            <RestaurantCard 
              key={restaurant.id} 
              id={restaurant.id}
              name={restaurant.name}
              cuisine={restaurant.cuisine}
              rating={restaurant.rating}
              image={restaurant.imageUrl || 'https://source.unsplash.com/random/300x200/?restaurant'}
              deliveryTime={restaurant.deliveryTime}
              deliveryFee={restaurant.deliveryFee}
              distance={restaurant.distance}
              minOrder={restaurant.minOrder || 10}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Store className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum restaurante encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar seus filtros ou pesquisa para encontrar o que você está procurando.
          </p>
        </div>
      )}
    </div>
  );
}

export default RestaurantList;
