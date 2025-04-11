
/**
 * User API service
 */
import { apiConfig } from '@/config/apiConfig';
import { baseApiService } from '@/services/api/baseApiService';
import { ApiResult, UserProfile, Address } from '@/services/api/types';

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<ApiResult<UserProfile>> => {
    return baseApiService.get(
      apiConfig.endpoints.users.profile
    );
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (profileData: Partial<UserProfile>): Promise<ApiResult<UserProfile>> => {
    return baseApiService.post(
      apiConfig.endpoints.users.updateProfile,
      profileData
    );
  },
  
  /**
   * Get user addresses
   */
  getAddresses: async (): Promise<ApiResult<Address[]>> => {
    return baseApiService.get(
      apiConfig.endpoints.addresses.base
    );
  },
  
  /**
   * Add new address
   */
  addAddress: async (addressData: Omit<Address, 'id' | 'userId'>): Promise<ApiResult<Address>> => {
    return baseApiService.post(
      apiConfig.endpoints.addresses.base,
      addressData
    );
  },
  
  /**
   * Update address
   */
  updateAddress: async (addressId: string, addressData: Partial<Address>): Promise<ApiResult<Address>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.addresses.base}/${addressId}`,
      addressData
    );
  },
  
  /**
   * Delete address
   */
  deleteAddress: async (addressId: string): Promise<ApiResult<{ success: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.addresses.base}/delete/${addressId}`,
      {}
    );
  },
  
  /**
   * Set default address
   */
  setDefaultAddress: async (addressId: string): Promise<ApiResult<{ success: boolean }>> => {
    return baseApiService.post(
      `${apiConfig.endpoints.addresses.base}/set-default/${addressId}`,
      {}
    );
  },
  
  /**
   * Get user roles
   */
  getUserRoles: async (): Promise<ApiResult<{ roles: string[] }>> => {
    return baseApiService.get(
      apiConfig.endpoints.users.roles
    );
  }
};
