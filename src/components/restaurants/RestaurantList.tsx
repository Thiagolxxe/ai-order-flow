
import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { normalizeMongoData } from '@/utils/mongodb-helpers';
import RestaurantListHeader from './RestaurantListHeader';
import RestaurantFilters from './RestaurantFilters';
import RestaurantListSkeleton from './RestaurantListSkeleton';
import RestaurantEmptyState from './RestaurantEmptyState';

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

const RestaurantList: React.FC<RestaurantListProps> = ({
  title = 'Restaurantes',
  filter,
  maxItems,
  showSearch = false,
  showFilters = false,
}) => {
  
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
      <RestaurantListHeader title={title} maxItems={maxItems} />
      
      <RestaurantFilters 
        showSearch={showSearch} 
        showFilters={showFilters} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
      />
      
      {isLoading ? (
        <RestaurantListSkeleton />
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
              minOrder={restaurant.minOrder ? restaurant.minOrder.toString() : '10'}
            />
          ))}
        </div>
      ) : (
        <RestaurantEmptyState />
      )}
    </div>
  );
};

export default RestaurantList;
