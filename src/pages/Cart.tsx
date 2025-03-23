
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import CartItemCard from '@/components/food/CartItemCard';
import EmptyCart from '@/components/cart/EmptyCart';
import CartSummary from '@/components/cart/CartSummary';
import CartSkeleton from '@/components/cart/CartSkeleton';
import { useCart } from '@/hooks/useCart';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    restaurant, 
    discount, 
    setDiscount,
    loading, 
    increaseQuantity, 
    decreaseQuantity, 
    removeItem,
    calculatePricing,
    isCartEmpty,
    saveCheckoutData
  } = useCart();
  
  // Calculate pricing
  const { subtotal, discountValue, deliveryFee, total } = calculatePricing();
  
  // Go to checkout
  const goToCheckout = () => {
    if (isCartEmpty) {
      toast.error('Adicione itens ao carrinho para continuar');
      return;
    }
    
    if (saveCheckoutData()) {
      navigate('/finalizar');
    }
  };

  if (loading) {
    return <CartSkeleton />;
  }

  return (
    <div className="container px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Meu Carrinho</h1>
      </div>
      
      {isCartEmpty ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium mb-4 text-lg">{restaurant?.nome} - Itens do Pedido</h2>
                
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onIncrease={() => increaseQuantity(item.id)}
                      onDecrease={() => decreaseQuantity(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order summary */}
          <div>
            <CartSummary
              subtotal={subtotal}
              discount={discount}
              discountValue={discountValue}
              deliveryFee={deliveryFee}
              total={total}
              restaurantId={restaurant?.id}
              isCartEmpty={isCartEmpty}
              onApplyCoupon={setDiscount}
              onCheckout={goToCheckout}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
