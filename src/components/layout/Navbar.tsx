
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUser } from '@/context/UserContext';
import NavLogo from './NavLogo';
import NavLinks from './NavLinks';
import UserActions from './UserActions';
import MobileMenu from './MobileMenu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role: userRole, isAuthenticated } = useUser();
  const location = useLocation();
  
  // Determine if we're on the video feed page to adjust styling
  const isVideoPage = location.pathname === '/videos';
  
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
  
  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4',
        isScrolled 
          ? 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-subtle' 
          : isVideoPage 
            ? 'bg-transparent' 
            : 'bg-white dark:bg-zinc-900'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <NavLogo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLinks />
        </nav>
        
        {/* Right side - authentication buttons or user menu */}
        <div className="flex items-center gap-3">
          <UserActions 
            isAuthenticated={isAuthenticated} 
            userRole={userRole} 
          />
        </div>
      </div>
      
      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        userRole={userRole || null} 
        isAuthenticated={isAuthenticated} 
      />
    </header>
  );
};

export default Navbar;
