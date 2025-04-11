
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RestaurantListHeaderProps {
  title: string;
  maxItems?: number;
}

const RestaurantListHeader: React.FC<RestaurantListHeaderProps> = ({ 
  title,
  maxItems
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {!maxItems && (
        <Link to="/restaurants">
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </Link>
      )}
    </div>
  );
};

export default RestaurantListHeader;
