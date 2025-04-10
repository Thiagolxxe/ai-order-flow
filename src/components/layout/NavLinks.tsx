
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PlayCircle, Flame, Store } from 'lucide-react';

const NavLinks = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    // Check if current path is the same as the given path
    if (location.pathname === path) {
      return true;
    }
    
    // Check for portuguese route equivalents
    const portugueseMap: Record<string, string> = {
      '/restaurants': '/restaurantes',
      '/profile': '/perfil',
      '/videos': '/video-feed',
      '/promotions': '/promocoes',
      '/orders': '/pedidos',
      '/restaurant-signup': '/restaurante/cadastro'
    };
    
    // If current path is a portuguese equivalent
    if (portugueseMap[path] === location.pathname) {
      return true;
    }
    
    // Check if path is a prefix (except for root path)
    return path !== '/' && location.pathname.startsWith(path);
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
      <Link to="/videos" className={cn(
        linkClasses('/videos'),
        "flex items-center gap-1",
        isActive('/videos') ? "text-primary" : "text-muted-foreground hover:text-primary"
      )}>
        <Flame size={18} className={isActive('/videos') ? "text-primary animate-pulse" : ""} />
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
