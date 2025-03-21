import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ClockIcon, 
  ArrowRightIcon, 
  RestaurantIcon
} from '@/assets/icons';
import { Badge } from '@/components/ui/badge';

interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minOrder: string;
  featured?: boolean;
  isNew?: boolean;
  className?: string;
}

// Custom star icon component
const StarIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    fill="currentColor"
    className={className}
  >
    <path d="M12 2l2.2 6.6h7.1l-5.7 4.2 2.2 6.6-5.7-4.2-5.7 4.2 2.2-6.6L2.8 8.6h7.1z"/>
  </svg>
);

const RestaurantCard = ({
  id,
  name,
  image,
  cuisine,
  rating,
  deliveryTime,
  minOrder,
  featured = false,
  isNew = false,
  className
}: RestaurantCardProps) => {
  return (
    <Link 
      to={`/restaurant/${id}`}
      className={cn(
        'block group overflow-hidden rounded-xl card-hover',
        featured ? 'shadow-elevation-2' : 'shadow-elevation-1',
        className
      )}
    >
      <div className="relative">
        {/* Restaurant image */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img 
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {featured && (
            <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary/90">
              Featured
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500/90 text-white hover:bg-green-500/90">
              New
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Restaurant name and rating */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded text-sm">
            <StarIcon className="mr-1" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Cuisine type */}
        <p className="text-sm text-foreground/70 mb-3">{cuisine}</p>
        
        {/* Details */}
        <div className="flex justify-between items-center text-sm text-foreground/60">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{deliveryTime}</span>
          </div>
          <div>Min: {minOrder}</div>
        </div>
        
        {/* View button - only visible on hover */}
        <div className="mt-4 pt-3 border-t flex justify-end opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-primary font-medium text-sm flex items-center">
            View Menu <ArrowRightIcon className="ml-1 w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
