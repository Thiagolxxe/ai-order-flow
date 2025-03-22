
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ClockIcon, 
  ArrowRightIcon, 
  RestaurantIcon,
  StarIcon
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

// Default placeholder image for restaurants
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=128&auto=format&fit=crop';

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
  // Ensure image has a valid URL
  const imageUrl = image || DEFAULT_IMAGE;

  return (
    <Link 
      to={`/restaurante/${id}`}
      className={cn(
        'block group overflow-hidden rounded-xl card-hover',
        featured ? 'shadow-elevation-2' : 'shadow-elevation-1',
        className
      )}
    >
      <div className="relative">
        {/* Imagem do restaurante */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          <img 
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = DEFAULT_IMAGE;
            }}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {featured && (
            <Badge className="bg-primary/90 text-primary-foreground hover:bg-primary/90">
              Destaque
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500/90 text-white hover:bg-green-500/90">
              Novo
            </Badge>
          )}
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="p-4">
        {/* Nome do restaurante e avaliação */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="flex items-center text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded text-sm">
            <StarIcon className="mr-1 w-4 h-4" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Tipo de culinária */}
        <p className="text-sm text-foreground/70 mb-3">{cuisine}</p>
        
        {/* Detalhes */}
        <div className="flex justify-between items-center text-sm text-foreground/60">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>{deliveryTime}</span>
          </div>
          <div>Mín: {minOrder}</div>
        </div>
        
        {/* Botão Ver - apenas visível ao passar o mouse */}
        <div className="mt-4 pt-3 border-t flex justify-end opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-primary font-medium text-sm flex items-center">
            Ver Cardápio <ArrowRightIcon className="ml-1 w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
