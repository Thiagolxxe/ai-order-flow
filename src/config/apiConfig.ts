
// API configuration constants
export const SESSION_STORAGE_KEY = 'deliveryapp_session';

// API timeout in milliseconds
export const API_TIMEOUT = 15000; // 15 seconds

// Primary Render backend URL (or fallback to demo mode)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://deliverai.onrender.com';

// Configure all API endpoints
export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout', 
      refreshToken: '/api/auth/refresh-token',
      csrf: '/api/auth/csrf-token'
    },
    restaurants: {
      base: '/api/restaurants',
      featured: '/api/restaurants/featured',
      nearby: '/api/restaurants/nearby',
      getById: (id: string) => `/api/restaurants/${id}`
    },
    delivery: {
      register: '/api/delivery/register',
      profile: '/api/delivery/profile'
    },
    users: {
      profile: '/api/users/profile',
      updateProfile: '/api/users/profile',
      roles: '/api/users/roles'
    },
    notifications: {
      base: '/api/notifications',
      unread: '/api/notifications/unread',
      markAsRead: (id: string) => `/api/notifications/${id}`
    },
    addresses: {
      base: '/api/addresses'
    },
    orders: {
      create: '/api/orders',
      getByUser: '/api/orders/user',
      getById: (id: string) => `/api/orders/${id}`,
      updateStatus: (id: string) => `/api/orders/${id}/status`
    },
    videos: {
      base: '/api/videos',
      getById: (id: string) => `/api/videos/${id}`,
      upload: '/api/videos/upload',
      byRestaurant: (restaurantId: string) => `/api/videos/restaurant/${restaurantId}`,
      trending: '/api/videos/trending',
      recommended: '/api/videos/recommended',
      like: (id: string) => `/api/videos/${id}/like`,
      unlike: (id: string) => `/api/videos/${id}/unlike`,
      comment: (id: string) => `/api/videos/${id}/comments`,
      share: (id: string) => `/api/videos/${id}/share`
    },
    // New connection check endpoint
    system: {
      healthCheck: '/api/check-connection',
      status: '/api/status'
    }
  }
};
