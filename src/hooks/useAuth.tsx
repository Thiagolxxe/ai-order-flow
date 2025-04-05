
import { useUser } from '@/context/UserContext';

export const useAuth = () => {
  const { user, isAuthenticated, signOut } = useUser();
  
  return {
    user,
    isAuthenticated,
    logout: signOut
  };
};
