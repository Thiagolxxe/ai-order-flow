
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusIcon, MinusIcon, Flame, Leaf } from 'lucide-react';
import ImageWithFallback from '@/components/ui/image-with-fallback';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageUrl?: string; // Added for compatibility with Menu.tsx
  category?: string;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
}

export interface MenuItemCardProps {
  item?: MenuItem;
  id?: string; // For direct props passing from Menu.tsx
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onAddToCart?: () => void; // Added for compatibility with Menu.tsx
}

// Default fallback image
const DEFAULT_ITEM_IMAGE = 'https://images.unsplash.com/photo-1546241072-48010ad2862c?q=80&w=500&auto=format&fit=crop';

const MenuItemCard: React.FC<MenuItemCardProps> = (props) => {
  // Initialize with default empty object if props.item is undefined
  const item = props.item || {
    id: props.id || '',
    name: props.name || '',
    description: props.description || '',
    price: props.price || 0,
    image: props.image || props.imageUrl || '',
    category: props.category || '',
    popular: props.popular || false,
    vegetarian: props.vegetarian || false,
    spicy: props.spicy || false
  };

  // Ensure we have a valid item with a price before proceeding
  if (!item || typeof item.price !== 'number') {
    console.error("Invalid menu item or missing price:", item);
    return <div>Item data is invalid or incomplete</div>;
  }

  const quantity = props.quantity || 0;
  const onAdd = props.onAdd || props.onAddToCart || (() => {});
  const onRemove = props.onRemove || (() => {});
  
  const formattedPrice = item.price.toFixed(2).replace('.', ',');
  
  // Use imageUrl if provided as a direct prop, or use item.image
  const imageUrl = props.imageUrl || item.image || DEFAULT_ITEM_IMAGE;
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Imagem do item */}
        <div className="md:w-1/3 aspect-square md:aspect-auto">
          <ImageWithFallback
            src={imageUrl}
            fallbackSrc={DEFAULT_ITEM_IMAGE}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Detalhes do item */}
        <CardContent className="flex-1 p-4">
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Nome e badges */}
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{item.name}</h3>
                <div className="flex gap-1">
                  {item.vegetarian && (
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30">
                      <Leaf className="mr-1 h-3 w-3" />
                      Veg
                    </Badge>
                  )}
                  {item.spicy && (
                    <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30">
                      <Flame className="mr-1 h-3 w-3" />
                      Picante
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Descrição */}
              <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{item.description}</p>
            </div>
            
            {/* Preço e botões de ação */}
            <div className="flex justify-between items-center mt-2">
              <span className="font-semibold">R$ {formattedPrice}</span>
              
              {/* Botões de adicionar/remover */}
              <div className="flex items-center">
                {quantity > 0 ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={onRemove}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="mx-2 font-medium w-4 text-center">{quantity}</span>
                    <Button 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={onAdd}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={onAdd}
                    className="rounded-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MenuItemCard;
