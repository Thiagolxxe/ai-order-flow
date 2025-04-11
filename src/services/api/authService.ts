
/**
 * Auth API service - Unified authentication service
 */
import { apiConfig, SESSION_STORAGE_KEY } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';
import { AuthSignUpParams, AuthSignInParams, ApiResult } from '@/services/api/types';
import { UserSession, saveSession, removeSession, getSession } from '@/utils/authUtils';
import { toast } from 'sonner';

// Rate limiting para tentativas de login (10 minutos de espera após 5 tentativas falhas)
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_DURATION = 10 * 60 * 1000; // 10 minutos em ms
let failedAttempts = 0;
let rateLimitUntil = 0;

// Token refresh intervals
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos
let refreshTokenInterval: number | null = null;

/**
 * Reset rate limiting on successful login
 */
const resetRateLimiting = () => {
  failedAttempts = 0;
  rateLimitUntil = 0;
};

/**
 * Check if rate limited and increment failed attempts
 */
const checkRateLimit = (): { limited: boolean; waitTime: number } => {
  const now = Date.now();
  
  // Check if currently rate limited
  if (rateLimitUntil > now) {
    return { limited: true, waitTime: Math.ceil((rateLimitUntil - now) / 1000) };
  }
  
  // Increment failed attempts
  failedAttempts++;
  
  // Apply rate limiting if threshold exceeded
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    rateLimitUntil = now + RATE_LIMIT_DURATION;
    return { limited: true, waitTime: RATE_LIMIT_DURATION / 1000 };
  }
  
  return { limited: false, waitTime: 0 };
};

/**
 * Start token refresh interval
 */
