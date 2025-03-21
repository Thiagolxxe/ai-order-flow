
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
      case 'restaurant':
        return [
          { name: 'Painel', path: '/restaurant/dashboard' },
          { name: 'Pedidos', path: '/restaurant/orders' },
          { name: 'Cardápio', path: '/restaurant/menu' },
          { name: 'Configurações', path: '/restaurant/settings' },
        ];
      case 'delivery':
        return [
          { name: 'Pedidos Disponíveis', path: '/delivery/orders' },
          { name: 'Minhas Entregas', path: '/delivery/my-deliveries' },
          { name: 'Ganhos', path: '/delivery/earnings' },
        ];
      case 'customer':
      default:
        return [
          { name: 'Início', path: '/' },
          { name: 'Restaurantes', path: '/restaurants' },
          { name: 'Pedidos', path: '/orders' },
          { name: 'Ajuda', path: '/help' },
        ];
    }
  };
  
  const navLinks = getNavLinks();
  
  // Renderizar indicador de função com base no papel do usuário
  const renderRoleIndicator = () => {
    if (!isAuthenticated) return null;
    
    const roleIcons = {
      customer: <UserIcon className="w-4 h-4" />,
      restaurant: <RestaurantIcon className="w-4 h-4" />,
      delivery: <DeliveryIcon className="w-4 h-4" />,
    };
    
    const roleLabels = {
      customer: 'Cliente',
      restaurant: 'Restaurante',
      delivery: 'Entregador',
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
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-semibold transition-all"
        >
          <LogoIcon className="w-8 h-8 text-primary" />
          <span className="hidden sm:inline">DeliverAI</span>
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
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Cadastrar</Link>
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
                  <Link to="/signup">Cadastrar</Link>
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
