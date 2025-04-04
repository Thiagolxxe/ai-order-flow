
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { saveSession, removeSession, UserSession } from '@/utils/authUtils';

// Define the context data structure
export interface UserContextData {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{
    error?: { message: string };
  }>;
  signOut: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{
    error?: { message: string };
  }>;
}

// Create the context with a default value
const UserContext = createContext<UserContextData>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  signIn: async () => ({ error: undefined }),
  signOut: async () => {},
  signup: async () => ({ error: undefined }),
});

// Export the hook for using the context
export const useUser = () => useContext(UserContext);

// Provider component that wraps your app and makes auth object available
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string | null>(null);

  // Method to sign in a user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        setUser(data.session);
        saveSession(data.session);
        
        // Fetch user role
        setRole('user'); // Default role - would come from backend in real app
      }

      return { error: undefined };
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      return { error };
    }
  };

  // Method to sign up a user
  const signup = async (email: string, password: string, userData: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        setUser(data.session);
        saveSession(data.session);
        
        // Set default role for new users
        setRole('user');
      }

      return { error: undefined };
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      return { error };
    }
  };

  // Method to sign out
  const signOut = async () => {
    try {
      removeSession();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check for existing session on load
  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          setUser(data.session);
          
          // Set role - would come from backend in real app
          setRole('user');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Return the provider with the context value
  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        role,
        signIn,
        signOut,
        signup,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
