
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { CartItem, Restaurant } from '@/components/cart/types';

interface SuggestionsListProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => Promise<void>;
  restaurant: Restaurant | null;
  cartItems: CartItem[];
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({ 
  suggestions, 
  onSuggestionClick,
  restaurant,
  cartItems 
}) => {
  return (
    <ScrollArea className="h-full p-4">
      <div className="flex flex-col h-full">
        <h3 className="font-medium mb-3">Sugestões do assistente</h3>
        {suggestions.length > 0 ? (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => onSuggestionClick(suggestion)}
              >
                <span className="truncate">{suggestion}</span>
                <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Nenhuma sugestão disponível no momento.
          </p>
        )}
        
        {restaurant && (
          <div className="mt-6">
            <h4 className="font-medium mb-2 flex items-center">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Resumo do Pedido
            </h4>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-medium">{restaurant.nome}</p>
              {cartItems.length > 0 ? (
                <div className="mt-2 space-y-1 text-sm">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Seu carrinho está vazio
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default SuggestionsList;
