
import { RestaurantDetailsData } from '@/hooks/useRestaurantDetails';
import { TEST_UUIDS } from './id-helpers';

// Default fallback image if the restaurant images don't load
export const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000';

/**
 * Validates and formats an image URL, returning the default image if invalid
 */
export const validateImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    console.log("Image URL is invalid, using default:", imageUrl);
    return DEFAULT_RESTAURANT_IMAGE;
  }
  return imageUrl;
};

/**
 * Calculates average rating from an array of rating values
 */
export const calculateAverageRating = (ratings: { nota: number }[] | null): number => {
  if (!ratings || ratings.length === 0) {
    return 4.5; // Default rating if none found
  }
  return ratings.reduce((sum, item) => sum + item.nota, 0) / ratings.length;
};

/**
 * Mock restaurant data for development and testing
 */
export const getMockRestaurantData = (restaurantId: string): RestaurantDetailsData => {
  if (restaurantId === TEST_UUIDS.RESTAURANT_1) {
    return {
      id: restaurantId,
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
  } else if (restaurantId === TEST_UUIDS.RESTAURANT_2) {
    return {
      id: restaurantId,
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
  } 
  
  // Generic mock data for any other ID
  return {
    id: restaurantId,
    name: 'Restaurante ' + restaurantId.slice(0, 8),
    address: 'Av. Brigadeiro Faria Lima, 1337',
    cuisine: 'Variada',
    rating: 4.2,
    imageUrl: DEFAULT_RESTAURANT_IMAGE,
    deliveryPosition: {
      lat: -23.5643,
      lng: -46.6527
    }
  };
};
