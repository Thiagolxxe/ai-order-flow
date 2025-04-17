
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';
import { jwtDecode } from 'jwt-decode';

export interface UserSession {
  id: string;
  email: string;
  user?: any;
  access_token: string;
  refresh_token?: string;
  role?: string;
}

interface DecodedToken {
  exp: number;
  iat: number;
  id: string;
  email: string;
  [key: string]: any;
}

/**
 * Verifica se um token JWT está expirado
 * @param token O token JWT a ser verificado
 * @returns true se o token estiver expirado, false caso contrário
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Timestamp atual em segundos
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Verificar se o token está expirado
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    // Em caso de erro na decodificação, considerar o token como expirado
    return true;
  }
};

/**
 * Verifica se um token JWT está próximo de expirar (menos de 15 minutos)
 * @param token O token JWT a ser verificado
 * @returns true se o token estiver próximo de expirar, false caso contrário
 */
const isTokenNearExpiration = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Timestamp atual em segundos
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Verificar se o token expira em menos de 15 minutos (900 segundos)
    return decoded.exp - currentTime < 900;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    // Em caso de erro na decodificação, considerar o token como próximo de expirar
    return true;
  }
};

/**
 * Remove a sessão do armazenamento local com segurança
 */
export const removeSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  
  // Limpar quaisquer outros dados relacionados à sessão
  sessionStorage.removeItem('user_preferences');
  document.cookie = 'logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

/**
 * Salva a sessão no armazenamento local com segurança
 */
export const saveSession = (session: UserSession) => {
  try {
    if (!session || !session.access_token) {
      console.error('Tentativa de salvar sessão inválida');
      return;
    }
    
    // Verificar se o token é válido
    if (isTokenExpired(session.access_token)) {
      console.error('Tentativa de salvar sessão com token expirado');
      return;
    }
    
    const sessionData = {
      session,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };
    
    // Salvar no localStorage
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    
    // Definir cookie para indicar que o usuário está logado (sem armazenar dados sensíveis)
    document.cookie = 'logged_in=true; path=/; max-age=86400; samesite=strict; secure';
  } catch (error) {
    console.error('Erro ao salvar sessão:', error);
    // Em caso de erro, garantir que não há dados parciais salvos
    removeSession();
  }
};

/**
 * Obtém a sessão do armazenamento local com verificações de segurança
 */
export const getSession = (): { session: UserSession | null } => {
  try {
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!sessionStr) {
      return { session: null };
    }
    
    const sessionData = JSON.parse(sessionStr);
    const { session, expires_at } = sessionData;
    
    // Verificar se a sessão é válida
    if (!session || !session.access_token) {
      removeSession();
      return { session: null };
    }
    
    // Verificar se o token expirou
    if (isTokenExpired(session.access_token)) {
      console.log('Token expirado, removendo sessão');
      removeSession();
      return { session: null };
    }
    
    // Verificar se a sessão expirou
    if (expires_at && new Date(expires_at) < new Date()) {
      console.log('Sessão expirada, removendo');
      removeSession();
      return { session: null };
    }
    
    return { session };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    removeSession();
    return { session: null };
  }
};

/**
 * Obtém os headers de autorização para requisições à API
 */
export const getAuthHeader = () => {
  const { session } = getSession();
  
  if (!session || !session.access_token) {
    return {};
  }
  
  // Verificar se o token está próximo de expirar (para implementação de refresh token)
  if (isTokenNearExpiration(session.access_token)) {
    // Aqui poderia disparar a lógica de refresh token
    console.log('Token próximo de expirar, considere implementar refresh');
  }
  
  return {
    Authorization: `Bearer ${session.access_token}`
  };
};

/**
 * Decodifica o token JWT e extrai as informações do usuário
 */
export const decodeUserFromToken = (token: string): Partial<UserSession> | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};
