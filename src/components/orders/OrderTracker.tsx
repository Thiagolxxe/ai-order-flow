
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
  const [eta, setEta] = useState('25 minutos');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Simular a progressão do pedido para fins de demonstração
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status !== 'delivered') {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          
          // Lógica de progressão para demonstração
          if (newTime === 15 && status === 'confirmed') {
            setStatus('preparing');
            setEta('15 minutos');
          } else if (newTime === 30 && status === 'preparing') {
            setStatus('out-for-delivery');
            setEta('10 minutos');
          } else if (newTime === 40 && status === 'out-for-delivery') {
            setStatus('delivered');
            setEta('Entregue');
            clearInterval(interval);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [status]);
  
  // Formatar tempo decorrido para minutos e segundos
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Definir etapas e seus status
  const steps = [
    { 
      id: 'confirmed',
      title: 'Pedido Confirmado',
      description: 'Seu pedido foi recebido',
      icon: CheckIcon,
      complete: ['confirmed', 'preparing', 'out-for-delivery', 'delivered'].includes(status)
    },
    { 
      id: 'preparing',
      title: 'Preparando',
      description: 'O restaurante está preparando seu pedido',
      icon: CookingIcon,
      complete: ['preparing', 'out-for-delivery', 'delivered'].includes(status)
    },
    { 
      id: 'out-for-delivery',
      title: 'A Caminho',
      description: 'Seu pedido está a caminho',
      icon: DeliveryIcon,
      complete: ['out-for-delivery', 'delivered'].includes(status)
    },
    { 
      id: 'delivered',
      title: 'Entregue',
      description: 'Aproveite sua refeição!',
      icon: HomeIcon,
      complete: ['delivered'].includes(status)
    }
  ];
  
  const currentStep = steps.findIndex(step => step.id === status);
  
  return (
    <div className={cn('rounded-xl border bg-card p-6', className)}>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="font-semibold text-lg">Pedido #{orderId}</h3>
          <div className="flex items-center mt-1 text-muted-foreground">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {status === 'delivered' ? 'Entregue' : `Previsão: ${eta}`}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Tempo decorrido: </span>
            <span className="font-medium">{formatElapsedTime()}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            className="hidden sm:flex"
          >
            Contatar Entregador
          </Button>
        </div>
      </div>
      
      {/* Barra de progresso */}
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
      
      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button 
          variant="outline" 
          className="w-full sm:flex-1"
        >
          Ver Detalhes do Pedido
        </Button>
        
        <Button 
          className="w-full sm:flex-1 sm:hidden"
        >
          Contatar Entregador
        </Button>
      </div>
    </div>
  );
};

export default OrderTracker;
