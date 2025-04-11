
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';

export interface UserSession {
  id: string;
  email: string;
  user?: any;
  access_token: string;
  refresh_token?: string;
  role?: string;
}

/**
 * Remove a sessão do armazenamento local
 */
export const removeSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Salva a sessão no armazenamento local
 */
export const saveSession = (session: UserSession) => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    session,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  }));
};

/**
 * Obtém a sessão do armazenamento local
 */
export const getSession = (): { session: UserSession | null } => {
  const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
  
  if (!sessionStr) {
    return { session: null };
  }
  
  try {
    const sessionData = JSON.parse(sessionStr);
    const { session, expires_at } = sessionData;
    
    // Verificar se a sessão expirou
    if (expires_at && new Date(expires_at) < new Date()) {
      removeSession();
      return { session: null };
    }
    
    return { session };
  } catch (error) {
    console.error('Error parsing session:', error);
    return { session: null };
  }
};
