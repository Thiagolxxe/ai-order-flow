
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StarIcon } from '@/assets/icons';
import StarRating from './StarRating';

interface RatingDistributionProps {
  avgRating: number;
  totalReviews: number;
  distribution: {
    [key: number]: number;
  };
}

const RatingDistribution: React.FC<RatingDistributionProps> = ({ 
  avgRating, 
  totalReviews, 
  distribution 
}) => {
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className="text-4xl font-bold">{avgRating}</span>
                <StarRating rating={Math.round(avgRating)} readOnly />
              </div>
              <p className="text-sm text-muted-foreground">
                Baseado em {totalReviews} avaliações
              </p>
            </div>
          </div>
          
          <div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <div className="w-12 flex items-center">
                    <span className="text-sm">{star}</span>
                    <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500 ml-1" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${(distribution[star] / totalReviews) * 100}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm text-muted-foreground">
                    {distribution[star]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingDistribution;
