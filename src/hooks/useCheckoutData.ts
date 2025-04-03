
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { httpClient } from '@/utils/httpClient';
import { apiConfig } from '@/config/apiConfig';
import { CheckoutData, Address } from '@/components/checkout/types';

export const useCheckoutData = (id?: string) => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        
        // Obter dados do checkout
        let savedCheckoutData = null;
        
        if (id) {
          // Se temos um ID, tentamos buscar dados específicos para este restaurante
          const restaurantCartData = localStorage.getItem(`cart_${id}`);
          if (restaurantCartData) {
            savedCheckoutData = JSON.parse(restaurantCartData);
          }
        }
        
        // Se não encontrou por ID, tenta o checkout genérico
        if (!savedCheckoutData) {
          const genericCheckoutData = localStorage.getItem('checkout_data');
          if (genericCheckoutData) {
            savedCheckoutData = JSON.parse(genericCheckoutData);
          }
        }
        
        if (!savedCheckoutData) {
          toast.error("Dados do pedido não encontrados");
          navigate('/carrinho');
          return;
        }
        
        // Initialize default values for numerical properties and ensure items array exists
        const defaultedData = {
          ...savedCheckoutData,
          items: savedCheckoutData.items || [],
          subtotal: savedCheckoutData.subtotal || 0,
          discount: savedCheckoutData.discount || 0,
          discountValue: savedCheckoutData.discountValue || 0,
          deliveryFee: savedCheckoutData.deliveryFee || 0,
          total: savedCheckoutData.total || 0
        };
        
        setCheckoutData(defaultedData);
        
        // Buscar endereços do usuário se autenticado
        if (isAuthenticated && user) {
          try {
            // Usar o endpoint correto para buscar endereços
            const { data, error } = await httpClient.get(apiConfig.endpoints.addresses.getByUser);
            
            if (error) {
              console.error('Erro ao buscar endereços:', error);
            } else if (data && Array.isArray(data)) {
              const formattedAddresses = data.map((addr: any) => ({
                id: addr._id,
                label: addr.label || 'Endereço',
                street: addr.street || addr.endereco,
                complement: addr.complement || addr.complemento,
                neighborhood: addr.neighborhood || addr.bairro,
                city: addr.city || addr.cidade,
                state: addr.state || addr.estado,
                zipcode: addr.zipcode || addr.cep
              }));
              
              setAddresses(formattedAddresses);
              
              // Selecionar o primeiro endereço se houver algum
              if (formattedAddresses.length > 0) {
                setSelectedAddress(formattedAddresses[0].id);
              }
            }
          } catch (error) {
            console.error('Erro ao carregar endereços:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do checkout:', error);
        toast.error("Não foi possível carregar os dados do pedido");
      } finally {
        setLoading(false);
      }
    };
    
    loadCheckoutData();
  }, [isAuthenticated, user, navigate, id]);

  return {
    checkoutData,
    addresses,
    selectedAddress,
    setSelectedAddress,
    loading
  };
};
