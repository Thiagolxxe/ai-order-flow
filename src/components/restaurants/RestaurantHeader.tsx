
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RestaurantHeaderProps {
  name: string;
  cuisine: string;
  rating: number;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ name, cuisine, rating }) => {
  return (
    <CardHeader>
      <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      <CardDescription className="flex items-center justify-between">
        <Badge variant="secondary">{cuisine}</Badge>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span>{rating.toFixed(1)}</span>
        </div>
      </CardDescription>
    </CardHeader>
  );
};

export default RestaurantHeader;
