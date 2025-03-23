import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { 
  UserIcon, 
  BagIcon, 
  MenuIcon, 
  CloseIcon, 
  RestaurantIcon, 
  DeliveryIcon, 
  NotificationIcon 
} from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { DeliveryIcon as AppLogo } from '@/components/icons/DeliveryIcon';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role: userRole, isAuthenticated } = useUser();
  const location = useLocation();
  
  // Lidar com o efeito de rolagem
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fechar menu móvel quando a rota muda
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
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
  
  // Renderizar indicador de função com base no papel do usuário
  const renderRoleIndicator = () => {
    if (!isAuthenticated) return null;
    
    const roleIcons = {
      cliente: <UserIcon className="w-4 h-4" />,
      restaurante: <RestaurantIcon className="w-4 h-4" />,
      entregador: <DeliveryIcon className="w-4 h-4" />,
    };
    
    const roleLabels = {
      cliente: 'Cliente',
      restaurante: 'Restaurante',
      entregador: 'Entregador',
    };
    
    const roleColors = {
      cliente: 'bg-blue-100 text-blue-700',
      restaurante: 'bg-green-100 text-green-700',
      entregador: 'bg-orange-100 text-orange-700',
    };
    
    if (!userRole || !(userRole in roleColors)) return null;
    
    return (
      <div className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5',
        roleColors[userRole as keyof typeof roleColors]
      )}>
        {roleIcons[userRole as keyof typeof roleIcons]}
        <span className="capitalize">{roleLabels[userRole as keyof typeof roleLabels]}</span>
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
        {/* Logo com tamanho ajustado */}
        <Link 
          to="/" 
          className="flex items-center transition-all"
        >
          <div className="h-10 sm:h-8 w-auto">
            <AppLogo className="h-full w-auto" />
          </div>
        </Link>
        
        {/* Navegação Desktop */}
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
        
        {/* Lado direito - botões de autenticação ou menu do usuário */}
        <div className="flex items-center gap-3">
          {renderRoleIndicator()}
          
          {isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full"
                asChild
              >
                <Link to="/notificacoes">
                  <NotificationIcon className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-secondary"
                asChild
              >
                <Link to="/perfil">
                  <UserIcon className="w-5 h-5" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/cadastro">Cadastrar</Link>
              </Button>
            </div>
          )}
          
          {/* Botão do menu móvel */}
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
      
      {/* Menu móvel */}
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
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/cadastro">Cadastrar</Link>
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
