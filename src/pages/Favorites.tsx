
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import RestaurantCard from '@/components/restaurants/RestaurantCard';
import { Loader } from 'lucide-react';

const Favorites = () => {
  const { user } = useUser();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call to get favorites
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        // In a real app, this would be a call to your API
        // const response = await apiService.getFavorites(user.id);
        
        // For now, we'll use mock data
        setTimeout(() => {
          setFavorites([
            {
              id: '1',
              name: 'Burguer King',
              image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80',
              rating: 4.5,
              deliveryTime: '30-45',
              minimumOrder: 15,
              deliveryFee: 5,
              cuisineType: 'Fast Food',
              address: 'Av. Paulista, 1000'
            },
            {
              id: '2',
              name: 'Sushi Yassu',
              image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80',
              rating: 4.8,
              deliveryTime: '45-60',
              minimumOrder: 50,
              deliveryFee: 8,
              cuisineType: 'Japonesa',
              address: 'Rua Augusta, 500'
            },
            {
              id: '3',
              name: 'Pizza Hut',
              image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1800&q=80',
              rating: 4.2,
              deliveryTime: '30-40',
              minimumOrder: 30,
              deliveryFee: 6,
              cuisineType: 'Italiana',
              address: 'Av. Rebouças, 1200'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Seus Favoritos</h1>
        <div className="flex justify-center items-center h-60">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Seus Favoritos</h1>
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Faça login para ver seus favoritos</h2>
          <p className="text-muted-foreground mb-4">
            Você precisa estar logado para salvar e visualizar seus restaurantes favoritos.
          </p>
          <a href="/login" className="text-primary underline">
            Fazer login
          </a>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Seus Favoritos</h1>
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h2>
          <p className="text-muted-foreground mb-4">
            Você ainda não adicionou nenhum restaurante aos seus favoritos.
          </p>
          <a href="/restaurants" className="text-primary underline">
            Explorar restaurantes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Seus Favoritos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((restaurant: any) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
