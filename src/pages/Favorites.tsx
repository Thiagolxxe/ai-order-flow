import React from 'react';
import { useEffect, useState } from 'react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, HeartOff } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import { handleMongoArrayResponse } from '@/utils/mongodb-helpers';

interface FavoriteRestaurant {
  id: string;
  restaurantId: string;
  userId: string;
  restaurantName: string;
  restaurantLogo: string;
}

const Favorites = () => {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { db } = await connectToDatabase();
        
        // Fetch user's favorite restaurants from MongoDB
        const favorites = await db.collection('favoritos').find({ usuario_id: user.id }).toArray();
        const formattedFavorites = handleMongoArrayResponse<FavoriteRestaurant>(favorites);
        
        setFavoriteRestaurants(formattedFavorites);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Meus Restaurantes Favoritos</h1>
      
      {favoriteRestaurants.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <HeartOff className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">Nenhum restaurante favorito encontrado</h3>
              <p className="text-muted-foreground">Adicione restaurantes aos seus favoritos para vê-los aqui.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRestaurants.map(fav => (
            <RestaurantCard
              key={fav.id}
              id={fav.restaurantId}
              name={fav.restaurantName}
              image={fav.restaurantLogo}
              cuisine="Variada" // You might want to fetch the cuisine from the restaurant data
              rating={4.2 + Math.random() * 0.8}
              deliveryTime="30-40 min"
              minOrder="R$25,00"
              featured={Math.random() > 0.5}
              isNew={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
