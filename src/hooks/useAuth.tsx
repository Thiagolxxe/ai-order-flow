
import { useUser } from '@/context/UserContext';

export const useAuth = () => {
  const { user, signOut } = useUser();
  
  return {
    user,
    logout: signOut,
    isAuthenticated: !!user
  };
};
