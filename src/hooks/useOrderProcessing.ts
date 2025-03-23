
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { CheckoutData, PaymentMethod } from '@/components/checkout/types';

interface AddressData {
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

interface OrderProcessingProps {
  checkoutData: CheckoutData | null;
  selectedAddress: string;
  addresses: any[];
  selectedPayment: PaymentMethod;
  notes: string;
  addressData: AddressData;
  isAuthenticated: boolean;
}

export const useOrderProcessing = ({
  checkoutData,
  selectedAddress,
  addresses,
  selectedPayment,
  notes,
  addressData,
  isAuthenticated
}: OrderProcessingProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const processOrder = async () => {
    if (!checkoutData) {
      toast.error("Dados do pedido não encontrados");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Validar endereço
      let enderecoEntrega, cidadeEntrega, estadoEntrega, cepEntrega;
      
      if (isAuthenticated && selectedAddress) {
        const address = addresses.find(addr => addr.id === selectedAddress);
        if (!address) {
          toast.error("Selecione um endereço válido");
          setIsProcessing(false);
          return;
        }
        
        enderecoEntrega = `${address.street}, ${address.complement || ''} - ${address.neighborhood}`;
        cidadeEntrega = address.city;
        estadoEntrega = address.state;
        cepEntrega = address.zipcode;
      } else {
        // Validar campos de endereço para usuários não autenticados
        const { street, complement, neighborhood, city, state, zipcode } = addressData;
        
        if (!street || !neighborhood || !city || !state || !zipcode) {
          toast.error("Preencha o endereço completo para entrega");
          setIsProcessing(false);
          return;
        }
        
        enderecoEntrega = `${street}, ${complement || ''} - ${neighborhood}`;
        cidadeEntrega = city;
        estadoEntrega = state;
        cepEntrega = zipcode;
      }
      
      // Gerar número de pedido
      const orderNumber = Math.floor(Math.random() * 9000) + 1000;
      
      // Criar o pedido no banco de dados
      const { data: orderData, error: orderError } = await supabase
        .from('pedidos')
        .insert({
          restaurante_id: checkoutData.restaurantId,
          cliente_id: user?.id,
          subtotal: checkoutData.subtotal || 0,
          taxa_entrega: checkoutData.deliveryFee || 0,
          taxa_servico: 0,
          imposto: 0,
          gorjeta: 0,
          total: checkoutData.total || 0,
          metodo_pagamento: selectedPayment,
          numero_pedido: orderNumber.toString(),
          status_pagamento: selectedPayment === 'pix' ? 'pendente' : 'aprovado',
          status: 'pendente',
          endereco_entrega: enderecoEntrega,
          cidade_entrega: cidadeEntrega,
          estado_entrega: estadoEntrega,
          cep_entrega: cepEntrega,
          instrucoes_entrega: notes
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Criar os itens do pedido
      const orderItems = (checkoutData.items || []).map(item => ({
        pedido_id: orderData.id,
        item_cardapio_id: item.id,
        nome_item_cardapio: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
        preco_total: item.price * item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('itens_pedido')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Adicionar entrada ao histórico de status
      const { error: historyError } = await supabase
        .from('historico_status_pedido')
        .insert({
          pedido_id: orderData.id,
          status: 'pendente',
          observacoes: 'Pedido recebido'
        });
      
      if (historyError) throw historyError;
      
      // Limpar dados do carrinho
      localStorage.removeItem('checkout_data');
      localStorage.removeItem(`cart_${checkoutData.restaurantId}`);
      
      // Redirecionar para a página de detalhes do pedido
      toast.success("Pedido realizado com sucesso!");
      navigate(`/pedido/${orderData.id}`);
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      toast.error("Não foi possível processar o pedido");
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    processOrder
  };
};
