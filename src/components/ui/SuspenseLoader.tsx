
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface SuspenseLoaderProps {
  children: React.ReactNode;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({ children }) => {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="space-y-4 w-full max-w-sm px-4">
          <Skeleton className="h-[70vh] w-full bg-gray-800 rounded-lg" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24 bg-gray-800" />
            <Skeleton className="h-10 w-24 bg-gray-800" />
          </div>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
};

export default SuspenseLoader;
