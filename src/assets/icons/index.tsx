
import { LucideProps } from 'lucide-react';
import { 
  ShoppingBag, Utensils, Truck, User, MessageSquare, Clock, Home, 
  BarChart, Package, MapPin, Search, ChevronRight, 
  CheckCircle, AlertCircle, Menu as MenuIcon, X, Bell,
  Star
} from 'lucide-react';

// Exportando ícones Lucide que usaremos
export {
  ShoppingBag as BagIcon,
  Utensils as RestaurantIcon,
  Truck as DeliveryIcon,
  User as UserIcon,
  MessageSquare as ChatIcon,
  Clock as ClockIcon,
  Home as HomeIcon,
  BarChart as StatsIcon,
  Package as OrderIcon,
  MapPin as LocationIcon,
  Search as SearchIcon,
  ChevronRight as ArrowRightIcon,
  CheckCircle as SuccessIcon,
  AlertCircle as AlertIcon,
  MenuIcon as MenuIcon,
  X as CloseIcon,
  Bell as NotificationIcon,
  Star as StarIcon
};

// Podemos adicionar ícones SVG personalizados aqui conforme necessário
export const LogoIcon = (props: LucideProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={props.size || 24} 
      height={props.size || 24} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.5L10.5 15.5L16.5 9.5" />
    </svg>
  );
};

export const AIIcon = (props: LucideProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={props.size || 24} 
      height={props.size || 24} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a9 9 0 0 1 9 9c0 3.86-2.4 7.14-5.8 8.5" />
      <path d="M12 2a9 9 0 0 0-9 9c0 3.86 2.4 7.14 5.8 8.5" />
      <path d="M12 2v10" />
      <rect x="4" y="15" width="6" height="8" rx="2" />
      <rect x="14" y="15" width="6" height="8" rx="2" />
    </svg>
  );
};
