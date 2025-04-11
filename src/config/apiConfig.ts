
export const SESSION_STORAGE_KEY = 'deliveryapp_session';

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout', 
      refreshToken: '/api/auth/refresh-token'
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
      updateProfile: '/api/users/profile'
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
      getById: (id: string) => `/api/videos/${id}`
    }
  }
};
