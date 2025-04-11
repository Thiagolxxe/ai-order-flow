
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiConfig } from '@/config/apiConfig';
import { httpClient } from '@/utils/httpClient';
import { MOCK_VIDEOS } from './video-feed/mock-data';

// Types
interface Address {
  id: string;
  street: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  isDefault?: boolean;
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutData {
  items: CheckoutItem[];
  restaurantId: string;
  restaurantName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Checkout data management hook
export const useCheckoutData = (id?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar dados do checkout
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadCheckoutData = async () => {
      setLoading(true);
      try {
        // Simulação de carregamento de dados do checkout
        // Em uma implementação real, isso viria do MongoDB Atlas
        console.log("Carregando dados do checkout...");
        
        // Simular dados do checkout baseado no restaurante do id
        const mockVideo = MOCK_VIDEOS.find(video => video.id === id || video.restaurantId === id);
        
        if (mockVideo) {
          const mockCheckoutData: CheckoutData = {
            items: [{
              id: mockVideo.id,
              name: mockVideo.dishName,
              price: mockVideo.price,
              quantity: 1,
              image: mockVideo.thumbnailUrl
            }],
            restaurantId: mockVideo.restaurantId,
            restaurantName: mockVideo.restaurantName,
            subtotal: mockVideo.price,
            deliveryFee: 8.90,
            total: mockVideo.price + 8.90
          };
          
          setCheckoutData(mockCheckoutData);
        }
        
        // Simulação de endereços do usuário
        const mockAddresses: Address[] = [
          {
            id: '1',
            street: 'Rua das Flores, 123',
            complement: 'Apto 101',
            neighborhood: 'Centro',
            city: 'Florianópolis',
            state: 'SC',
            zipcode: '88000-000',
            isDefault: true
          },
          {
            id: '2',
            street: 'Av. Beira Mar Norte, 1500',
            complement: 'Bloco B, Apto 302',
            neighborhood: 'Centro',
            city: 'Florianópolis',
            state: 'SC',
            zipcode: '88010-100'
          }
        ];
        
        setAddresses(mockAddresses);
        // Selecionar o endereço padrão
        const defaultAddress = mockAddresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        }
        
      } catch (err: any) {
        console.error("Erro ao carregar dados do checkout:", err);
        setError("Falha ao carregar dados do pedido");
      } finally {
        setLoading(false);
      }
    };
    
    loadCheckoutData();
  }, [id]);
  
  // Process checkout
  const processCheckout = async (checkoutData: any) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      console.log("Processando checkout:", checkoutData);
      
      // Em uma implementação real, isso seria enviado para o MongoDB Atlas
      // Simular uma resposta de processamento bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Pedido realizado com sucesso!');
      return { success: true, data: { orderId: 'order_' + Date.now() } };
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
    processCheckout,
    checkoutData,
    addresses,
    selectedAddress,
    setSelectedAddress,
    loading
  };
};

export default useCheckoutData;
