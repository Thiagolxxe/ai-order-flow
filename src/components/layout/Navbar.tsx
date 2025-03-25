
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import { MenuIcon, CloseIcon } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import NavLogo from './NavLogo';
import NavLinks from './NavLinks';
import UserActions from './UserActions';
import MobileMenu from './MobileMenu';

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
        <NavLogo />
        
        {/* Navegação Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLinks userRole={userRole || null} />
        </nav>
        
        {/* Lado direito - botões de autenticação ou menu do usuário */}
        <div className="flex items-center gap-3">
          <UserActions 
            isAuthenticated={isAuthenticated} 
            userRole={userRole} 
          />
          
          {/* Mobile menu trigger - removemos para usar o SheetTrigger do MobileMenu */}
        </div>
      </div>
      
      {/* Menu móvel */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        userRole={userRole} 
        isAuthenticated={isAuthenticated} 
      />
    </header>
  );
};

export default Navbar;
