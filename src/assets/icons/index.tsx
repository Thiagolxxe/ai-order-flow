
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
  Info,
  Sparkles
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
export const LogoutIcon = LogOut;
export const SettingsIcon = Settings;
export const HomeIcon = Home;
export const InfoIcon = Info;
export const Location = MapPin; // Duplicate of LocationIcon for compatibility
export const AIIcon = Sparkles;

// New DeliverAI Logo SVG component
export const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 1024 768"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    style={{ minWidth: "160px", minHeight: "64px" }}
  >
    <g id="logo-center" transform="translate(276.4418162500001 0)">
      <g id="title" transform="translate(0 0)">
        <path id="path314895" d="m 382.96362,-52.632 c -4.248,-2.376 -9.072,-3.6 -14.472,-3.6 h -13.03199 c -1.08001,0 -1.94401,0.36 -2.66401,1.08 -0.72,0.72 -1.08,1.584 -1.08,2.664 v 48.744 c 0,1.08 0.36,1.944 1.08,2.664 0.72,0.72 1.584,1.08 2.66401,1.08 h 13.03199 c 5.4,0 10.224,-1.152 14.472,-3.6 4.17601,-2.376 7.488,-5.688 9.864,-10.008 2.304,-4.248 3.528,-9.072 3.528,-14.544 0,-5.4 -1.224,-10.224 -3.528,-14.472 -2.376,-4.248 -5.68799,-7.56 -9.864,-10.008 z m -3.816,43.272 c -3.168,1.872 -6.696,2.736 -10.656,2.736 h -9.288 v -42.984 h 9.288 c 3.96,0 7.488,0.936 10.656,2.736 3.168,1.872 5.616,4.392 7.344,7.632 1.728,3.312 2.664,6.984 2.664,11.088 0,4.176 -0.936,7.848 -2.664,11.16 -1.728,3.312 -4.176,5.832 -7.344,7.632 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(142.8125 43.814479999999996) scale(1.11) translate(-351.71562 56.232)"></path>
        <path id="path314897" d="m 424.30625,0.288 c 4.752,0 8.928,-1.44 12.6,-4.464 0.792,-0.576 1.152,-1.368 1.296,-2.304 0.072,-1.008 -0.144,-1.8 -0.792,-2.592 -0.576,-0.72 -1.368,-1.152 -2.304,-1.224 -0.936,-0.072 -1.8,0.144 -2.52,0.792 -2.448,1.944 -5.184,2.88 -8.28,2.88 -3.6,0 -6.696,-1.224 -9.216,-3.816 -2.592,-2.52 -3.816,-5.616 -3.816,-9.216 0,-3.6 1.224,-6.696 3.816,-9.288 2.52,-2.52 5.616,-3.816 9.216,-3.816 2.952,0 5.616,0.936 7.992,2.736 2.304,1.8 3.816,4.104 4.608,6.912 h -12.6 c -0.936,0 -1.8,0.36 -2.448,1.008 -0.648,0.648 -1.008,1.512 -1.008,2.448 0,0.936 0.36,1.8 1.008,2.448 0.648,0.648 1.512,1.008 2.448,1.008 h 16.56 c 0.936,0 1.728,-0.36 2.376,-1.008 0.72,-0.648 1.08,-1.512 1.08,-2.448 0,-5.544 -2.016,-10.224 -5.904,-14.112 -3.888,-3.888 -8.568,-5.904 -14.112,-5.904 -5.544,0 -10.224,2.016 -14.112,5.904 -3.888,3.888 -5.832,8.568 -5.832,14.112 0,5.544 1.944,10.224 5.832,14.112 3.888,3.888 8.568,5.832 14.112,5.832 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(201.25025930000004 62.19608) scale(1.11) translate(-404.36225 39.672)"></path>
        <path id="path314899" d="m 451.673,-55.224 c -0.72,0.72 -1.008,1.584 -1.008,2.592 v 39.312 c 0,2.592 0.432,4.896 1.368,6.912 0.864,2.016 2.16,3.6 3.816,4.752 1.656,1.152 3.528,1.656 5.616,1.656 h 0.144 c 1.44,0 2.592,-0.288 3.528,-1.008 0.864,-0.648 1.368,-1.512 1.368,-2.592 0,-1.008 -0.36,-1.872 -0.936,-2.592 -0.576,-0.648 -1.368,-1.008 -2.304,-1.008 h -1.8 c -1.08,0 -1.944,-0.576 -2.592,-1.728 -0.72,-1.152 -1.008,-2.592 -1.008,-4.392 v -39.312 c 0,-1.008 -0.36,-1.872 -1.008,-2.592 -0.72,-0.648 -1.584,-1.008 -2.592,-1.008 -1.08,0 -1.944,0.36 -2.592,1.008 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(252.64631180000006 43.814479999999996) scale(1.11) translate(-450.665 56.232)"></path>
        <path id="path314901" d="m 475.48925,-38.376 c -0.72,0.72 -1.008,1.584 -1.008,2.664 v 32.04 c 0,1.08 0.288,1.944 1.008,2.664 0.72,0.72 1.584,1.008 2.664,1.008 1.08,0 1.944,-0.288 2.664,-1.008 0.648,-0.72 1.008,-1.584 1.008,-2.664 v -32.04 c 0,-1.08 -0.36,-1.944 -1.008,-2.664 -0.72,-0.648 -1.584,-1.008 -2.664,-1.008 -1.08,0 -1.944,0.36 -2.664,1.008 z m 5.976,-15.48 c -0.936,-0.936 -2.016,-1.44 -3.312,-1.44 -1.296,0 -2.448,0.504 -3.384,1.44 -0.936,0.936 -1.368,2.016 -1.368,3.312 0,1.296 0.432,2.448 1.368,3.384 0.936,0.936 2.088,1.368 3.384,1.368 1.296,0 2.376,-0.432 3.312,-1.368 0.936,-0.936 1.44,-2.088 1.44,-3.384 0,-1.296 -0.504,-2.376 -1.44,-3.312 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(277.8835493 44.85343999999999) scale(1.11) translate(-473.40125 55.296)"></path>
        <path id="path314903" d="m 527.31012,-37.656 c -0.36,-0.504 -0.86399,-0.936 -1.43999,-1.224 -0.50401,-0.216 -1.08001,-0.36 -1.65601,-0.36 -0.64799,0 -1.22399,0.216 -1.79999,0.504 -0.57601,0.288 -0.93601,0.72 -1.22401,1.296 l -12.384,27 -12.528,-27 c -0.288,-0.576 -0.71999,-1.008 -1.224,-1.296 -0.576,-0.288 -1.07999,-0.504 -1.656,-0.504 -0.57599,0 -1.08,0.144 -1.512,0.36 -1.368,0.72 -2.016,1.656 -2.016,2.952 0,0.504 0.072,0.936 0.288,1.296 l 15.264,32.184 c 0.432,0.864 0.86401,1.512 1.44,1.872 0.504,0.36 1.152,0.504 2.016,0.504 1.44,0 2.592,-0.792 3.312,-2.376 l 15.264,-32.184 c 0.216,-0.432 0.36,-0.936 0.36,-1.368 0,-0.576 -0.216,-1.152 -0.504,-1.656 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(296.163995 62.675599999999996) scale(1.11) translate(-489.87012 39.24)"></path>
        <path id="path314905" d="m 550.5875,0.288 c 4.752,0 8.928,-1.44 12.6,-4.464 0.792,-0.576 1.152,-1.368 1.296,-2.304 0.072,-1.008 -0.144,-1.8 -0.792,-2.592 -0.576,-0.72 -1.368,-1.152 -2.304,-1.224 -0.936,-0.072 -1.8,0.144 -2.52,0.792 -2.448,1.944 -5.184,2.88 -8.28,2.88 -3.6,0 -6.696,-1.224 -9.216,-3.816 -2.592,-2.52 -3.816,-5.616 -3.816,-9.216 0,-3.6 1.224,-6.696 3.816,-9.288 2.52,-2.52 5.616,-3.816 9.216,-3.816 2.952,0 5.616,0.936 7.992,2.736 2.304,1.8 3.816,4.104 4.608,6.912 h -12.6 c -0.936,0 -1.8,0.36 -2.448,1.008 -0.648,0.648 -1.008,1.512 -1.008,2.448 0,0.936 0.36,1.8 1.008,2.448 0.648,0.648 1.512,1.008 2.448,1.008 h 16.56 c 0.936,0 1.728,-0.36 2.376,-1.008 0.72,-0.648 1.08,-1.512 1.08,-2.448 0,-5.544 -2.016,-10.224 -5.904,-14.112 -3.888,-3.888 -8.568,-5.904 -14.112,-5.904 -5.544,0 -10.224,2.016 -14.112,5.904 -3.888,3.888 -5.832,8.568 -5.832,14.112 0,5.544 1.944,10.224 5.832,14.112 3.888,3.888 8.568,5.832 14.112,5.832 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(341.42244680000005 62.19608) scale(1.11) translate(-530.6435 39.672)"></path>
        <path id="path314907" d="m 600.34625,-40.464 c -6.048,0 -11.16,2.16 -15.48,6.408 -4.248,4.248 -6.336,9.36 -6.336,15.408 v 15.192 c 0,1.008 0.288,1.8 1.008,2.448 0.648,0.72 1.44,1.008 2.448,1.008 0.936,0 1.728,-0.288 2.376,-1.008 0.72,-0.648 1.08,-1.44 1.08,-2.448 v -15.192 c 0,-4.104 1.44,-7.632 4.32,-10.512 2.952,-2.952 6.48,-4.392 10.584,-4.392 0.936,0 1.728,-0.36 2.448,-1.008 0.648,-0.72 1.008,-1.512 1.008,-2.448 0,-0.936 -0.36,-1.8 -1.008,-2.448 -0.72,-0.648 -1.512,-1.008 -2.448,-1.008 z" fill="#ff7100" stroke="#ff7100" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(394.5767393 61.316959999999995) scale(1.11) translate(-578.53025 40.464)"></path>
        <path id="path314909" d="m 656.16988,-5.256 -20.30401,-48.456 c -0.64799,-1.656 -1.8,-2.52 -3.528,-2.52 -1.656,0 -2.808,0.864 -3.52799,2.52 L 608.57787,-5.4 c -0.28799,0.648 -0.35999,1.224 -0.35999,1.656 0,1.08 0.28799,1.944 1.00799,2.664 0.72,0.72 1.58401,1.08 2.664,1.08 0.72,0 1.36801,-0.144 2.01601,-0.576 0.57599,-0.432 1.07999,-0.936 1.43999,-1.728 l 17.136,-41.904 16.84801,41.904 c 0.216,0.72 0.72,1.296 1.36799,1.728 0.648,0.432 1.296,0.576 2.08801,0.576 1.00799,0 1.94399,-0.36 2.664,-1.08 0.72,-0.72 1.07999,-1.584 1.07999,-2.592 0,-0.432 -0.14399,-0.936 -0.35999,-1.584 z" fill="#fd4a00" stroke="#fd4a00" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(427.5300085999999 43.814479999999996) scale(1.11) translate(-608.21788 56.232)"></path>
        <path id="path314911" d="m 665.82687,-55.152 c -0.72,0.72 -1.07999,1.584 -1.07999,2.664 v 48.744 c 0,1.08 0.35999,1.944 1.07999,2.664 0.72,0.72 1.58401,1.08 2.664,1.08 1.08,0 1.94401,-0.36 2.664,-1.08 0.72,-0.72 1.08,-1.584 1.08,-2.664 v -48.744 c 0,-1.08 -0.36,-1.944 -1.08,-2.664 -0.71999,-0.72 -1.584,-1.08 -2.664,-1.08 -1.07999,0 -1.944,0.36 -2.664,1.08 z" fill="#fd4e00" stroke="#fd4e00" strokeWidth="0" strokeLinejoin="miter" strokeMiterlimit="2" transform="translate(0 308.81692) translate(490.2771985999999 43.814479999999996) scale(1.11) translate(-664.74688 56.232)"></path>
      </g>
    </g>
  </svg>
);
