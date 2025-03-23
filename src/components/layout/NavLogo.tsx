
import React from 'react';
import { Link } from 'react-router-dom';
import { DeliveryIcon as AppLogo } from '@/components/icons/DeliveryIcon';

const NavLogo = () => {
  return (
    <Link 
      to="/" 
      className="flex items-center transition-all"
    >
      <div className="h-14 sm:h-12 w-auto">
        <AppLogo className="h-full w-auto" />
      </div>
    </Link>
  );
};

export default NavLogo;
