
import { useState, useEffect } from 'react';
import { getIdFromParams, TEST_UUIDS } from '@/utils/id-helpers';
import { supabase } from '@/integrations/supabase/client';

// Default fallback image if the restaurant images don't load
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000';

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
        // Try to fetch from Supabase first
        const { data, error: queryError } = await supabase
          .from('restaurantes')
          .select(`
            id, 
            nome, 
            descricao, 
            endereco, 
            cidade,
            estado,
            tipo_cozinha,
            logo_url,
            banner_url,
            faixa_preco
          `)
          .eq('id', validId);

        if (queryError) {
          console.error("Error fetching restaurant:", queryError);
          throw new Error(queryError.message);
        }

        // Check if data exists and has at least one item
        if (data && data.length > 0) {
          console.log("Restaurant data from Supabase:", data[0]);
          
          // Get an average rating for the restaurant
          const { data: ratings, error: ratingsError } = await supabase
            .from('avaliacoes')
            .select('nota')
            .eq('restaurante_id', validId);
          
          let avgRating = 0;
          if (!ratingsError && ratings && ratings.length > 0) {
            avgRating = ratings.reduce((sum, item) => sum + item.nota, 0) / ratings.length;
          } else {
            // Default rating if none found
            avgRating = 4.5;
          }

          // Use banner_url if available, otherwise use logo_url or a default image
          let imageUrl = data[0].banner_url || data[0].logo_url || DEFAULT_IMAGE;
          
          // Validate image URL
          if (!imageUrl.startsWith('http')) {
            console.log("Image URL doesn't start with http, using default:", imageUrl);
            imageUrl = DEFAULT_IMAGE;
          }
          
          setRestaurant({
            id: data[0].id,
            name: data[0].nome,
            address: `${data[0].endereco}, ${data[0].cidade} - ${data[0].estado}`,
            cuisine: data[0].tipo_cozinha,
            rating: avgRating,
            imageUrl: imageUrl,
            deliveryPosition: {
              lat: -23.5643,
              lng: -46.6527
            }
          });
          setIsLoading(false);
        } else {
          // Fallback to mock data if not found in database
          console.log("Restaurant not found in database, using mock data");
          
          // Simulate fetching data from an API
          setTimeout(() => {
            // Check if it's one of our test restaurant IDs
            if (validId === TEST_UUIDS.RESTAURANT_1) {
              const mockRestaurant: RestaurantDetailsData = {
                id: validId,
                name: 'Pizzaria Bella Napoli',
                address: 'Rua Italia, 789, São Paulo - SP',
                cuisine: 'Italiana',
                rating: 4.5,
                imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000',
                deliveryPosition: {
                  lat: -23.5643,
                  lng: -46.6527
                }
              };
              setRestaurant(mockRestaurant);
            } else if (validId === TEST_UUIDS.RESTAURANT_2) {
              const mockRestaurant: RestaurantDetailsData = {
                id: validId,
                name: 'Sabor Oriental',
                address: 'Av. Liberdade, 1234, São Paulo - SP',
                cuisine: 'Japonesa',
                rating: 4.7,
                imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000',
                deliveryPosition: {
                  lat: -23.5643,
                  lng: -46.6527
                }
              };
              setRestaurant(mockRestaurant);
            } else {
              // Generic mock data for any other ID
              const mockRestaurant: RestaurantDetailsData = {
                id: validId,
                name: 'Restaurante ' + id,
                address: 'Av. Brigadeiro Faria Lima, 1337',
                cuisine: 'Variada',
                rating: 4.2,
                imageUrl: DEFAULT_IMAGE,
                deliveryPosition: {
                  lat: -23.5643,
                  lng: -46.6527
                }
              };
              setRestaurant(mockRestaurant);
            }
            setIsLoading(false);
          }, 500);
        }
      } catch (e: any) {
        console.error("Error in restaurant details:", e);
        setError(e.message || 'Erro ao carregar os detalhes do restaurante.');
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  return { restaurant, isLoading, error, DEFAULT_IMAGE };
};
