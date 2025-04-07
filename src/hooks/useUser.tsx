
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

/**
 * Hook para acessar o contexto de usuário
 * Centraliza o acesso ao UserContext para facilitar a gestão de imports
 */
export function useUser() {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}
