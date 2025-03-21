
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import RestaurantCard from '@/components/restaurants/RestaurantCard';

// Dados fictícios de restaurantes favoritos (em um app real, viria de uma API)
const mockRestaurants = [
  {
    id: '1',
    name: 'Urban Burger Bistro',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Hambúrgueres',
    rating: 4.7,
    deliveryTime: '30-45 min',
    minOrder: 'R$ 25,00'
  },
  {
    id: '2',
    name: 'Sushi Express',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Japonesa',
    rating: 4.5,
    deliveryTime: '40-55 min',
    minOrder: 'R$ 40,00'
  },
  {
    id: '3',
    name: 'Pizza Delícia',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Pizzaria',
    rating: 4.3,
    deliveryTime: '35-50 min',
    minOrder: 'R$ 30,00'
  }
];

const Favorites = () => {
  const { favorites, toggleFavorite } = useUser();
  
  // Em um app real, buscaríamos dados completos dos restaurantes a partir dos IDs em 'favorites'
  const favoriteRestaurants = mockRestaurants;

  const handleRemoveFavorite = (id: string, name: string) => {
    toggleFavorite({ id, name, image: '' });
    toast.success(`${name} removido dos favoritos`);
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Seus Restaurantes Favoritos</h1>
      
      {favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteRestaurants.map(restaurant => (
            <div key={restaurant.id} className="relative">
              <RestaurantCard
                id={restaurant.id}
                name={restaurant.name}
                image={restaurant.image}
                cuisine={restaurant.cuisine}
                rating={restaurant.rating}
                deliveryTime={restaurant.deliveryTime}
                minOrder={restaurant.minOrder}
              />
              
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-3 right-3 rounded-full w-8 h-8 p-0"
                onClick={() => handleRemoveFavorite(restaurant.id, restaurant.name)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mx-auto mb-4 text-muted-foreground"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Sem favoritos</h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não adicionou nenhum restaurante aos favoritos
            </p>
            <Button asChild>
              <Link to="/restaurantes">Explorar Restaurantes</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Favorites;
