
import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '@/components/ui/LogoIcon';

const NavLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-all"
    >
      <div className="h-16 w-48 flex items-center">
        <LogoIcon width="100%" height="100%" className="h-full w-full" />
      </div>
    </Link>
  );
};

export default NavLogo;
