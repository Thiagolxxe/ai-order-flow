
import React from 'react';
import RestaurantList from '@/components/restaurants/RestaurantList';

const RestaurantsExplore = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Restaurantes</h1>
      <RestaurantList />
    </div>
  );
};

export default RestaurantsExplore;
