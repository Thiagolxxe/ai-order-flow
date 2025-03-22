
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ClockIcon, PhoneIcon } from 'lucide-react';

interface OrderDetailsCardProps {
  orderNumber: string;
  status: string;
  restaurantName?: string;
  restaurantAddress?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  estimatedTime?: string;
  restaurantPhone?: string;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  orderNumber,
  status,
  restaurantName,
  restaurantAddress,
  deliveryAddress,
  deliveryCity,
  deliveryState,
  deliveryZip,
  estimatedTime,
  restaurantPhone
}) => {
  const formatStatus = (status: string): string => {
    switch(status) {
      case 'em_entrega': return 'Em entrega';
      case 'entregue': return 'Entregue';
      case 'preparando': return 'Preparando';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-2">Informações do Pedido</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Número do Pedido</p>
            <p className="font-medium">{orderNumber}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={
              status === 'entregue' ? 'secondary' : 
              status === 'em_entrega' ? 'default' :
              'secondary'
            }>
              {formatStatus(status)}
            </Badge>
          </div>
          
          {(restaurantName || restaurantAddress) && (
            <div>
              <p className="text-sm text-muted-foreground">Restaurante</p>
              <div className="flex items-start">
                <MapPinIcon className="w-4 h-4 text-primary mt-1 mr-1 shrink-0" />
                <p>{restaurantName} {restaurantAddress ? `- ${restaurantAddress}` : ''}</p>
              </div>
            </div>
          )}
          
          {deliveryAddress && (
            <div>
              <p className="text-sm text-muted-foreground">Entrega em</p>
              <div className="flex items-start">
                <MapPinIcon className="w-4 h-4 text-primary mt-1 mr-1 shrink-0" />
                <p>
                  {deliveryAddress}
                  {deliveryCity && deliveryState ? `, ${deliveryCity} - ${deliveryState}` : ''}
                  {deliveryZip ? `, ${deliveryZip}` : ''}
                </p>
              </div>
            </div>
          )}
          
          {estimatedTime && (
            <div>
              <p className="text-sm text-muted-foreground">Tempo estimado</p>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-primary mr-1" />
                <p>{estimatedTime}</p>
              </div>
            </div>
          )}
          
          {restaurantPhone && (
            <div>
              <p className="text-sm text-muted-foreground">Telefone do restaurante</p>
              <div className="flex items-center">
                <PhoneIcon className="w-4 h-4 text-primary mr-1" />
                <p>{restaurantPhone}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;
