
import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '@/assets/icons';

const NavLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-all"
    >
      <div className="h-10 sm:h-8 w-auto">
        <LogoIcon className="h-full w-auto" />
      </div>
    </Link>
  );
};

export default NavLogo;
