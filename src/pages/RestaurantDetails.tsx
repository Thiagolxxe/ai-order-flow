
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from 'lucide-react';
import DeliveryMap from '@/components/tracking/DeliveryMap';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getIdFromParams, TEST_UUIDS } from '@/utils/id-helpers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RestaurantDetailsProps {
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

// Default fallback images if the restaurant images don't load
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000';

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<RestaurantDetailsProps | null>(null);
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

        // Changed from .single() to check if data exists and has at least one item
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
              const mockRestaurant: RestaurantDetailsProps = {
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
              const mockRestaurant: RestaurantDetailsProps = {
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
              const mockRestaurant: RestaurantDetailsProps = {
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

  if (isLoading) {
    return <div className="container py-8">Carregando...</div>;
  }

  if (error) {
    return <div className="container py-8">Erro: {error}</div>;
  }

  if (!restaurant) {
    return <div className="container py-8">Restaurante não encontrado.</div>;
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{restaurant.name}</CardTitle>
          <CardDescription>
            <Badge variant="secondary">{restaurant.cuisine}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="w-full h-64 relative rounded-md overflow-hidden">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image failed to load:", restaurant.imageUrl);
                // If the image fails to load, replace with default image
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = DEFAULT_IMAGE;
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
          <p>{restaurant.address}</p>

          <Separator />

          <h3 className="text-xl font-semibold">Acompanhe a entrega</h3>
          <DeliveryMap
            restaurantPosition={{ lat: -23.5505, lng: -46.6333 }}
            deliveryPosition={restaurant.deliveryPosition}
            userPosition={{ lat: -23.5639, lng: -46.6563 }}
            restaurantName={restaurant.name}
          />

          <Separator />

          <Button asChild>
            <Link to={`/restaurante/${restaurant.id}/menu`}>Ver Cardápio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantDetails;
