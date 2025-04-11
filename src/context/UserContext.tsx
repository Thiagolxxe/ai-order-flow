
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserContextProps, User } from '@/types/user';
import { loadSession } from '@/services/sessionService';

// Create the context with an undefined default value
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
  // Define state variables directly in the provider
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null); // Use explicit typing if possible
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);
  
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
  }, []);
  
  // Define auth functions directly in the provider
  const signIn = async (email: string, password: string) => {
    // Implementation here
    console.log('Sign in with:', email);
    return { error: undefined };
  };
  
  const signUp = async (credentials: any) => {
    // Implementation here
    console.log('Sign up with:', credentials.email);
    return { error: undefined };
  };
  
  const signOut = async () => {
    // Implementation here
    setUser(null);
    setSession(null);
    setRole(null);
  };
  
  const updateUserData = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };
  
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
