import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, Search } from 'lucide-react';
import { RestaurantList } from '@/components/restaurants/RestaurantList';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { supabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Restaurant {
  id: string;
  nome: string;
  tipo_cozinha: string;
  endereco: string;
  cidade: string;
  estado: string;
  banner_url: string;
  faixa_preco: number;
}

const RestaurantsExplore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<number[]>([1, 5]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const { db } = await connectToDatabase();
        const result = await db.collection('restaurants').find({});
        
        if (result.data) {
          const mappedRestaurants: Restaurant[] = result.data.map(restaurant => ({
            id: restaurant._id,
            nome: restaurant.nome,
            tipo_cozinha: restaurant.tipo_cozinha,
            endereco: restaurant.endereco,
            cidade: restaurant.cidade,
            estado: restaurant.estado,
            banner_url: restaurant.banner_url,
            faixa_preco: restaurant.faixa_preco
          }));
          setRestaurants(mappedRestaurants);
          setFilteredRestaurants(mappedRestaurants);
        } else {
          setRestaurants([]);
          setFilteredRestaurants([]);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast.error('Falha ao carregar restaurantes');
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let results = [...restaurants];

      // Apply search term filter
      if (searchTerm) {
        results = results.filter(restaurant =>
          restaurant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.tipo_cozinha.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply price range filter
      results = results.filter(restaurant =>
        restaurant.faixa_preco >= priceRange[0] && restaurant.faixa_preco <= priceRange[1]
      );

      setFilteredRestaurants(results);
    };

    applyFilters();
  }, [searchTerm, priceRange, restaurants]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center flex-1">
          <Input
            type="search"
            placeholder="Buscar restaurantes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="md:w-auto"
          />
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtrar
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div>
              <Label htmlFor="price-range">Faixa de Preço</Label>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>R$ {priceRange[0]}</span>
                <span>R$ {priceRange[1]}</span>
              </div>
              <Slider
                id="price-range"
                min={1}
                max={5}
                step={1}
                defaultValue={priceRange}
                onValueChange={handlePriceRangeChange}
                aria-label="Price range"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RestaurantList restaurants={filteredRestaurants} isLoading={isLoading} />
    </div>
  );
};

export default RestaurantsExplore;
