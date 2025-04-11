
// Create a new file for any orders-related endpoints that might be missing
<lov-write file_path="src/hooks/useOrderProcessing.ts">
import { useEffect, useState } from 'react';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { apiConfig } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';

// Order processing hook
export const useOrderProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get user's orders
  const fetchOrders = async (userId: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const { data, error } = await httpClient.get(
        `${apiConfig.endpoints.orders.getByUser}`
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { orders: data || [] };
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar pedidos');
      toast.error('Falha ao carregar pedidos');
      return { orders: [] };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const { data, error } = await httpClient.patch(
        apiConfig.endpoints.orders.updateStatus(orderId),
        { status }
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(`Status do pedido atualizado para: ${status}`);
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status do pedido');
      toast.error('Falha ao atualizar status do pedido');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    error,
    fetchOrders,
    updateOrderStatus
  };
};

export default useOrderProcessing;
