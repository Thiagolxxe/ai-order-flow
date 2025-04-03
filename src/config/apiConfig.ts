
/**
 * Configuração central da API
 */

// URL base da API
export const API_BASE_URL = 'http://localhost:5000/api';

// Timeout padrão para requisições (em ms)
export const API_TIMEOUT = 30000;

// Nome da chave no localStorage para a sessão
export const SESSION_STORAGE_KEY = 'deliveryapp_session';

// Objeto de configuração exportado
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: API_TIMEOUT,
  endpoints: {
    auth: {
      login: 'auth/login',
      register: 'auth/register',
      refreshToken: 'auth/refresh-token',
      logout: 'auth/logout'
    },
    restaurants: {
      base: 'restaurants',
      getById: (id: string) => `restaurants/${id}`,
      search: 'restaurants/search',
      featured: 'restaurants/featured',
      nearby: 'restaurants/nearby',
      menu: (id: string) => `restaurants/${id}/menu`
    },
    users: {
      profile: 'users/profile',
      updateProfile: 'users/profile',
      addresses: 'users/addresses'
    },
    delivery: {
      register: 'delivery/register',
      profile: 'delivery/profile',
      active: 'delivery/active'
    },
    orders: {
      create: 'orders',
      getByUser: 'orders/user',
      getById: (id: string) => `orders/${id}`,
      updateStatus: (id: string) => `orders/${id}/status`
    },
    notifications: {
      base: 'notifications',
      markAsRead: (id: string) => `notifications/${id}/read`,
      unread: 'notifications/unread'
    },
    addresses: {
      base: 'addresses',
      getByUser: 'addresses/user'
    },
    connection: 'check-connection'
  }
};
