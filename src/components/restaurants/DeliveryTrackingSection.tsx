
import React from 'react';
import { Separator } from "@/components/ui/separator";
import DeliveryMap from '@/components/tracking/DeliveryMap';

interface DeliveryTrackingSectionProps {
  restaurantName: string;
  deliveryPosition: {
    lat: number;
    lng: number;
  };
}

const DeliveryTrackingSection: React.FC<DeliveryTrackingSectionProps> = ({ 
  restaurantName, 
  deliveryPosition 
}) => {
  return (
    <>
      <Separator />
      <h3 className="text-xl font-semibold">Acompanhe a entrega</h3>
      <DeliveryMap
        restaurantPosition={{ lat: -23.5505, lng: -46.6333 }}
        deliveryPosition={deliveryPosition}
        userPosition={{ lat: -23.5639, lng: -46.6563 }}
        restaurantName={restaurantName}
      />
    </>
  );
};

export default DeliveryTrackingSection;
