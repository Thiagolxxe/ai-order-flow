
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
}

export function useRestaurantDetails(restaurantId: string) {
  const fetchRestaurantDetails = async (): Promise<RestaurantDetailsData> => {
    try {
      if (!restaurantId) {
        throw new Error('ID do restaurante não fornecido');
      }

      const { db } = await connectToDatabase();
      const result = await db.collection('restaurantes').findOne({ _id: restaurantId });

      if (!result.data) {
        throw new Error('Restaurante não encontrado');
      }

      // Return the restaurant data
      return result.data;
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
