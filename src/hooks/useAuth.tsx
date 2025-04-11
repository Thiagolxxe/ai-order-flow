
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { authService } from '@/services/api/authService';
import { toast } from 'sonner';
import { getSession, removeSession } from '@/utils/authUtils';
import { User } from '@/types/user';

/**
 * Hook unificado de autenticação
 */
export const useAuth = () => {
  const context = useUser();
  
  // Certifique-se de que o contexto existe antes de desestruturá-lo
  if (!context) {
    console.error('useAuth deve ser usado dentro de um UserProvider');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      role: null,
      signIn: async () => ({ error: { message: 'Contexto de usuário não disponível' } }),
      signUp: async () => ({ error: { message: 'Contexto de usuário não disponível' } }),
      signOut: async () => {},
      updateUserData: () => {},
      checkRole: async () => false,
    };
  }
  
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    role,
    signIn: contextSignIn,
    signUp: contextSignUp,
    signOut: contextSignOut,
    updateUserData
  } = context;
  
  /**
   * Wrapper para login com tratamento de erros adicional
   */
  const signIn = async (email: string, password: string) => {
    try {
      // Validação básica
      if (!email || !password) {
        toast.error('Email e senha são obrigatórios');
        return { error: { message: 'Email e senha são obrigatórios' } };
      }
      
      const result = await contextSignIn(email, password);
      
      if (result.error) {
        // Tratamento específico para rate limiting
        if (result.error.code === 'RATE_LIMITED') {
          toast.error(result.error.message, { duration: 10000 });
        } else {
          toast.error(result.error.message || 'Falha na autenticação');
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro em signIn:', error);
      toast.error('Falha na autenticação');
      return { error: { message: 'Falha na autenticação', details: error.message } };
    }
  };
  
  /**
   * Wrapper para registro com tratamento de erros adicional
   */
  const signUp = async (credentials: any) => {
    try {
      // Validação básica
      if (!credentials.email || !credentials.password) {
        toast.error('Email e senha são obrigatórios');
        return { error: { message: 'Email e senha são obrigatórios' } };
      }
      
      const result = await contextSignUp(credentials);
      
      if (result.error) {
        toast.error(result.error.message || 'Erro ao criar conta');
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro em signUp:', error);
      toast.error('Erro ao criar conta');
      return { error: { message: 'Erro ao criar conta', details: error.message } };
    }
  };
  
  /**
   * Wrapper para logout com tratamento de erros adicional
   */
  const signOut = async () => {
    try {
      await contextSignOut();
    } catch (error: any) {
      console.error('Erro em signOut:', error);
      // Force logout even on error
      removeSession();
      toast.error('Erro ao fazer logout, mas sessão local removida');
    }
  };
  
  /**
   * Verificar se o usuário tem um papel específico
   */
  const checkRole = async (requiredRoles: string | string[]): Promise<boolean> => {
    try {
      // Se não estiver autenticado, não tem papel
      if (!isAuthenticated || !user) {
        return false;
      }
      
      // Se já tivermos o papel localmente, verificamos primeiro
      if (role) {
        const requiredRolesList = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        if (requiredRolesList.includes(role)) {
          return true;
        }
      }
      
      // Verificação no servidor
      const { data, success } = await authService.checkUserRole(requiredRoles);
      
      if (!success || !data) {
        return false;
      }
      
      return data.hasPermission;
    } catch (error) {
      console.error('Erro ao verificar papel:', error);
      return false;
    }
  };
  
  return {
    user,
    isAuthenticated,
    isLoading,
    role,
    signIn,
    signUp,
    signOut,
    updateUserData,
    checkRole
  };
};
