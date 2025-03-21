
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { 
  LogoIcon, 
  UserIcon, 
  BagIcon, 
  MenuIcon, 
  CloseIcon, 
  RestaurantIcon, 
  DeliveryIcon, 
  NotificationIcon 
} from '@/assets/icons';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userRole, isAuthenticated } = useUser();
  const location = useLocation();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Navigation links based on user role
  const getNavLinks = () => {
    switch(userRole) {
      case 'restaurant':
        return [
          { name: 'Dashboard', path: '/restaurant/dashboard' },
          { name: 'Orders', path: '/restaurant/orders' },
          { name: 'Menu', path: '/restaurant/menu' },
          { name: 'Settings', path: '/restaurant/settings' },
        ];
      case 'delivery':
        return [
          { name: 'Available Orders', path: '/delivery/orders' },
          { name: 'My Deliveries', path: '/delivery/my-deliveries' },
          { name: 'Earnings', path: '/delivery/earnings' },
        ];
      case 'customer':
      default:
        return [
          { name: 'Home', path: '/' },
          { name: 'Restaurants', path: '/restaurants' },
          { name: 'Orders', path: '/orders' },
          { name: 'Help', path: '/help' },
        ];
    }
  };
  
  const navLinks = getNavLinks();
  
  // Render role indicator based on user role
  const renderRoleIndicator = () => {
    if (!isAuthenticated) return null;
    
    const roleIcons = {
      customer: <UserIcon className="w-4 h-4" />,
      restaurant: <RestaurantIcon className="w-4 h-4" />,
      delivery: <DeliveryIcon className="w-4 h-4" />,
    };
    
    const roleColors = {
      customer: 'bg-blue-100 text-blue-700',
      restaurant: 'bg-green-100 text-green-700',
      delivery: 'bg-orange-100 text-orange-700',
    };
    
    return (
      <div className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5',
        roleColors[userRole as keyof typeof roleColors]
      )}>
        {roleIcons[userRole as keyof typeof roleIcons]}
        <span className="capitalize">{userRole}</span>
      </div>
    );
  };
  
  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4',
        isScrolled 
          ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-subtle' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-semibold transition-all"
        >
          <LogoIcon className="w-8 h-8 text-primary" />
          <span className="hidden sm:inline">DeliverAI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                location.pathname === link.path
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* Right side - auth buttons or user menu */}
        <div className="flex items-center gap-3">
          {renderRoleIndicator()}
          
          {isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
              >
                <NotificationIcon className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-secondary"
              >
                <UserIcon className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 shadow-lg border-t animate-slide-down">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm font-medium transition-all',
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10' 
                    : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {!isAuthenticated && (
              <div className="pt-4 mt-2 border-t flex flex-col gap-3">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
