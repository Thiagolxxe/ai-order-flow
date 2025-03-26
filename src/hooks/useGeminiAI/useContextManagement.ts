
import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { OrderContext, fetchUserContext } from '@/services/gemini';

export const useContextManagement = (initialContext?: Partial<OrderContext>) => {
  const [context, setContext] = useState<OrderContext>(initialContext || {});
  const { user } = useUser();

  // Update context
  const updateContext = useCallback((newContext: Partial<OrderContext>) => {
    setContext(prevContext => ({
      ...prevContext,
      ...newContext
    }));
  }, []);

  // Load user context on initialization
  useEffect(() => {
    const loadUserContext = async () => {
      if (user?.id) {
        try {
          const userContext = await fetchUserContext(user.id);
          setContext(prevContext => ({
            ...prevContext,
            ...userContext
          }));
          
          console.log('Carregado contexto do usuário:', userContext);
        } catch (error) {
          console.error('Error loading user context:', error);
        }
      }
    };
    
    loadUserContext();
  }, [user?.id]);

  return {
    context,
    updateContext
  };
};
