
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PlayCircle, Flame, Store } from 'lucide-react';

const NavLinks = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ||
           (path !== '/' && location.pathname.startsWith(path));
  };
  
  const linkClasses = (path: string) => cn(
    "text-sm font-medium transition-colors",
    isActive(path) 
      ? "text-foreground" 
      : "text-muted-foreground hover:text-foreground"
  );
  
  return (
    <nav className="hidden md:flex items-center gap-6">
      <Link to="/" className={linkClasses('/')}>
        Início
      </Link>
      <Link to="/restaurants" className={linkClasses('/restaurants')}>
        Restaurantes
      </Link>
      <Link to="/video-feed" className={cn(
        linkClasses('/video-feed'),
        "flex items-center gap-1",
        isActive('/video-feed') ? "text-primary" : "text-muted-foreground hover:text-primary"
      )}>
        <Flame size={18} className={isActive('/video-feed') ? "text-primary animate-pulse" : ""} />
        Vídeos
      </Link>
      <Link to="/promotions" className={linkClasses('/promotions')}>
        Promoções
      </Link>
      <Link to="/orders" className={linkClasses('/orders')}>
        Meus Pedidos
      </Link>
      <Link to="/restaurant-signup" className={cn(
        linkClasses('/restaurant-signup'),
        "flex items-center gap-1 text-primary font-medium hover:text-primary/80"
      )}>
        <Store size={18} />
        Para Restaurantes
      </Link>
    </nav>
  );
};

export default NavLinks;
