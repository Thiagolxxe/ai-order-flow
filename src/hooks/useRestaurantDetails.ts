
import { useState, useEffect } from 'react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface RestaurantDetailsData {
  _id?: string;
  id?: string;
  nome: string;
  descricao: string;
  tipo_cozinha: string;
  endereco: string;
  cidade: string;
  estado: string;
  avaliacao: number;
  imagem_url: string;
  banner_url?: string;
  horario_funcionamento?: {
    abertura: string;
    fechamento: string;
    dias_funcionamento: string[];
  };
  contato?: {
    telefone?: string;
    email?: string;
    site?: string;
  };
  latitude?: number;
  longitude?: number;
  delivery_disponivel?: boolean;
  tempo_entrega_estimado?: string;
  pedido_minimo?: number;
  metodos_pagamento?: string[];
  taxa_entrega?: number;
  // Old interface fields for compatibility
  name?: string;
  address?: string;
  cuisine?: string;
  rating?: number;
  imageUrl?: string;
  deliveryPosition?: { lat: number; lng: number };
}

export function useRestaurantDetails(restaurantId: string) {
  const fetchRestaurantDetails = async (): Promise<RestaurantDetailsData> => {
    try {
      if (!restaurantId) {
        throw new Error('ID do restaurante não fornecido');
      }

      const { db } = await connectToDatabase();
      const result = await db.collection('restaurantes').findOne({ _id: restaurantId });

      if (!result || !result.data) {
        throw new Error('Restaurante não encontrado');
      }

      // Return the restaurant data with compatibility fields
      const restaurantData = result.data;
      return {
        ...restaurantData,
        // Add compatibility fields
        name: restaurantData.nome,
        address: `${restaurantData.endereco}, ${restaurantData.cidade} - ${restaurantData.estado}`,
        cuisine: restaurantData.tipo_cozinha,
        rating: restaurantData.avaliacao,
        imageUrl: restaurantData.imagem_url,
        deliveryPosition: restaurantData.latitude && restaurantData.longitude 
          ? { lat: restaurantData.latitude, lng: restaurantData.longitude } 
          : undefined
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do restaurante:', error);
      throw new Error('Falha ao carregar dados do restaurante');
    }
  };

  // Use React Query to manage the data fetching
  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: fetchRestaurantDetails,
    enabled: !!restaurantId,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    restaurant: data,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
