
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
      <Link to="/restaurantes" className={linkClasses('/restaurantes')}>
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
      <Link to="/promocoes" className={linkClasses('/promocoes')}>
        Promoções
      </Link>
      <Link to="/pedidos" className={linkClasses('/pedidos')}>
        Meus Pedidos
      </Link>
      <Link to="/restaurante/cadastro" className={cn(
        linkClasses('/restaurante/cadastro'),
        "flex items-center gap-1 text-primary font-medium hover:text-primary/80"
      )}>
        <Store size={18} />
        Para Restaurantes
      </Link>
    </nav>
  );
};

export default NavLinks;
