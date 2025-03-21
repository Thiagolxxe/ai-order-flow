
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  SearchIcon, 
  RestaurantIcon,
  ClockIcon
} from '@/assets/icons';
import RestaurantCard from '@/components/restaurants/RestaurantCard';

// Dados fictícios para demonstração
const mockRestaurants = [
  {
    id: '1',
    name: 'Urban Burger Bistro',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Hambúrgueres',
    rating: 4.7,
    deliveryTime: '30-45 min',
    minOrder: 'R$ 25,00',
    priceRange: 2,
    distance: 1.3,
    featured: true,
    isNew: false,
    cuisineType: ['burgers', 'american'],
    offers: ['discount', 'freeshipping']
  },
  {
    id: '2',
    name: 'Sushi Express',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Japonesa',
    rating: 4.5,
    deliveryTime: '40-55 min',
    minOrder: 'R$ 40,00',
    priceRange: 3,
    distance: 2.5,
    featured: false,
    isNew: true,
    cuisineType: ['japanese', 'asian'],
    offers: []
  },
  {
    id: '3',
    name: 'Pizza Delícia',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Pizzaria',
    rating: 4.3,
    deliveryTime: '35-50 min',
    minOrder: 'R$ 30,00',
    priceRange: 2,
    distance: 0.8,
    featured: false,
    isNew: false,
    cuisineType: ['pizza', 'italian'],
    offers: ['discount']
  },
  {
    id: '4',
    name: 'Bella Pasta',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Italiana',
    rating: 4.8,
    deliveryTime: '45-60 min',
    minOrder: 'R$ 35,00',
    priceRange: 3,
    distance: 3.1,
    featured: true,
    isNew: false,
    cuisineType: ['italian', 'pasta'],
    offers: ['freeshipping']
  },
  {
    id: '5',
    name: 'Veggie Garden',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Vegetariana',
    rating: 4.6,
    deliveryTime: '25-40 min',
    minOrder: 'R$ 28,00',
    priceRange: 2,
    distance: 1.9,
    featured: false,
    isNew: true,
    cuisineType: ['vegetarian', 'healthy'],
    offers: ['discount', 'freeshipping']
  },
  {
    id: '6',
    name: 'Taco Fiesta',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=500&auto=format&fit=crop',
    cuisine: 'Mexicana',
    rating: 4.2,
    deliveryTime: '30-45 min',
    minOrder: 'R$ 20,00',
    priceRange: 1,
    distance: 2.7,
    featured: false,
    isNew: false,
    cuisineType: ['mexican', 'tacos'],
    offers: []
  }
];

// Componente para exibir estrelas de preço
const PriceRange = ({ range }: { range: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3].map((num) => (
        <span 
          key={num} 
          className={`text-sm ${num <= range ? 'text-foreground' : 'text-muted-foreground/40'}`}
        >
          $
        </span>
      ))}
    </div>
  );
};

