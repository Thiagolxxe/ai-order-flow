
/**
 * Centralized API service that exports all domain-specific services
 */
import { authService } from '@/services/api/authService';
import { restaurantService } from '@/services/api/restaurantService';
import { deliveryService } from '@/services/api/deliveryService';
import { userService } from '@/services/api/userService';
import { notificationService } from '@/services/api/notificationService';
import { addressService } from '@/services/api/addressService';
import { orderService } from '@/services/api/orderService';
import { videoService } from '@/services/api/videoService';

export const apiService = {
  auth: authService,
  restaurants: restaurantService,
  delivery: deliveryService,
  users: userService,
  notifications: notificationService,
  addresses: addressService,
  orders: orderService,
  videos: videoService
};
