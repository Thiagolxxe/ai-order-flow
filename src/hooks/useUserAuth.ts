
/**
 * @deprecated Use useAuth instead
 * This hook is kept for backward compatibility
 */
import { useAuth } from './useAuth';

export const useUserAuth = () => {
  const auth = useAuth();
  
  // Mapeamento para manter a compatibilidade
  return {
    user: auth.user,
    setUser: auth.updateUserData,
    session: auth.user ? { access_token: 'token' } : null,
    setSession: () => {},
    isLoading: auth.isLoading,
    setIsLoading: () => {},
    role: auth.role,
    setRole: () => {},
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    updateUserData: auth.updateUserData
  };
};
