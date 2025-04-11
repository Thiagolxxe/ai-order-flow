
import { UserSession } from '@/utils/authUtils';
import { connectToDatabase } from '@/integrations/mongodb/client';

/**
 * Authentication service
 */
export const authService = {
  /**
   * Get current session
   */
  getSession: async (): Promise<{ data: { session: UserSession | null }}> => {
    // Get session from local storage
    const sessionStr = localStorage.getItem('deliveryapp_session');
    
    if (!sessionStr) {
      return { data: { session: null } };
    }
    
    try {
      const { session, expires_at } = JSON.parse(sessionStr);
      
      // Check if the session expired
      if (expires_at && new Date(expires_at) < new Date()) {
        localStorage.removeItem('deliveryapp_session');
        return { data: { session: null } };
      }
      
      return { data: { session } };
    } catch (error) {
      console.error('Error parsing session:', error);
      return { data: { session: null } };
    }
  },
  
  /**
   * Sign up new user
   */
  signUp: async (email: string, password: string, userData?: any) => {
    try {
      const { db } = await connectToDatabase();
      
      // Check if user exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return {
          data: null,
          error: { message: 'Email já registrado' }
        };
      }
      
      // Create user
      const userToCreate = {
        email,
        password, // Na implementação real seria um hash da senha
        user_metadata: userData || {},
        created_at: new Date()
      };
      
      const result = await db.collection('users').insertOne(userToCreate);
      
      const user = {
        id: result.insertedId.toString(),
        email,
        ...userToCreate
      };
      
      const session = { 
        id: user.id,
        email,
        user,
        access_token: 'mock-token-' + Math.random().toString(36).substring(2),
        role: 'user'
      };
      
      return {
        data: {
          user,
          session
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Error signing up' }
      };
    }
  },
  
  /**
   * Sign in user
   */
  signIn: async (email: string, password: string) => {
    try {
      const { db } = await connectToDatabase();
      
      // Find user
      const user = await db.collection('users').findOne({ email });
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Credenciais inválidas' }
        };
      }
      
      // Check password (implementação real usaria bcrypt.compare)
      if (user.password !== password) {
        return {
          data: null,
          error: { message: 'Credenciais inválidas' }
        };
      }
      
      const sessionUser = {
        id: user._id.toString(),
        email: user.email,
        user_metadata: user.user_metadata || {}
      };
      
      const session = {
        id: user._id.toString(),
        email: user.email,
        user: sessionUser,
        access_token: 'mock-token-' + Math.random().toString(36).substring(2),
        role: 'user'
      };
      
      return {
        data: {
          user: sessionUser,
          session
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Error signing in' }
      };
    }
  },
  
  /**
   * Set session
   */
  setSession: async (session: UserSession) => {
    try {
      // Save session to localStorage
      localStorage.setItem('deliveryapp_session', JSON.stringify({
        session,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }));
      
      return {
        data: { session },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.message || 'Error setting session' }
      };
    }
  }
};
