
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: {
    id: string;
    user: string;
    date: string;
    rating: number;
    comment: string;
    order?: string;
    images?: string[];
    reply?: string;
  };
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{review.user}</h3>
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
            <StarRating rating={review.rating} readOnly size="small" />
          </div>
          {review.order && (
            <Badge variant="outline" className="text-xs">
              Pedido #{review.order}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-foreground/80 mb-2">
          {review.comment}
        </p>
        
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-4">
            {review.images.map((image: string, index: number) => (
              <div key={index} className="w-20 h-20 rounded-md overflow-hidden">
                <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
        
        {review.reply && (
          <div className="mt-4 bg-muted/50 p-3 rounded-md">
            <div className="text-sm font-medium mb-1">Resposta do restaurante:</div>
            <p className="text-sm text-foreground/80">{review.reply}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
