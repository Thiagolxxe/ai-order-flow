
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

import RestaurantHeader from '@/components/restaurants/RestaurantHeader';
import RestaurantImage from '@/components/restaurants/RestaurantImage';
import DeliveryTrackingSection from '@/components/restaurants/DeliveryTrackingSection';
import { useRestaurantDetails } from '@/hooks/useRestaurantDetails';

const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { restaurant, isLoading, error, DEFAULT_IMAGE } = useRestaurantDetails(id);

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
        <RestaurantHeader 
          name={restaurant.name} 
          cuisine={restaurant.cuisine} 
          rating={restaurant.rating} 
        />
        
        <CardContent className="grid gap-4">
          <RestaurantImage 
            imageUrl={restaurant.imageUrl} 
            name={restaurant.name} 
            defaultImage={DEFAULT_IMAGE} 
          />
          
          <p>{restaurant.address}</p>

          <DeliveryTrackingSection 
            restaurantName={restaurant.name} 
            deliveryPosition={restaurant.deliveryPosition} 
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
