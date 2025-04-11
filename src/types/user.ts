
/**
 * User-related type definitions
 */

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    nome?: string;
    sobrenome?: string;
  };
  name?: string;
  phone?: string;
  address?: string;
}

export interface Session {
  access_token: string;
}

export interface UserContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{error?: any}>;
  signUp: (credentials: any) => Promise<{error?: any}>;
  signOut: () => Promise<void>;
  updateUserData?: (data: Partial<User>) => void;
}
