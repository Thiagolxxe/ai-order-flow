
import React from 'react';
import { Store } from 'lucide-react';

const RestaurantEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <Store className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nenhum restaurante encontrado</h3>
      <p className="text-muted-foreground">
        Tente ajustar seus filtros ou pesquisa para encontrar o que você está procurando.
      </p>
    </div>
  );
};

export default RestaurantEmptyState;
