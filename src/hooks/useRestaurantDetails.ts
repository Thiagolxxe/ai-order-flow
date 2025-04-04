
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantData } from '@/services/restaurantService';

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

  return { restaurant, isLoading, error };
}
