
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { CheckoutData } from './types';

interface OrderSummaryProps {
  checkoutData: CheckoutData;
  isProcessing: boolean;
  onConfirmOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  checkoutData,
  isProcessing,
  onConfirmOrder
}) => {
  return (
    <Card className="sticky top-20">
      <CardContent className="p-6">
        <h2 className="font-medium mb-4 text-lg">Resumo do Pedido</h2>
        
        {/* Itens do pedido */}
        <div className="mb-4">
          {checkoutData.items && checkoutData.items.length > 0 ? (
            checkoutData.items.map(item => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.quantity}x {item.name}</span>
                <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
              </div>
            ))
          ) : (
            <p className="text-foreground/70">Nenhum item no carrinho</p>
          )}
        </div>
        
        <Separator className="my-4" />
        
        {/* Detalhes do preço */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/70">Subtotal</span>
            <span>R$ {(checkoutData.subtotal || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          
          {checkoutData.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto ({checkoutData.discount}%)</span>
              <span>- R$ {(checkoutData.discountValue || 0).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-foreground/70">Taxa de Entrega</span>
            <span>R$ {(checkoutData.deliveryFee || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          
          <Separator className="my-3" />
          
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>R$ {(checkoutData.total || 0).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        
        {/* Botão de finalizar pedido */}
        <Button 
          className="w-full mt-6" 
          size="lg"
          onClick={onConfirmOrder}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processando...' : 'Confirmar Pedido'}
        </Button>
        
        <Button 
          variant="link" 
          className="w-full mt-2" 
          asChild
        >
          <Link to="/carrinho">Voltar ao Carrinho</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
