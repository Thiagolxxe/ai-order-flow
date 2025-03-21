
import React, { useState } from 'react';
import RestaurantCard from './RestaurantCard';
import { cn } from '@/lib/utils';
import { SearchIcon, RestaurantIcon } from '@/assets/icons';
import { Input } from '@/components/ui/input';

// Dados de exemplo de restaurantes
const restaurants = [
  {
    id: '1',
    name: 'Urban Burger Bistro',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Hambúrgueres, Americana',
    rating: 4.8,
    deliveryTime: '20-35 min',
    minOrder: 'R$25',
    featured: true,
    isNew: false,
  },
  {
    id: '2',
    name: 'Sake Sushi House',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Japonesa, Sushi',
    rating: 4.9,
    deliveryTime: '25-40 min',
    minOrder: 'R$30',
    featured: false,
    isNew: true,
  },
  {
    id: '3',
    name: 'Pasta Paradise',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Italiana, Massas',
    rating: 4.5,
    deliveryTime: '30-45 min',
    minOrder: 'R$28',
    featured: false,
    isNew: false,
  },
  {
    id: '4',
    name: 'Taco Fiesta',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Mexicana, Tacos',
    rating: 4.6,
    deliveryTime: '15-30 min',
    minOrder: 'R$20',
    featured: true,
    isNew: false,
  },
  {
    id: '5',
    name: 'Green Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Saudável, Saladas',
    rating: 4.7,
    deliveryTime: '15-25 min',
    minOrder: 'R$22',
    featured: false,
    isNew: true,
  },
  {
    id: '6',
    name: 'Spice of India',
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?q=80&w=1600&auto=format&fit=crop',
    cuisine: 'Indiana, Curry',
    rating: 4.4,
    deliveryTime: '35-50 min',
    minOrder: 'R$35',
    featured: false,
    isNew: false,
  }
];

// Filtros de categorias
const cuisineFilters = [
  'Todos',
  'Americana',
  'Japonesa',
  'Italiana',
  'Mexicana',
  'Saudável',
  'Indiana'
];

interface RestaurantListProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

const RestaurantList = ({
  title = 'Restaurantes Próximos de Você',
  subtitle,
  maxItems = restaurants.length,
  showFilters = true,
  showSearch = true,
  className
}: RestaurantListProps) => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtrar restaurantes com base no filtro ativo e consulta de pesquisa
  const filteredRestaurants = restaurants
    .filter(restaurant => 
      activeFilter === 'Todos' || restaurant.cuisine.includes(activeFilter)
    )
    .filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, maxItems);
  
  return (
    <div className={cn('', className)}>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-foreground/70 mt-1">{subtitle}</p>}
      </div>
      
      {/* Filtros e pesquisa */}
      {(showFilters || showSearch) && (
        <div className="mb-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
          {/* Filtros de culinária */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {cuisineFilters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full transition-all',
                    activeFilter === filter
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
          
          {/* Pesquisa */}
          {showSearch && (
            <div className="relative max-w-xs w-full">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar restaurantes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Grade de restaurantes */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              {...restaurant}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-secondary/50 rounded-lg">
          <RestaurantIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-lg font-medium">Nenhum restaurante encontrado</h3>
          <p className="text-muted-foreground">Tente ajustar seus critérios de busca ou filtro</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
