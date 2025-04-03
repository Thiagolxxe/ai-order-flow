
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CartItem, Restaurant, CartData } from '@/components/cart/types';
import { isValidUUID } from '@/utils/id-helpers';

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
      
      // Validate restaurant ID
      let validRestaurantId = restaurantId;
      
      // Get cart items
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
      
      try {
        // Fetch restaurant details from API
        const response = await fetch(`http://localhost:5000/api/restaurants/${validRestaurantId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch restaurant data');
        }
        
        const restaurantData = await response.json();
        
        setRestaurant(restaurantData || {
          id: validRestaurantId,
          nome: 'Restaurante',
          taxa_entrega: parsedCart.deliveryFee || 0
        });
      } catch (error) {
        console.error('Erro ao buscar dados do restaurante:', error);
        
        // Fallback to data from localStorage
        setRestaurant({
          id: validRestaurantId,
          nome: 'Restaurante',
          taxa_entrega: parsedCart.deliveryFee || 0
        });
      }
      
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
