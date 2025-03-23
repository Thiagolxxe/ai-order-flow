
import React from 'react';

const CartSkeleton: React.FC = () => {
  return (
    <div className="container px-4 py-8">
      <div className="h-8 bg-muted animate-pulse rounded mb-6 w-1/3"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-40 bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-40 bg-muted animate-pulse rounded"></div>
        </div>
        <div>
          <div className="h-60 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
