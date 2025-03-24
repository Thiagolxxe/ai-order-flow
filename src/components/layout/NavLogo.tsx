
import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '@/components/ui/LogoIcon';

const NavLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-all"
    >
      <div className="h-14 sm:h-16 md:h-20 w-56 sm:w-64 md:w-72 flex items-center">
        <LogoIcon className="h-full w-full" />
      </div>
    </Link>
  );
};

export default NavLogo;
