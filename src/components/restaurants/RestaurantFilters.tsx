
import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RestaurantFiltersProps {
  showSearch: boolean;
  showFilters: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const RestaurantFilters: React.FC<RestaurantFiltersProps> = ({
  showSearch,
  showFilters,
  searchTerm,
  setSearchTerm
}) => {
  if (!showSearch && !showFilters) return null;
  
  return (
    <>
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar restaurantes ou culinária..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>
          <Button size="sm" variant="outline">Mais próximos</Button>
          <Button size="sm" variant="outline">Melhor avaliação</Button>
          <Button size="sm" variant="outline">Menor preço</Button>
          <Button size="sm" variant="outline">Mais rápidos</Button>
        </div>
      )}
    </>
  );
};

export default RestaurantFilters;