const startTokenRefresh = () => {
  if (refreshTokenInterval) {
    clearInterval(refreshTokenInterval);
  }
  
  refreshTokenInterval = window.setInterval(async () => {
    try {
      console.log('Refreshing authentication token...');
      await authService.refreshToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, TOKEN_REFRESH_INTERVAL);
};

/**
 * Stop token refresh interval
 */
const stopTokenRefresh = () => {
  if (refreshTokenInterval) {
    clearInterval(refreshTokenInterval);
    refreshTokenInterval = null;
  }
};

export const authService = {
  signUp: async (params: AuthSignUpParams): Promise<ApiResult<{ session?: UserSession }>> => {
    try {
      const { email, password, ...userData } = params;
      
      // Validação de entrada
      if (!email || !password) {
        return { error: { message: 'Email e senha são obrigatórios' }, success: false };
      }
      
      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { error: { message: 'Formato de email inválido' }, success: false };
      }
      
      // Validação de senha
      if (password.length < 6) {
        return { error: { message: 'A senha deve ter pelo menos 6 caracteres' }, success: false };
      }
      
      // Log de registro (remova em produção)
      console.log('Registrando usuário:', { email, ...userData, password: '[REDACTED]' });
      
      // Criar novo usuário
      const { data, error, success } = await httpClient.post(apiConfig.endpoints.auth.register, {
        email,
        password,
        nome: userData.options?.data?.nome || '',
        sobrenome: userData.options?.data?.sobrenome || '',
        ...userData
      });
      
      if (error) {
        console.error('Erro no registro:', error);
        return { error: { message: error.message || 'Falha no registro' }, success: false };
      }
      
      // Armazenar sessão
      if (data && typeof data === 'object' && 'session' in data) {
        saveSession(data.session as UserSession);
        startTokenRefresh();
        
        // Log de registro bem-sucedido
        console.log('Usuário registrado com sucesso:', { userId: data.session.id, email });
      }
      
      return { data, success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { error: { message: 'Falha na criação da conta', details: error.message }, success: false };
    }
  },
  
  signIn: async ({ email, password }: AuthSignInParams): Promise<ApiResult<{ session?: UserSession }>> => {
    try {
      // Verificar rate limiting
      const { limited, waitTime } = checkRateLimit();
      if (limited) {
        return { 
          error: { 
            message: `Muitas tentativas de login. Tente novamente em ${waitTime} segundos`,
            code: 'RATE_LIMITED'
          },
          success: false
        };
      }
      
      // Validação de entrada
      if (!email || !password) {
        return { error: { message: 'Email e senha são obrigatórios' }, success: false };
      }
      
      // Log de tentativa de login (remova em produção)
      console.log('Tentativa de login:', { email, password: '[REDACTED]' });
      
      // Autenticação
      const { data, error } = await httpClient.post(apiConfig.endpoints.auth.login, {
        email, 
        password
      });
      
      if (error) {
        console.error('Erro no login:', error);
        return { error: { message: error.message || 'Credenciais inválidas' }, success: false };
      }
      
      // Reset rate limiting on success
      resetRateLimiting();
      
      // Armazenar sessão
      if (data && typeof data === 'object' && 'session' in data) {
        saveSession(data.session as UserSession);
        startTokenRefresh();
        
        // Log de login bem-sucedido
        console.log('Login bem-sucedido:', { userId: data.session.id, email });
      }
      
      return { data, success: true };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return { error: { message: 'Falha na autenticação', details: error.message }, success: false };
    }
  },
  
  signOut: async (): Promise<ApiResult<null>> => {
    try {
      const { session } = getSession();
      
      // Log de logout
      if (session) {
        console.log('Usuário fazendo logout:', { userId: session.id });
      }
      
      // Chamar API de logout
      await httpClient.post(apiConfig.endpoints.auth.logout);
      
      // Parar refresh de token
      stopTokenRefresh();
      
      // Remover sessão local
      removeSession();
      
      return { data: null, success: true };
    } catch (error: any) {
      console.error('Erro no logout:', error);
      
      // Mesmo com erro, remover sessão local
      stopTokenRefresh();
      removeSession();
      
      return { error: { message: 'Falha ao sair', details: error.message }, success: true };
    }
  },
  
  getSession: async (): Promise<ApiResult<{ session: UserSession | null }>> => {
    try {
      // Implementar recuperação de sessão
      const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
      
      if (!sessionStr) {
        return { data: { session: null }, success: true };
      }
      
      try {
        const sessionData = JSON.parse(sessionStr);
        const { session, expires_at } = sessionData;
        
        // Verificar se a sessão expirou
        if (expires_at && new Date(expires_at) < new Date()) {
          removeSession();
          stopTokenRefresh();
          return { data: { session: null }, success: true };
        }
        
        return { data: { session }, success: true };
      } catch (e) {
        console.error('Erro ao analisar sessão:', e);
        removeSession();
        return { data: { session: null }, success: true };
      }
    } catch (error: any) {
      console.error('Erro ao obter sessão:', error);
      return { data: { session: null }, success: false, error: { message: error.message } };
    }
  },
  
  refreshToken: async (): Promise<ApiResult<{ session?: UserSession }>> => {
    try {
      const { session } = getSession();
      
      // Se não houver sessão, não tente renovar
      if (!session) {
        return { error: { message: 'Nenhuma sessão ativa para renovar' }, success: false };
      }
      
      const { data, error } = await httpClient.post(apiConfig.endpoints.auth.refreshToken);
      
      if (error || !(data && typeof data === 'object' && 'session' in data)) {
        // Se a renovação falhar, faça logout
        console.error('Falha ao renovar token:', error);
        removeSession();
        stopTokenRefresh();
        return { error: error || { message: 'Falha ao renovar sessão' }, success: false };
      }
      
      // Atualizar sessão com novo token
      saveSession(data.session as UserSession);
      
      return { data, success: true };
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      removeSession();
      stopTokenRefresh();
      return { error: { message: 'Falha ao renovar sessão', details: error.message }, success: false };
    }
  },
  
  /**
   * Verifica permissões de usuário
   */
  checkUserRole: async (requiredRoles: string | string[]): Promise<ApiResult<{hasPermission: boolean}>> => {
    try {
      const { session } = getSession();
      
      // Se não houver sessão, não tem permissão
      if (!session) {
        return { data: { hasPermission: false }, success: true };
      }
      
      // Buscar papel do usuário do servidor
      const { data, error } = await httpClient.get(apiConfig.endpoints.users.roles);
      
      if (error || !data) {
        console.error('Erro ao verificar papéis do usuário:', error);
        return { data: { hasPermission: false }, success: false, error };
      }
      
      const userRoles = data.roles || [];
      const requiredRolesList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // Verificar se o usuário tem pelo menos um dos papéis requeridos
      const hasPermission = userRoles.some(role => requiredRolesList.includes(role));
      
      return { data: { hasPermission }, success: true };
    } catch (error: any) {
      console.error('Erro ao verificar permissões:', error);
      return { 
        data: { hasPermission: false }, 
        success: false, 
        error: { message: 'Erro ao verificar permissões', details: error.message } 
      };
    }
  }
};

// Inicializar o token refresh se já houver uma sessão ativa
(async () => {
  const { data } = await authService.getSession();
  if (data.session) {
    startTokenRefresh();
  }
})();
