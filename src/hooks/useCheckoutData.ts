
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiConfig } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';

// Checkout data management hook
export const useCheckoutData = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Process checkout
  const processCheckout = async (checkoutData: any) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const { data, error } = await httpClient.post(
        apiConfig.endpoints.orders.create,
        checkoutData
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Pedido realizado com sucesso!');
      return { success: true, data };
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pedido');
      toast.error('Falha ao processar pedido');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    error,
    processCheckout
  };
};

export default useCheckoutData;
