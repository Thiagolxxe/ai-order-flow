import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputWithIcon } from "@/components/ui/input-with-icon";
import { SearchIcon, HeartIcon, StarIcon, Location } from "@/assets/icons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';

// Tipos
interface Restaurant {
  id: string;
  nome: string;
  banner_url?: string;
  logo_url?: string;
  tipo_cozinha?: string;
  rating?: number;
  reviews?: number;
  faixa_preco?: number;
  tempo_entrega_estimado?: number;
  cidade: string;
  estado: string;
}

// Componente de lista de restaurantes
const RestaurantList = ({ restaurants }: { restaurants: Restaurant[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {restaurants.map((restaurant) => (
        <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <Link to={`/restaurante/${restaurant.id}`}>
            <div className="h-48 overflow-hidden">
              <img 
                src={restaurant.banner_url || '/placeholder.svg'} 
                alt={restaurant.nome} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
          </Link>
          
          <CardContent className="pt-4">
            <div className="flex justify-between items-start mb-2">
              <Link to={`/restaurante/${restaurant.id}`} className="hover:underline">
                <h3 className="font-bold text-lg line-clamp-1">{restaurant.nome}</h3>
              </Link>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
              </Button>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <div className="flex items-center mr-4">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-medium">{restaurant.rating || '4.2'}</span>
                <span className="ml-1">({restaurant.reviews || '45'})</span>
              </div>
              <div className="flex items-center">
                <span>
                  {restaurant.tipo_cozinha || 'Brasileira'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Location className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">{restaurant.cidade}, {restaurant.estado}</span>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 pb-4 px-6">
            <div className="w-full flex justify-between items-center">
              <div className="flex gap-1">
                {'$$$'.slice(0, restaurant.faixa_preco || 2).split('').map((_, idx) => (
                  <span key={idx} className="text-green-600">$</span>
                ))}
                {'$$$'.slice(restaurant.faixa_preco || 2).split('').map((_, idx) => (
                  <span key={idx + 10} className="text-gray-300">$</span>
                ))}
              </div>
              <div className="text-sm">
                {restaurant.tempo_entrega_estimado 
                  ? `${restaurant.tempo_entrega_estimado} min` 
                  : '30-45 min'}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

// Componente de filtros - Fixed SelectItem components with empty values
const FilterSection = ({ 
  onFilterChange 
}: { 
  onFilterChange: (filters: any) => void 
}) => {
  const [cuisineType, setCuisineType] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("rating");
  
  useEffect(() => {
    onFilterChange({
      cuisineType,
      priceRange,
      sortBy
    });
  }, [cuisineType, priceRange, sortBy, onFilterChange]);
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <Select value={cuisineType} onValueChange={setCuisineType}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Tipo de Cozinha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="brasileira">Brasileira</SelectItem>
          <SelectItem value="italiana">Italiana</SelectItem>
          <SelectItem value="japonesa">Japonesa</SelectItem>
          <SelectItem value="fast-food">Fast Food</SelectItem>
          <SelectItem value="vegetariana">Vegetariana</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={priceRange} onValueChange={setPriceRange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Faixa de Preço" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="1">$ (Econômico)</SelectItem>
          <SelectItem value="2">$$ (Moderado)</SelectItem>
          <SelectItem value="3">$$$ (Premium)</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rating">Melhor Avaliação</SelectItem>
          <SelectItem value="delivery_time">Menor Tempo de Entrega</SelectItem>
          <SelectItem value="price_asc">Menor Preço</SelectItem>
          <SelectItem value="price_desc">Maior Preço</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// Página principal
const RestaurantsExplore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({});
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useUser();
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      try {
        // Aqui seria a chamada real para a API
        // Por enquanto, vamos usar dados de exemplo
        const mockRestaurants: Restaurant[] = [
          {
            id: '1',
            nome: 'Restaurante Sabor Brasileiro',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Brasileira',
            rating: 4.7,
            reviews: 128,
            faixa_preco: 2,
            tempo_entrega_estimado: 35,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '2',
            nome: 'Cantina Italiana',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Italiana',
            rating: 4.5,
            reviews: 96,
            faixa_preco: 3,
            tempo_entrega_estimado: 45,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '3',
            nome: 'Sushi Express',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Japonesa',
            rating: 4.8,
            reviews: 215,
            faixa_preco: 3,
            tempo_entrega_estimado: 40,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '4',
            nome: 'Burger King',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Fast Food',
            rating: 4.2,
            reviews: 320,
            faixa_preco: 1,
            tempo_entrega_estimado: 25,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '5',
            nome: 'Veggie Garden',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Vegetariana',
            rating: 4.6,
            reviews: 87,
            faixa_preco: 2,
            tempo_entrega_estimado: 35,
            cidade: 'São Paulo',
            estado: 'SP'
          },
          {
            id: '6',
            nome: 'Pizzaria Napolitana',
            banner_url: '/placeholder.svg',
            tipo_cozinha: 'Italiana',
            rating: 4.4,
            reviews: 156,
            faixa_preco: 2,
            tempo_entrega_estimado: 40,
            cidade: 'São Paulo',
            estado: 'SP'
          },
        ];
        
        // Simulando um atraso de rede
        setTimeout(() => {
          setRestaurants(mockRestaurants);
          setIsLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Erro ao buscar restaurantes:', error);
        toast({
          title: "Erro ao carregar restaurantes",
          description: "Não foi possível carregar a lista de restaurantes. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [toast]);
  
  // Filtragem de restaurantes com base nos filtros aplicados
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Filtro por termo de busca
    if (searchTerm && !restaurant.nome.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtro por tab
    if (activeTab === 'favorites' && !isAuthenticated) {
      return false; // Se não estiver autenticado, não mostra favoritos
    }
    
    // Aqui seriam aplicados os outros filtros (tipo de cozinha, faixa de preço, etc.)
    
    return true;
  });
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Explorar Restaurantes</h1>
      
      {/* Barra de pesquisa */}
      <div className="mb-6">
        <InputWithIcon
          placeholder="Buscar restaurantes, culinária ou pratos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<SearchIcon className="h-4 w-4" />}
          className="w-full max-w-xl"
        />
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="nearby">Próximos</TabsTrigger>
          <TabsTrigger value="popular">Populares</TabsTrigger>
          <TabsTrigger value="favorites" disabled={!isAuthenticated}>
            Favoritos
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filtros */}
      <FilterSection onFilterChange={setFilters} />
      
      {/* Resultados */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando restaurantes...</p>
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <>
          <p className="text-muted-foreground mb-6">
            {filteredRestaurants.length} restaurantes encontrados
          </p>
          <RestaurantList restaurants={filteredRestaurants} />
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-xl font-semibold mb-2">Nenhum restaurante encontrado</p>
          <p className="text-muted-foreground mb-6">
            Tente ajustar seus filtros ou termos de busca
          </p>
          <Button onClick={() => {
            setSearchTerm("");
            setActiveTab("all");
            setFilters({});
          }}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantsExplore;
