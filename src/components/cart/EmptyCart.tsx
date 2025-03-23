
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';

const EmptyCart: React.FC = () => {
  return (
    <div className="text-center py-16 bg-secondary/50 rounded-lg">
      <ShoppingBagIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-medium mb-2">Seu carrinho está vazio</h3>
      <p className="text-muted-foreground mb-8">Adicione itens ao seu carrinho para continuar</p>
      <Button asChild>
        <Link to="/">Explorar Restaurantes</Link>
      </Button>
    </div>
  );
};

export default EmptyCart;
