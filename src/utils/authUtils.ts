
/**
 * Utilitários para autenticação
 */
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';

/**
 * Interface para a sessão do usuário
 */
export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
}

/**
 * Obtém toda a sessão do localStorage
 */
export function getSession(): { session: UserSession | null, expires_at: string | null } | null {
  const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr);
  } catch (e) {
    console.error('Error parsing session:', e);
    return null;
  }
}

/**
 * Obtém o token de autenticação do localStorage
 */
export function getAuthToken(): string | null {
  const sessionData = getSession();
  return sessionData?.session?.access_token || null;
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
 * Obtém o usuário atual da sessão
 */
export function getCurrentUser(): UserSession | null {
  const sessionData = getSession();
  return sessionData?.session || null;
}

/**
 * Verifica se a sessão atual é válida
 */
export function isSessionValid(): boolean {
  const sessionData = getSession();
  if (!sessionData) return false;
  
  try {
    const { expires_at } = sessionData;
    return expires_at && new Date(expires_at) > new Date();
  } catch (e) {
    return false;
  }
}

/**
 * Salva a sessão no localStorage
 */
export function saveSession(session: UserSession, expireInHours = 24): void {
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

/**
 * Verifica se o usuário tem uma determinada permissão/role
 */
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  return user.role.includes(role);
}
