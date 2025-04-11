
import React, { createContext, useContext, useEffect } from 'react';
import { UserContextProps } from '@/types/user';
import { useUserAuth } from '@/hooks/useUserAuth';
import { loadSession } from '@/services/sessionService';

export const UserContext = createContext<UserContextProps | undefined>(undefined);

// Export the useUser hook directly from this file
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our new hook for authentication functionality
  const { 
    user, 
    setUser, 
    session, 
    setSession, 
    isLoading, 
    setIsLoading, 
    role, 
    setRole, 
    signIn, 
    signUp, 
    signOut, 
    updateUserData 
  } = useUserAuth();
  
  // Load the session on mount
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);
      
      const { user: sessionUser, session: sessionData, role: userRole } = await loadSession();
      
      if (sessionUser) {
        setUser(sessionUser);
        setSession(sessionData);
        setRole(userRole);
      }
      
      setIsLoading(false);
    };
    
    initSession();
  }, [setIsLoading, setUser, setSession, setRole]);
  
  // Create the context value object
  const value: UserContextProps = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    role,
    signIn,
    signUp,
    signOut,
    updateUserData
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
