
import React, { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';
import { cn } from '@/lib/utils';
import { SearchIcon, RestaurantIcon } from '@/assets/icons';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  nome: string;
  logo_url: string;
  banner_url?: string;
  tipo_cozinha: string;
  taxa_entrega: number;
  valor_pedido_minimo: number;
  tempo_entrega_estimado: number;
  faixa_preco: number;
  featured?: boolean;
  isNew?: boolean;
}

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

// Default placeholder images for restaurants
const DEFAULT_LOGO_URL = 'https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=128&auto=format&fit=crop';

const RestaurantList = ({
  title = 'Restaurantes Próximos de Você',
  subtitle,
  maxItems = 100,
  showFilters = true,
  showSearch = true,
  className
}: RestaurantListProps) => {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Buscar restaurantes do Supabase
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('restaurantes')
          .select('*')
          .eq('ativo', true);
        
        if (error) {
          throw error;
        }
        
        // Process restaurant data and ensure valid UUIDs
        const formattedData = data.map(restaurant => {
          // Check if ID is a valid UUID
          if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(restaurant.id)) {
            console.warn(`Restaurant with invalid UUID format: ${restaurant.id}, ${restaurant.nome}`);
          }
          
          // Ensure logo_url has a value or use placeholder
          const logoUrl = restaurant.logo_url || DEFAULT_LOGO_URL;
          
          return {
            id: restaurant.id,
            nome: restaurant.nome,
            logo_url: logoUrl,
            tipo_cozinha: restaurant.tipo_cozinha || 'Variada',
            taxa_entrega: restaurant.taxa_entrega || 0,
            valor_pedido_minimo: restaurant.valor_pedido_minimo || 0,
            tempo_entrega_estimado: restaurant.tempo_entrega_estimado || 30,
            faixa_preco: restaurant.faixa_preco || 2,
            featured: Math.random() > 0.7, // Exemplo: alguns restaurantes são destacados aleatoriamente
            isNew: restaurant.criado_em && (new Date(restaurant.criado_em)).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // É novo se foi criado nos últimos 30 dias
          };
        });
        
        setRestaurants(formattedData);
      } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
        toast.error('Não foi possível carregar os restaurantes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);
  
  // Filtrar restaurantes com base no filtro ativo e consulta de pesquisa
  const filteredRestaurants = restaurants
    .filter(restaurant => 
      activeFilter === 'Todos' || restaurant.tipo_cozinha.includes(activeFilter)
    )
    .filter(restaurant =>
      restaurant.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.tipo_cozinha.toLowerCase().includes(searchQuery.toLowerCase())
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
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="h-72 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.nome}
              image={restaurant.logo_url}
              cuisine={restaurant.tipo_cozinha}
              rating={4.5 + Math.random() * 0.5} // Exemplo: rating aleatório entre 4.5 e 5.0
              deliveryTime={`${restaurant.tempo_entrega_estimado-10}-${restaurant.tempo_entrega_estimado} min`}
              minOrder={`R$${restaurant.valor_pedido_minimo.toFixed(2).replace('.', ',')}`}
              featured={restaurant.featured}
              isNew={restaurant.isNew}
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
