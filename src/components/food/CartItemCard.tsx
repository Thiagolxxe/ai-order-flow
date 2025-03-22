
import React from 'react';
import { Button } from '@/components/ui/button';
import { MinusIcon, PlusIcon, Trash as TrashIcon } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartItemCardProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

// Default fallback image
const DEFAULT_ITEM_IMAGE = 'https://images.unsplash.com/photo-1546241072-48010ad2862c?q=80&w=500&auto=format&fit=crop';

const CartItemCard = ({ item, onIncrease, onDecrease, onRemove }: CartItemCardProps) => {
  // Safety check for item
  if (!item || typeof item.price !== 'number') {
    console.error("Invalid cart item or missing price:", item);
    return <div>Item data is invalid or incomplete</div>;
  }
  
  const totalPrice = item.price * item.quantity;
  
  // Validate image URL
  const [imageUrl, setImageUrl] = React.useState(
    item.image && (item.image.startsWith('http://') || item.image.startsWith('https://')) 
      ? item.image 
      : DEFAULT_ITEM_IMAGE
  );

  const handleImageError = () => {
    console.log('Cart item image failed to load:', imageUrl);
    setImageUrl(DEFAULT_ITEM_IMAGE);
  };
  
  return (
    <div className="flex items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0">
      {/* Imagem do produto */}
      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>
      
      {/* Detalhes do produto */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm font-semibold">
            R$ {item.price.toFixed(2).replace('.', ',')}
          </div>
          
          <div className="flex items-center">
            {/* Botão de remover (visível em telas pequenas) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 mr-2 text-muted-foreground hover:text-destructive sm:hidden"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
            
            {/* Controles de quantidade */}
            <div className="flex items-center border rounded-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={onDecrease}
                disabled={item.quantity <= 1}
                className="h-8 w-8 rounded-full"
              >
                <MinusIcon className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onIncrease}
                className="h-8 w-8 rounded-full"
              >
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preço total e botão de remover (visível em telas maiores) */}
      <div className="hidden sm:flex sm:flex-col sm:items-end gap-2">
        <div className="font-semibold">
          R$ {totalPrice.toFixed(2).replace('.', ',')}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Remover
        </Button>
      </div>
    </div>
  );
};

export default CartItemCard;
