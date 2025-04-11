
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Store } from 'lucide-react';
import NotificationIndicator from '@/components/notifications/NotificationIndicator';

interface UserActionsProps {
  isAuthenticated: boolean;
  userRole: string | null;
}

const UserActions = ({ isAuthenticated, userRole }: UserActionsProps) => {
  const { user, signOut } = useUser();
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <>
          <NotificationIndicator />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full" aria-label="Open user menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={user?.name || 'User'} />
                  <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4 mr-2" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              {userRole === 'restaurante' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/restaurant" className="flex items-center gap-2">
                    <Store className="h-4 w-4 mr-2" />
                    <span>Painel do Restaurante</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Cadastrar</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default UserActions;
