
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
  label: string; // Added to match required type
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string; // Mudado de opcional para obrigatório
}

interface CheckoutData {
  items: CheckoutItem[];
  restaurantId: string;
  restaurantName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  discount: number; // Added to match required type
  discountValue: number; // Added to match required type
}

// Checkout data management hook
export const useCheckoutData = (id?: string) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load checkout data
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadCheckoutData = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch data from MongoDB Atlas
        console.log("Carregando dados do checkout...");
        
        // Simulate checkout data based on restaurant ID
        const mockVideo = MOCK_VIDEOS.find(video => video.id === id || video.restaurantId === id);
        
        if (mockVideo) {
          const mockCheckoutData: CheckoutData = {
            items: [{
              id: mockVideo.id,
              name: mockVideo.dishName,
              price: mockVideo.price,
              quantity: 1,
              image: mockVideo.thumbnailUrl || 'https://source.unsplash.com/random/300x200/?food' // Garantindo que image nunca é undefined
            }],
            restaurantId: mockVideo.restaurantId,
            restaurantName: mockVideo.restaurantName,
            subtotal: mockVideo.price,
            deliveryFee: 8.90,
            total: mockVideo.price + 8.90,
            discount: 0, // Added to match required type
            discountValue: 0 // Added to match required type
          };
          
          setCheckoutData(mockCheckoutData);
        }
        
        // Simulate user addresses
        const mockAddresses: Address[] = [
          {
            id: '1',
            street: 'Rua das Flores, 123',
            complement: 'Apto 101',
            neighborhood: 'Centro',
            city: 'Florianópolis',
            state: 'SC',
            zipcode: '88000-000',
            isDefault: true,
            label: 'Casa' // Added to match required type
          },
          {
            id: '2',
            street: 'Av. Beira Mar Norte, 1500',
            complement: 'Bloco B, Apto 302',
            neighborhood: 'Centro',
            city: 'Florianópolis',
            state: 'SC',
            zipcode: '88010-100',
            label: 'Trabalho' // Added to match required type
          }
        ];
        
        setAddresses(mockAddresses);
        // Select default address
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
      
      // In a real implementation, this would be sent to MongoDB Atlas
      // Simulate a successful processing response
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
