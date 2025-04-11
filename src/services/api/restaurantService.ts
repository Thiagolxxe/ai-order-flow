
/**
 * Restaurant API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { ApiResult } from '@/services/api/types';
import { httpClient } from '@/utils/httpClient';

export const restaurantService = {
  getAll: async (params: any = {}) => {
    return baseApiService.get(
      apiConfig.endpoints.restaurants.base,
      params
    );
  },
  
  getById: async (id: string) => {
    return baseApiService.get(
      apiConfig.endpoints.restaurants.getById(id)
    );
  },
  
  create: async (restaurantData: any) => {
    try {
      const { data, error } = await httpClient.post(
        apiConfig.endpoints.restaurants.base, 
        restaurantData
      );
      
      if (error) {
        return { 
          success: false, 
          error
        };
      }
      
      return { 
        success: true,
        data 
      };
    } catch (error: any) {
      console.error('Create restaurant error:', error);
      return { 
        success: false, 
        error: { message: error.message || 'Erro ao criar restaurante' }
      };
    }
  },
  
  getFeatured: async () => {
    return baseApiService.get(
      apiConfig.endpoints.restaurants.featured
    );
  },
  
  getNearby: async (lat: number, lng: number) => {
    try {
      const { data, error } = await httpClient.get(
        `${apiConfig.endpoints.restaurants.nearby}?lat=${lat}&lng=${lng}`
      );
      
      if (error) {
        return { error };
      }
      
      return { data };
    } catch (error: any) {
      console.error('Get nearby restaurants error:', error);
      return { error: { message: 'Falha ao buscar restaurantes próximos' } };
    }
  }
};
