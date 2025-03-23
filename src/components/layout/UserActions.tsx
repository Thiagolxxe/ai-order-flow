
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationIcon, UserIcon } from '@/assets/icons';
import RoleIndicator from './RoleIndicator';

interface UserActionsProps {
  isAuthenticated: boolean;
  userRole: string | null;
}

const UserActions = ({ isAuthenticated, userRole }: UserActionsProps) => {
  return (
    <div className="flex items-center gap-3">
      <RoleIndicator userRole={userRole} isAuthenticated={isAuthenticated} />
      
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
    </div>
  );
};

export default UserActions;
