
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Bell, ShoppingCart, UserCircle, LogOut, Settings, Heart, ClipboardList } from 'lucide-react';
import RoleIndicator from './RoleIndicator';

interface UserActionsProps {
  isAuthenticated: boolean;
  userRole: string | null;
}

const UserActions: React.FC<UserActionsProps> = ({ isAuthenticated, userRole }) => {
  const { user, signOut } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link to="/login">Entrar</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Cadastrar</Link>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link to="/cart">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" asChild>
        <Link to="/favorites">
          <Heart className="h-5 w-5" />
        </Link>
      </Button>
      
      <Button variant="ghost" size="icon" asChild>
        <Link to="/notifications">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
      
      <Button variant="ghost" size="icon" asChild>
        <Link to="/cart">
          <ShoppingCart className="h-5 w-5" />
        </Link>
      </Button>
      
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
              <AvatarFallback>{getInitials(user?.name || "")}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || "Usuário"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              {userRole && <RoleIndicator role={userRole} />}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/orders" className="w-full cursor-pointer">
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>Meus Pedidos</span>
              </Link>
            </DropdownMenuItem>
            {userRole === 'restaurante' && (
              <DropdownMenuItem asChild>
                <Link to="/admin/restaurant" className="w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Painel do Restaurante</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserActions;
