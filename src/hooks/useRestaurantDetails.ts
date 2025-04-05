
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantData } from '@/services/restaurantService';

// Define a default image constant
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop';

export function useRestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!id) {
        setError('ID do restaurante não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getRestaurantData(id);
        
        if (!data) {
          setError('Restaurante não encontrado');
          return;
        }
        
        setRestaurant(data);
      } catch (error: any) {
        console.error('Error fetching restaurant:', error);
        setError(error.message || 'Erro ao carregar dados do restaurante');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  // Added DEFAULT_IMAGE property to the returned object
  return { 
    restaurant, 
    isLoading, 
    error,
    DEFAULT_IMAGE 
  };
}
