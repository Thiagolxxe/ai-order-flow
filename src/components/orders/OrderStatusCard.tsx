
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import OrderTracker from '@/components/orders/OrderTracker';

interface OrderStatusCardProps {
  status: string;
  orderId: string;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ status, orderId }) => {
  // Map backend status to component status
  let componentStatus: "confirmed" | "preparing" | "out-for-delivery" | "delivered";
  
  switch (status) {
    case 'pendente':
      componentStatus = 'confirmed';
      break;
    case 'preparando':
      componentStatus = 'preparing';
      break;
    case 'em_entrega':
      componentStatus = 'out-for-delivery';
      break;
    case 'entregue':
      componentStatus = 'delivered';
      break;
    default:
      componentStatus = 'confirmed';
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Status do Pedido</h2>
        
        <OrderTracker 
          initialStatus={componentStatus} 
          orderId={orderId}
        />
      </CardContent>
    </Card>
  );
};

export default OrderStatusCard;
