import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from 'lucide-react';
import DeliveryMap from '@/components/tracking/DeliveryMap';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getIdFromParams } from '@/utils/id-helpers';

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

      if (!validId) {
        console.error("Invalid UUID format for restaurant ID:", id);
        setError("Restaurante não encontrado.");
        setIsLoading(false);
        return;
      }

      try {
        // Simulate fetching data from an API
        setTimeout(() => {
          const mockRestaurant: RestaurantDetailsProps = {
            id: validId,
            name: 'Pizzaria Bella Napoli',
            address: 'Av. Brigadeiro Faria Lima, 1337',
            cuisine: 'Italiana',
            rating: 4.5,
            imageUrl: '/mock-restaurant-image.png',
            deliveryPosition: {
              lat: -23.5643,
              lng: -46.6527
            }
          };

          setRestaurant(mockRestaurant);
          setIsLoading(false);
        }, 1000);
      } catch (e: any) {
        setError(e.message || 'Erro ao carregar os detalhes do restaurante.');
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  if (!restaurant) {
    return <div>Restaurante não encontrado.</div>;
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
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="rounded-md w-full object-cover h-64"
          />
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>{restaurant.rating}</span>
          </div>
          <p>{restaurant.address}</p>

          <Separator />

          <h3 className="text-xl font-semibold">Acompanhe a entrega</h3>
          <DeliveryMap
            restaurantPosition={{ lat: -23.5505, lng: -46.6333 }}
            deliveryPosition={restaurant.deliveryPosition}
            userPosition={{ lat: -23.5639, lng: -46.6563 }}
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
