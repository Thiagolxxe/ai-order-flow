
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  UserIcon, 
  RestaurantIcon, 
  DeliveryIcon 
} from '@/assets/icons';

interface RoleIndicatorProps {
  role: string;
}

const RoleIndicator = ({ role }: RoleIndicatorProps) => {
  if (!role) return null;
  
  const roleIcons = {
    cliente: <UserIcon className="w-4 h-4" />,
    restaurante: <RestaurantIcon className="w-4 h-4" />,
    entregador: <DeliveryIcon className="w-4 h-4" />,
  };
  
  const roleLabels = {
    cliente: 'Cliente',
    restaurante: 'Restaurante',
    entregador: 'Entregador',
  };
  
  const roleColors = {
    cliente: 'bg-blue-100 text-blue-700',
    restaurante: 'bg-green-100 text-green-700',
    entregador: 'bg-orange-100 text-orange-700',
  };
  
  if (!(role in roleColors)) return null;
  
  return (
    <div className={cn(
      'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5',
      roleColors[role as keyof typeof roleColors]
    )}>
      {roleIcons[role as keyof typeof roleIcons]}
      <span className="capitalize">{roleLabels[role as keyof typeof roleLabels]}</span>
    </div>
  );
};

export default RoleIndicator;
