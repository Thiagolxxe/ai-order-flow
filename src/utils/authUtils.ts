
/**
 * Utilitários para autenticação
 */
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';

/**
 * Obtém o token de autenticação do localStorage
 */
export function getAuthToken(): string | null {
  const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionStr) return null;
  
  try {
    const { session } = JSON.parse(sessionStr);
    return session?.access_token || null;
  } catch (e) {
    console.error('Error parsing session:', e);
    return null;
  }
}

/**
 * Obtém os headers de autenticação se o usuário estiver logado
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  
  return { 'Authorization': `Bearer ${token}` };
}

/**
 * Verifica se a sessão atual é válida
 */
export function isSessionValid(): boolean {
  const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionStr) return false;
  
  try {
    const { expires_at } = JSON.parse(sessionStr);
    return new Date(expires_at) > new Date();
  } catch (e) {
    return false;
  }
}

/**
 * Salva a sessão no localStorage
 */
export function saveSession(session: any, expireInHours = 24): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
    session,
    expires_at: new Date(Date.now() + expireInHours * 60 * 60 * 1000).toISOString()
  }));
}

/**
 * Remove a sessão do localStorage
 */
export function removeSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}
