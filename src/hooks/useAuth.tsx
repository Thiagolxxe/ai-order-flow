
import { useUser } from '@/context/UserContext';

export const useAuth = () => {
  const context = useUser();
  
  // Make sure context exists before trying to destructure it
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      logout: async () => {},
    };
  }
  
  const { user, isAuthenticated, signOut } = context;
  
  return {
    user,
    isAuthenticated,
    logout: signOut
  };
};
