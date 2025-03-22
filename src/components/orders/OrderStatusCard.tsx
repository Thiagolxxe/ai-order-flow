
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import OrderTracker from '@/components/orders/OrderTracker';

interface OrderStatusCardProps {
  status: string;
  orderId: string;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ status, orderId }) => {
  // Convert status format from backend to the format expected by OrderTracker
  const mapStatusToTrackerFormat = (status: string): string => {
    switch(status) {
      case 'pendente': return 'confirmed';
      case 'preparando': return 'preparing';
      case 'em_entrega': return 'out-for-delivery';
      case 'entregue': return 'delivered';
      default: return 'confirmed';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Status do Pedido</h2>
        <OrderTracker 
          orderId={orderId} 
          initialStatus={mapStatusToTrackerFormat(status)}
        />
      </CardContent>
    </Card>
  );
};

export default OrderStatusCard;
