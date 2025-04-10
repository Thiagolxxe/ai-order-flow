
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu, User, Settings, HelpCircle, LogOut, Store, Home, ShoppingBag, Video, Flame } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string | null;
  isAuthenticated: boolean;
}

const MobileMenu = ({ isOpen, onOpenChange, userRole, isAuthenticated }: MobileMenuProps) => {
  const location = useLocation();
  const { pathname } = location;

  const navLinks = [
    { href: "/", label: "Início", icon: <Home className="h-5 w-5" /> },
    { href: "/restaurants", label: "Restaurantes", icon: <Store className="h-5 w-5" /> },
    { href: "/videos", label: "Vídeos", icon: <Flame className="h-5 w-5" /> },
    { href: "/promotions", label: "Promoções", icon: <ShoppingBag className="h-5 w-5" /> },
    { href: "/orders", label: "Meus Pedidos", icon: <Menu className="h-5 w-5" /> },
  ];

  const adminLinks = [
    { href: "/admin/restaurant", label: "Painel do Restaurante", icon: <Settings className="h-5 w-5" /> },
  ];

  const userLinks = [
    { href: "/profile", label: "Meu Perfil", icon: <User className="h-5 w-5" /> },
    { href: "/settings", label: "Configurações", icon: <Settings className="h-5 w-5" /> },
    { href: "/help", label: "Ajuda", icon: <HelpCircle className="h-5 w-5" /> },
    { href: "/logout", label: "Sair", icon: <LogOut className="h-5 w-5" /> },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navegue pelo DelivGo</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center py-3 px-4 hover:bg-accent/50 transition-colors",
                  link.href === pathname && "bg-accent/50 font-medium"
                )}
              >
                {link.icon}
                <span className="ml-3">{link.label}</span>
              </Link>
            ))}
            <Separator className="my-2" />
            <Link
              to="/restaurant-signup"
              className="flex items-center py-3 px-4 text-primary hover:bg-accent/50 transition-colors"
            >
              <Store className="h-5 w-5" />
              <span className="ml-3 font-medium">Cadastrar Restaurante</span>
            </Link>
            <Separator className="my-2" />
            {userRole === 'restaurante' && isAuthenticated && (
              <>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center py-3 px-4 hover:bg-accent/50 transition-colors",
                      link.href === pathname && "bg-accent/50 font-medium"
                    )}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </Link>
                ))}
                <Separator className="my-2" />
              </>
            )}
            {isAuthenticated && (
              <>
                {userLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "flex items-center py-3 px-4 hover:bg-accent/50 transition-colors",
                      link.href === pathname && "bg-accent/50 font-medium"
                    )}
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