const RestaurantsExplore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [maxDistance, setMaxDistance] = useState(5);
  const [minRating, setMinRating] = useState(0);
  const [priceRange, setPriceRange] = useState<number[]>([1, 3]);
  const [sortBy, setSortBy] = useState<string>('rating');
  
  // Tipos de culinária para filtro
  const cuisineTypes = [
    { id: 'burgers', name: 'Hambúrgueres' },
    { id: 'pizza', name: 'Pizza' },
    { id: 'japanese', name: 'Japonesa' },
    { id: 'italian', name: 'Italiana' },
    { id: 'mexican', name: 'Mexicana' },
    { id: 'vegetarian', name: 'Vegetariana' },
    { id: 'asian', name: 'Asiática' },
    { id: 'healthy', name: 'Saudável' }
  ];
  
  // Ofertas para filtro
  const offerTypes = [
    { id: 'discount', name: 'Desconto' },
    { id: 'freeshipping', name: 'Frete Grátis' }
  ];

  // Filtrar restaurantes
  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    // Filtro por termo de busca
    if (searchTerm && !restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtro por distância
    if (restaurant.distance > maxDistance) {
      return false;
    }
    
    // Filtro por avaliação
    if (restaurant.rating < minRating) {
      return false;
    }
    
    // Filtro por faixa de preço
    if (restaurant.priceRange < priceRange[0] || restaurant.priceRange > priceRange[1]) {
      return false;
    }
    
    // Filtros de culinária
    const activeCuisineFilters = cuisineTypes
      .filter(c => activeFilters[c.id])
      .map(c => c.id);
    
    if (activeCuisineFilters.length > 0 && 
        !restaurant.cuisineType.some(c => activeCuisineFilters.includes(c))) {
      return false;
    }
    
    // Filtros de ofertas
    const activeOfferFilters = offerTypes
      .filter(o => activeFilters[o.id])
      .map(o => o.id);
    
    if (activeOfferFilters.length > 0 && 
        !restaurant.offers.some(o => activeOfferFilters.includes(o))) {
      return false;
    }
    
    return true;
  });

  // Ordenar restaurantes
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return a.distance - b.distance;
      case 'deliveryTime':
        // Simplificação: usar apenas o primeiro número do intervalo de tempo
        const timeA = parseInt(a.deliveryTime.split('-')[0]);
        const timeB = parseInt(b.deliveryTime.split('-')[0]);
        return timeA - timeB;
      case 'priceAsc':
        return a.priceRange - b.priceRange;
      case 'priceDesc':
        return b.priceRange - a.priceRange;
      default:
        return 0;
    }
  });

  // Atualizar filtros
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }));
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
    setMaxDistance(5);
    setMinRating(0);
    setPriceRange([1, 3]);
    setSortBy('rating');
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Explorar Restaurantes</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Barra lateral de filtros */}
        <Card className="lg:sticky lg:top-20 h-fit">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
            
            {/* Busca */}
            <div className="mb-6">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar restaurantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Ordenação */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Ordenar por</h3>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={sortBy === 'rating' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('rating')}
                >
                  Avaliação
                </Button>
                <Button 
                  variant={sortBy === 'distance' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('distance')}
                >
                  Distância
                </Button>
                <Button 
                  variant={sortBy === 'deliveryTime' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('deliveryTime')}
                >
                  Tempo
                </Button>
                <Button 
                  variant={sortBy === 'priceAsc' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('priceAsc')}
                >
                  Preço: Menor
                </Button>
                <Button 
                  variant={sortBy === 'priceDesc' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setSortBy('priceDesc')}
                >
                  Preço: Maior
                </Button>
              </div>
            </div>
            
            {/* Distância máxima */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Distância</h3>
                <span className="text-sm text-muted-foreground">
                  até {maxDistance} km
                </span>
              </div>
              <Slider
                value={[maxDistance]}
                min={0.5}
                max={10}
                step={0.5}
                onValueChange={(values) => setMaxDistance(values[0])}
              />
            </div>
            
            {/* Avaliação mínima */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Avaliação Mínima</h3>
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500 mr-1" />
                  <span className="text-sm text-muted-foreground">
                    {minRating.toFixed(1)}+
                  </span>
                </div>
              </div>
              <Slider
                value={[minRating]}
                min={0}
                max={5}
                step={0.5}
                onValueChange={(values) => setMinRating(values[0])}
              />
            </div>
            
            {/* Faixa de preço */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Faixa de Preço</h3>
                <div className="flex">
                  <PriceRange range={priceRange[1]} />
                </div>
              </div>
              <Slider
                value={priceRange}
                min={1}
                max={3}
                step={1}
                onValueChange={(values) => setPriceRange(values)}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Econômico</span>
                <span>Moderado</span>
                <span>Premium</span>
              </div>
            </div>
            
            {/* Tipos de culinária */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Tipo de Culinária</h3>
              <div className="space-y-2">
                {cuisineTypes.map((cuisine) => (
                  <div key={cuisine.id} className="flex items-center">
                    <Checkbox
                      id={`cuisine-${cuisine.id}`}
                      checked={activeFilters[cuisine.id] || false}
                      onCheckedChange={() => toggleFilter(cuisine.id)}
                    />
                    <label
                      htmlFor={`cuisine-${cuisine.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cuisine.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ofertas */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Ofertas</h3>
              <div className="space-y-2">
                {offerTypes.map((offer) => (
                  <div key={offer.id} className="flex items-center">
                    <Checkbox
                      id={`offer-${offer.id}`}
                      checked={activeFilters[offer.id] || false}
                      onCheckedChange={() => toggleFilter(offer.id)}
                    />
                    <label
                      htmlFor={`offer-${offer.id}`}
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {offer.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Lista de restaurantes */}
        <div className="lg:col-span-3">
          {/* Resumo de filtros ativos */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).filter(([_, active]) => active).map(([filterId, _]) => {
                const cuisineFilter = cuisineTypes.find(c => c.id === filterId);
                const offerFilter = offerTypes.find(o => o.id === filterId);
                const label = cuisineFilter?.name || offerFilter?.name || filterId;
                
                return (
                  <Badge 
                    key={filterId} 
                    variant="outline"
                    className="px-2 py-1 flex items-center gap-1"
                  >
                    {label}
                    <button 
                      className="ml-1 focus:outline-none" 
                      onClick={() => toggleFilter(filterId)}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="14" 
                        height="14" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </Badge>
                );
              })}
              
              {minRating > 0 && (
                <Badge 
                  variant="outline"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <div className="flex items-center">
                    <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                    {minRating.toFixed(1)}+
                  </div>
                  <button 
                    className="ml-1 focus:outline-none" 
                    onClick={() => setMinRating(0)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </Badge>
              )}
              
              {maxDistance < 5 && (
                <Badge 
                  variant="outline"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <div className="flex items-center">
                    <LocationIcon className="w-3 h-3 mr-1" />
                    {maxDistance} km
                  </div>
                  <button 
                    className="ml-1 focus:outline-none" 
                    onClick={() => setMaxDistance(5)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </Badge>
              )}
            </div>
          </div>
          
          {/* Lista de resultados */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {sortedRestaurants.length} {sortedRestaurants.length === 1 ? 'Restaurante' : 'Restaurantes'} Encontrados
            </h2>
            
            {sortedRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedRestaurants.map(restaurant => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    image={restaurant.image}
                    cuisine={restaurant.cuisine}
                    rating={restaurant.rating}
                    deliveryTime={restaurant.deliveryTime}
                    minOrder={restaurant.minOrder}
                    featured={restaurant.featured}
                    isNew={restaurant.isNew}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <RestaurantIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum restaurante encontrado</h3>
                  <p className="text-muted-foreground mb-6">
                    Tente ajustar seus filtros para ver mais opções
                  </p>
                  <Button onClick={clearFilters}>Limpar Filtros</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantsExplore;
