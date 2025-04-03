
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
      register: 'auth/register'
    },
    restaurants: {
      base: 'restaurants',
      getById: (id: string) => `restaurants/${id}`
    },
    delivery: {
      register: 'delivery/register',
      profile: 'delivery/profile'
    },
    notifications: {
      base: 'notifications',
      markAsRead: (id: string) => `notifications/${id}`
    },
    addresses: {
      getByUser: (userId: string) => `addresses/${userId}`
    },
    connection: 'check-connection'
  }
};
