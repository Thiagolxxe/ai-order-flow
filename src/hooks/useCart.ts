
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Restaurant, CartData } from '@/components/cart/types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Load cart data from localStorage
  const loadCartData = async () => {
    try {
      setLoading(true);
      
      // Get current restaurant ID
      const restaurantId = localStorage.getItem('currentRestaurant');
      if (!restaurantId) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      // Validate if restaurant ID is valid
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      // Handle numeric IDs (1-5) by converting them to UUIDs
      let validRestaurantId = restaurantId;
      if (/^\d+$/.test(restaurantId)) {
        const numericId = parseInt(restaurantId);
        if (numericId > 0 && numericId <= 5) {
          validRestaurantId = `00000000-0000-0000-0000-00000000000${numericId}`;
          console.log(`Converting numeric ID ${restaurantId} to test UUID: ${validRestaurantId}`);
        }
      }
      
      if (!uuidRegex.test(validRestaurantId)) {
        console.error('ID do restaurante inválido:', validRestaurantId);
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      // Get cart items using validated ID
      const savedCart = localStorage.getItem(`cart_${validRestaurantId}`);
      if (!savedCart) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      const parsedCart = JSON.parse(savedCart);
      if (!parsedCart || !parsedCart.items || parsedCart.items.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      // Ensure we're using the valid restaurant ID for all operations
      localStorage.setItem('currentRestaurant', validRestaurantId);
      
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurantes')
        .select('id, nome, taxa_entrega')
        .eq('id', validRestaurantId)
        .maybeSingle();
      
      if (restaurantError) {
        console.error('Erro ao buscar dados do restaurante:', restaurantError);
        toast.error('Não foi possível carregar os dados do restaurante');
        setLoading(false);
        return;
      }
      
      setRestaurant(restaurantData || {
        id: validRestaurantId,
        nome: 'Restaurante',
        taxa_entrega: parsedCart.deliveryFee || 0
      });
      setCartItems(parsedCart.items || []);
      setDiscount(parsedCart.discount || 0);
      
    } catch (error) {
      console.error('Erro ao carregar dados do carrinho:', error);
      toast.error('Não foi possível carregar os dados do carrinho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartData();
  }, []);
  
  // Increase quantity
  const increaseQuantity = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
  };
  
  // Decrease quantity
  const decreaseQuantity = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      );
      
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
  };
  
  // Remove item
  const removeItem = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      
      updateLocalStorage(updatedItems);
      return updatedItems;
    });
    toast.success('Item removido do carrinho');
  };

  // Helper to update localStorage
  const updateLocalStorage = (items: CartItem[]) => {
    if (restaurant) {
      const cartData = {
        items,
        discount,
        deliveryFee: restaurant.taxa_entrega
      };
      localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(cartData));
    }
  };
  
  // Calculate pricing
  const calculatePricing = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountValue = (subtotal * discount) / 100;
    const deliveryFee = restaurant ? restaurant.taxa_entrega : 0;
    const total = subtotal - discountValue + deliveryFee;
    
    return {
      subtotal,
      discountValue,
      deliveryFee,
      total,
      discount
    };
  };
  
  // Save checkout data
  const saveCheckoutData = () => {
    if (!restaurant) return false;
    
    const { subtotal, discountValue, deliveryFee, total } = calculatePricing();
    
    const checkoutData = {
      restaurantId: restaurant.id,
      items: cartItems,
      subtotal,
      discount,
      discountValue,
      deliveryFee,
      total
    };
    
    localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
    localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(checkoutData));
    
    return true;
  };

  return {
    cartItems,
    restaurant,
    discount,
    setDiscount,
    loading,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    calculatePricing,
    isCartEmpty: cartItems.length === 0,
    saveCheckoutData
  };
};
