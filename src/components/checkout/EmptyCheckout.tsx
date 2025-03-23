
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EmptyCheckout: React.FC = () => {
  return (
    <div className="container px-4 py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Dados do pedido não encontrados</h2>
      <p className="mb-6">Volte para o carrinho e tente novamente.</p>
      <Button asChild>
        <Link to="/carrinho">Voltar para o carrinho</Link>
      </Button>
    </div>
  );
};

export default EmptyCheckout;
