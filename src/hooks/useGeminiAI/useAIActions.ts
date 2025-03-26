
import { useCallback } from 'react';
import { toast } from 'sonner';
import { FunctionResponse } from '@/services/gemini';
import { useCartActions } from './useCartActions';

export const useAIActions = () => {
  const { addItem, startCheckout } = useCartActions();

  // Handle function call response and perform actions
  const processAIAction = useCallback((functionResponse: FunctionResponse) => {
    try {
      if (functionResponse.action === 'add_to_cart' && functionResponse.item) {
        const item = functionResponse.item;
        
        // Add item to cart using the cart hook
        const success = addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantId: item.restaurantId,
          specialInstructions: item.specialInstructions
        });
        
        if (success) {
          toast.success(`${item.quantity}x ${item.name} adicionado ao carrinho`);
        }
        return success;
      }
      
      if (functionResponse.action === 'initiate_checkout' && functionResponse.restaurant) {
        // Start checkout process
        const success = startCheckout(functionResponse.restaurant.id);
        
        if (success) {
          toast.success(`Iniciando checkout para ${functionResponse.restaurant.name}`);
        }
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Error processing AI action:', error);
      return false;
    }
  }, [addItem, startCheckout]);

  return {
    processAIAction
  };
};
