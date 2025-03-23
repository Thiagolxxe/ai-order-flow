
import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '@/components/ui/LogoIcon';

const NavLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-all"
    >
      <div className="h-20 sm:h-16 w-auto">
        <LogoIcon className="h-full w-auto" width={400} height={400} />
      </div>
    </Link>
  );
};

export default NavLogo;
