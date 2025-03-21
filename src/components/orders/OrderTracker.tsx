
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  ClockIcon, 
  CheckCircle as CheckIcon, 
  Utensils as CookingIcon,
  Truck as DeliveryIcon, 
  Home as HomeIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderTrackerProps {
  orderId: string;
  initialStatus?: OrderStatus;
  className?: string;
}

type OrderStatus = 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered';

const OrderTracker = ({
  orderId,
  initialStatus = 'confirmed',
  className
}: OrderTrackerProps) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [eta, setEta] = useState('25 minutes');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Mock the order progression for demo purposes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status !== 'delivered') {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Demo progression logic
          if (newTime === 15 && status === 'confirmed') {
            setStatus('preparing');
            setEta('15 minutes');
          } else if (newTime === 30 && status === 'preparing') {
            setStatus('out-for-delivery');
            setEta('10 minutes');
          } else if (newTime === 40 && status === 'out-for-delivery') {
            setStatus('delivered');
            setEta('Delivered');
            clearInterval(interval);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [status]);
  
  // Format elapsed time to minutes and seconds
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Define steps and their status
  const steps = [
    { 
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been received',
      icon: CheckIcon,
      complete: ['confirmed', 'preparing', 'out-for-delivery', 'delivered'].includes(status)
    },
    { 
      id: 'preparing',
      title: 'Preparing',
      description: 'The restaurant is preparing your food',
      icon: CookingIcon,
      complete: ['preparing', 'out-for-delivery', 'delivered'].includes(status)
    },
    { 
      id: 'out-for-delivery',
      title: 'Out for Delivery',
      description: 'Your order is on its way',
      icon: DeliveryIcon,
      complete: ['out-for-delivery', 'delivered'].includes(status)
    },
    { 
      id: 'delivered',
      title: 'Delivered',
      description: 'Enjoy your meal!',
      icon: HomeIcon,
      complete: ['delivered'].includes(status)
    }
  ];
  
  const currentStep = steps.findIndex(step => step.id === status);
  
  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="font-semibold text-lg">Order #{orderId}</h3>
          <div className="flex items-center mt-1 text-muted-foreground">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {status === 'delivered' ? 'Delivered' : `ETA: ${eta}`}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Time elapsed: </span>
            <span className="font-medium">{formatElapsedTime()}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="hidden sm:flex"
          >
            Contact Driver
          </Button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="relative mb-10">
        <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 bg-muted" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary transition-all duration-500" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500',
                  step.complete 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <step.icon className="w-5 h-5" />
              </div>
              
              <div className="mt-2 text-center">
                <p 
                  className={cn(
                    'font-medium text-sm transition-colors',
                    step.complete ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                <p 
                  className="text-xs text-muted-foreground mt-1 max-w-[100px]"
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button 
          variant="outline" 
          className="w-full sm:flex-1"
        >
          View Order Details
        </Button>
        
        <Button 
          className="w-full sm:flex-1 sm:hidden"
        >
          Contact Driver
        </Button>
      </div>
    </div>
  );
};

export default OrderTracker;
