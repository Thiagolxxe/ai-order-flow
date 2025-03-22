import {
  Utensils,
  ShoppingCart,
  User,
  ShoppingBag,
  Menu,
  X,
  Truck,
  Bell,
  Clock,
  ArrowRight,
  Star,
  Search,
  Heart,
  MapPin,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
  BarChart3,
  LogOut,
  Settings,
  Home,
  Info
} from 'lucide-react';

// Main icons needed in the current code
export const RestaurantIcon = Utensils;
export const ShoppingCartIcon = ShoppingCart;
export const UserIcon = User;
export const BagIcon = ShoppingBag;
export const MenuIcon = Menu;
export const CloseIcon = X;
export const DeliveryIcon = Truck;
export const NotificationIcon = Bell;
export const ClockIcon = Clock;
export const ArrowRightIcon = ArrowRight;
export const StarIcon = Star;
export const SearchIcon = Search;
export const HeartIcon = Heart;
export const LocationIcon = MapPin;
export const ChatIcon = MessageSquare;
export const SuccessIcon = CheckCircle;
export const AlertIcon = AlertCircle;
export const SendIcon = Send;
export const StatsIcon = BarChart3;
export const LogoIcon = ShoppingBag; // Using ShoppingBag as logo for now
export const LogoutIcon = LogOut;
export const SettingsIcon = Settings;
export const HomeIcon = Home;
export const InfoIcon = Info;
export const Location = MapPin; // Duplicate of LocationIcon for compatibility

// Define the AIIcon that is referenced in some components
export const AIIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a8 8 0 0 1 8 8v12l-4-4H4a8 8 0 0 1 0-16z" />
    <path d="M9 10h.01M15 10h.01M12 14h.01" />
  </svg>
);
