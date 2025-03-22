
import { supabase } from './client';
import { TEST_UUIDS } from '@/utils/id-helpers';

/**
 * This mock auth service allows us to use the app with test data
 * without having to authenticate real users.
 * 
 * It simulates authentication with our test users.
 */

// Demo users with their roles - matches our test data
const demoUsers = [
  { 
    id: TEST_UUIDS.USER_1, 
    email: 'joao@example.com',
    name: 'João Silva',
    role: 'cliente' 
  },
  { 
    id: TEST_UUIDS.USER_2, 
    email: 'maria@example.com',
    name: 'Maria Santos',
    role: 'cliente' 
  },
  { 
    id: TEST_UUIDS.USER_3, 
    email: 'carlos@example.com',
    name: 'Carlos Oliveira',
    role: 'restaurante' 
  },
  { 
    id: TEST_UUIDS.USER_4, 
    email: 'ana@example.com',
    name: 'Ana Pereira',
    role: 'entregador' 
  },
  { 
    id: TEST_UUIDS.USER_5, 
    email: 'pedro@example.com',
    name: 'Pedro Souza',
    role: 'admin' 
  }
];

// Selected demo user - default to first user
let currentDemoUser = demoUsers[0];

// Manually set the mock auth session
export const setMockSession = (userId: string) => {
  const user = demoUsers.find(u => u.id === userId);
  if (user) {
    currentDemoUser = user;
    console.log(`Mock auth: Switched to user ${user.name} (${user.role})`);
    
    // Trigger Supabase auth state change listener
    const mockSession = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
        }
      }
    };
    
    // This is for development only - we're manually setting a session object
    // to trigger auth state changes in the app
    (supabase.auth as any).mockSession = mockSession;
    
    // Dispatch a custom event to notify the app of auth changes
    window.dispatchEvent(new CustomEvent('supabase-mock-auth-change', { 
      detail: mockSession 
    }));
  }
};

// Get the current mock user
export const getMockUser = () => {
  return currentDemoUser;
};

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Initialize with the first user
if (isDevelopment) {
  setMockSession(TEST_UUIDS.USER_1);
}

// Export a convenience function to switch between test users
export const switchToTestUser = (userNumber: number) => {
  const userId = TEST_UUIDS[`USER_${userNumber}` as keyof typeof TEST_UUIDS];
  if (userId) {
    setMockSession(userId);
    return true;
  }
  return false;
};

export const getMockAuthHeader = () => {
  return {
    headers: {
      'X-Mock-User-Id': currentDemoUser.id,
      'X-Mock-User-Role': currentDemoUser.role
    }
  };
};
