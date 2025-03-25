
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, Store, Tag, Package, User, LogOut, PlayCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  isOpen?: boolean;
  userRole?: string | null;
  isAuthenticated?: boolean;
}

const MobileMenu = ({ isOpen, userRole, isAuthenticated }: MobileMenuProps) => {
  const [open, setOpen] = useState(isOpen || false);
  const { user, logout } = useAuth();
  
  const handleLinkClick = () => {
    setOpen(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col h-full py-6">
          <div className="flex flex-col space-y-1 mb-8">
            <Link
              to="/"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={handleLinkClick}
            >
              <Home className="mr-3 h-5 w-5" />
              Início
            </Link>
            
            <Link
              to="/restaurantes"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={handleLinkClick}
            >
              <Store className="mr-3 h-5 w-5" />
              Restaurantes
            </Link>
            
            <Link
              to="/videos"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted text-primary transition-colors"
              onClick={handleLinkClick}
            >
              <PlayCircle className="mr-3 h-5 w-5" />
              Vídeos
            </Link>
            
            <Link
              to="/promocoes"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={handleLinkClick}
            >
              <Tag className="mr-3 h-5 w-5" />
              Promoções
            </Link>
            
            <Link
              to="/pedidos"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
              onClick={handleLinkClick}
            >
              <Package className="mr-3 h-5 w-5" />
              Meus Pedidos
            </Link>
          </div>
          
          <div className="mt-auto">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                  onClick={handleLinkClick}
                >
                  <User className="mr-3 h-5 w-5" />
                  Meu Perfil
                </Link>
                
                <button
                  className="w-full flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors text-left"
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center py-2 px-3 rounded-md hover:bg-muted transition-colors"
                onClick={handleLinkClick}
              >
                <User className="mr-3 h-5 w-5" />
                Entrar
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
