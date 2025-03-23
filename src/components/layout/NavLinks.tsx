
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  name: string;
  path: string;
  isMobile?: boolean;
}

const NavLink = ({ name, path, isMobile = false }: NavLinkProps) => {
  const location = useLocation();
  
  return (
    <Link
      key={path}
      to={path}
      className={cn(
        'text-sm font-medium transition-all',
        isMobile 
          ? 'px-4 py-3 rounded-lg' 
          : 'px-4 py-2 rounded-full',
        location.pathname === path
          ? 'text-primary bg-primary/10' 
          : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
      )}
    >
      {name}
    </Link>
  );
};

interface NavLinksProps {
  userRole: string | null;
  isMobile?: boolean;
}

const NavLinks = ({ userRole, isMobile = false }: NavLinksProps) => {
  // Links de navegação baseados no papel do usuário
  const getNavLinks = () => {
    switch(userRole) {
      case 'restaurante':
        return [
          { name: 'Painel', path: '/restaurant/dashboard' },
          { name: 'Pedidos', path: '/restaurant/orders' },
          { name: 'Cardápio', path: '/restaurant/menu' },
          { name: 'Configurações', path: '/restaurant/settings' },
        ];
      case 'entregador':
        return [
          { name: 'Pedidos Disponíveis', path: '/delivery/orders' },
          { name: 'Minhas Entregas', path: '/delivery/my-deliveries' },
          { name: 'Ganhos', path: '/delivery/earnings' },
        ];
      case 'cliente':
      default:
        return [
          { name: 'Início', path: '/' },
          { name: 'Restaurantes', path: '/restaurantes' },
          { name: 'Pedidos', path: '/pedidos' },
          { name: 'Ajuda', path: '/ajuda' },
        ];
    }
  };
  
  const navLinks = getNavLinks();
  
  return (
    <>
      {navLinks.map((link) => (
        <NavLink 
          key={link.path}
          name={link.name} 
          path={link.path} 
          isMobile={isMobile} 
        />
      ))}
    </>
  );
};

export default NavLinks;
