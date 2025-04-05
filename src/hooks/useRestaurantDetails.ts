
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantData } from '@/services/restaurantService';

// Define a default image constant
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop';

export interface RestaurantDetailsData {
  id: string;
  nome: string;
  descricao?: string;
  tipo_cozinha: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  email?: string;
  banner_url?: string;
  logo_url?: string;
  faixa_preco?: number;
  tempo_entrega_estimado?: number;
  taxa_entrega?: number;
  valor_pedido_minimo?: number;
  ativo?: boolean;
  // Compatibility with older usage
  name?: string;
  address?: string;
  cuisine?: string;
  rating?: number;
  imageUrl?: string;
  deliveryPosition?: { lat: number; lng: number };
}

export function useRestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<RestaurantDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (!id) {
        setError('ID do restaurante não encontrado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getRestaurantData(id);
        
        if (!data) {
          setError('Restaurante não encontrado');
          return;
        }
        
        if ('nome' in data) {
          // New format
          const restaurantData: RestaurantDetailsData = {
            ...data,
            // Map properties for backward compatibility
            name: data.nome,
            address: `${data.endereco}, ${data.cidade} - ${data.estado}`,
            cuisine: data.tipo_cozinha,
            rating: data.faixa_preco,
            imageUrl: data.banner_url || DEFAULT_IMAGE,
            deliveryPosition: { lat: -23.5505, lng: -46.6333 }
          };
          setRestaurant(restaurantData);
        } else {
          // Old format, adapt to new format
          const restaurantData: RestaurantDetailsData = {
            id: data.id,
            nome: data.name || 'Restaurante',
            tipo_cozinha: data.cuisine || 'Diversos',
            endereco: data.address?.split(',')[0] || 'Endereço não disponível',
            cidade: data.address?.split(',')[1]?.split('-')[0]?.trim() || 'São Paulo',
            estado: data.address?.split('-')[1]?.trim() || 'SP',
            faixa_preco: data.rating || 3,
            banner_url: data.imageUrl || DEFAULT_IMAGE,
            name: data.name,
            address: data.address,
            cuisine: data.cuisine,
            rating: data.rating,
            imageUrl: data.imageUrl,
            deliveryPosition: data.deliveryPosition
          };
          setRestaurant(restaurantData);
        }
      } catch (error: any) {
        console.error('Error fetching restaurant:', error);
        setError(error.message || 'Erro ao carregar dados do restaurante');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  // Added DEFAULT_IMAGE property to the returned object
  return { 
    restaurant, 
    isLoading, 
    error,
    DEFAULT_IMAGE 
  };
}
