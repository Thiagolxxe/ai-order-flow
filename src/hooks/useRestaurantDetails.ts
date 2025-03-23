
import { useState, useEffect } from 'react';
import { getIdFromParams } from '@/utils/id-helpers';
import { getRestaurantData } from '@/services/restaurantService';
import { DEFAULT_RESTAURANT_IMAGE } from '@/utils/restaurant-helpers';

export interface RestaurantDetailsData {
  id: string;
  name: string;
  address: string;
  cuisine: string;
  rating: number;
  imageUrl: string;
  deliveryPosition: {
    lat: number;
    lng: number;
  };
}

export const useRestaurantDetails = (id: string | undefined) => {
  const [restaurant, setRestaurant] = useState<RestaurantDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching restaurant with ID: ${id}`);
      
      try {
        // For numeric IDs, use a default mapping or fetch by numeric ID logic
        if (id && /^\d+$/.test(id)) {
          // Convert numeric ID to a test UUID for demo purposes
          const numericId = parseInt(id);
          if (numericId > 0 && numericId <= 5) {
            // Map numeric IDs 1-5 to test UUIDs
            const testUUID = `00000000-0000-0000-0000-00000000000${numericId}`;
            console.log(`Converting numeric ID ${id} to test UUID: ${testUUID}`);
            const restaurantData = await getRestaurantData(testUUID);
            setRestaurant(restaurantData);
            return;
          }
        }
        
        // If not numeric or not in range 1-5, proceed with UUID validation
        const validId = getIdFromParams(id);
        console.log(`Using UUID: ${validId} (original param: ${id})`);

        if (!validId) {
          console.error("Invalid UUID format for restaurant ID:", id);
          setError("Restaurante não encontrado.");
          setIsLoading(false);
          return;
        }

        // Get restaurant data from service
        const restaurantData = await getRestaurantData(validId);
        setRestaurant(restaurantData);
      } catch (e: any) {
        console.error("Error in restaurant details:", e);
        setError(e.message || 'Erro ao carregar os detalhes do restaurante.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  return { restaurant, isLoading, error, DEFAULT_IMAGE: DEFAULT_RESTAURANT_IMAGE };
};
