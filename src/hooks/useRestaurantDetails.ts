
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

      const validId = getIdFromParams(id);
      console.log(`Fetching restaurant with ID: ${validId} (original param: ${id})`);

      if (!validId) {
        console.error("Invalid UUID format for restaurant ID:", id);
        setError("Restaurante não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
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
