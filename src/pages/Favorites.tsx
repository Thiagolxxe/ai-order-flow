import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { supabaseClient } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Package, X } from 'lucide-react';
import { RestaurantCard } from '@/components/restaurants/RestaurantCard';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        toast.error('Você precisa estar logado para ver seus favoritos.');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const { db } = await connectToDatabase();
        const favoritesResult = await db.collection('favorites').find({ userId: user.id }).toArray();
        
        if (favoritesResult.data) {
          setFavorites(favoritesResult.data);
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Falha ao carregar favoritos.');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavorites();
  }, [user]);
  
  const handleRemoveFavorite = async (restaurantId: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para remover um favorito.');
      return;
    }
    
    try {
      const { db } = await connectToDatabase();
      await db.collection('favorites').deleteOne({ userId: user.id, restaurantId: restaurantId });
      
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav.restaurantId !== restaurantId));
      toast.success('Restaurante removido dos favoritos.');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Falha ao remover restaurante dos favoritos.');
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <p>Carregando seus favoritos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="p-6">
            <p>Você precisa estar logado para ver seus favoritos.</p>
            <Button asChild>
              <a href="/login">Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Seus Restaurantes Favoritos</h1>
      
      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center flex-col space-y-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Você ainda não adicionou nenhum restaurante aos seus favoritos.
              </p>
              <Button asChild>
                <a href="/restaurants">Explorar Restaurantes</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(favorite => (
            <RestaurantCard 
              key={favorite.restaurantId} 
              restaurant={favorite}
            >
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRemoveFavorite(favorite.restaurantId)}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </RestaurantCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
