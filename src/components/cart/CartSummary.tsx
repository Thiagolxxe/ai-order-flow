
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import CouponForm from './CouponForm';

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  discountValue: number;
  deliveryFee: number;
  total: number;
  restaurantId?: string;
  isCartEmpty: boolean;
  onApplyCoupon: (discount: number) => void;
  onCheckout: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  discount,
  discountValue,
  deliveryFee,
  total,
  restaurantId,
  isCartEmpty,
  onApplyCoupon,
  onCheckout
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-medium mb-4 text-lg">Resumo do Pedido</h2>
        
        {/* Coupon discount */}
        <CouponForm 
          restaurantId={restaurantId}
          subtotal={subtotal}
          currentDiscount={discount}
          onApplyCoupon={onApplyCoupon}
        />
        
        {/* Price details */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/70">Subtotal</span>
            <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto ({discount}%)</span>
              <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-foreground/70">Taxa de Entrega</span>
            <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        
        {/* Checkout button */}
        <Button 
          className="w-full mt-6" 
          size="lg"
          onClick={onCheckout}
          disabled={isCartEmpty}
        >
          Finalizar Pedido
        </Button>
        
        {restaurantId && (
          <Button 
            variant="link" 
            className="w-full mt-2" 
            asChild
          >
            <Link to={`/restaurante/${restaurantId}/menu`}>Adicionar mais itens</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
