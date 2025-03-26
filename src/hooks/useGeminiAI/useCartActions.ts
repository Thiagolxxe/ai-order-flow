
import { useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export const useCartActions = () => {
  const cart = useCart();

  // Create custom cart actions
  const addItem = useCallback((item: any) => {
    try {
      if (cart && typeof cart.increaseQuantity === 'function') {
        // Check if item exists in cart
        const existingItem = cart.cartItems.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
          // If item exists, increase quantity
          for (let i = 0; i < item.quantity; i++) {
            cart.increaseQuantity(item.id);
          }
          return true;
        } else {
          // For new items, we would need to have an actual addItem method
          // For now, we'll just show a toast message
          toast.error("Função adicionar item ainda não implementada completamente");
          console.log("Tentando adicionar item:", item);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error("Erro ao adicionar item ao carrinho");
      return false;
    }
  }, [cart]);

  // Create custom checkout action
  const startCheckout = useCallback((restaurantId: string) => {
    try {
      if (cart && typeof cart.saveCheckoutData === 'function') {
        const success = cart.saveCheckoutData();
        
        if (success) {
          // Redirect to checkout page
          window.location.href = '/checkout';
          return true;
        } else {
          toast.error("Não foi possível iniciar o checkout");
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error starting checkout:', error);
      toast.error("Erro ao iniciar o checkout");
      return false;
    }
  }, [cart]);

  return {
    addItem,
    startCheckout
  };
};
