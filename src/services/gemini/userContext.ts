import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '@/components/ui/LogoIcon';

const NavLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-all"
    >
      <div className="h-12 sm:h-14 md:h-16 w-40 sm:w-48 md:w-56 flex items-center">
        <LogoIcon className="h-full w-full" />
      </div>
    </Link>
  );
};

export default NavLogo;
