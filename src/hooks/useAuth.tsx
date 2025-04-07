
import { useUser } from '@/hooks/useUser';

export const useAuth = () => {
  const { user, isAuthenticated, signOut } = useUser();
  
  return {
    user,
    isAuthenticated,
    logout: signOut
  };
};
