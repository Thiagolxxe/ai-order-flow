
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';

interface MobileMenuProps {
  isOpen: boolean;
  userRole: string | null;
  isAuthenticated: boolean;
}

const MobileMenu = ({ isOpen, userRole, isAuthenticated }: MobileMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 shadow-lg border-t animate-slide-down">
      <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
        <NavLinks userRole={userRole} isMobile={true} />
        
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
  );
};

export default MobileMenu;
