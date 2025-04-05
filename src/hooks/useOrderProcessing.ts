
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { supabaseClient } from '@/integrations/supabase/client';
import { generateGeminiResponse } from '@/services/gemini';

export interface OrderData {
  checkoutData: any;
  selectedAddress: string;
  addresses: any[];
  selectedPayment: string;
  notes: string;
  addressData: {
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipcode: string;
  };
  isAuthenticated: boolean;
}

export const useOrderProcessing = (orderData: OrderData) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const processOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Form validation
      if (orderData.isAuthenticated && !orderData.selectedAddress) {
        toast.error('Selecione um endereço de entrega');
        return false;
      }
      
      if (!orderData.isAuthenticated) {
        // Validate manually entered address
        const { street, city, state, zipcode } = orderData.addressData;
        if (!street || !city || !state || !zipcode) {
          toast.error('Preencha o endereço de entrega completo');
          return false;
        }
      }
      
      // Generate a unique order number
      const generatedOrderNumber = `${Date.now().toString().slice(-6)}`;
      setOrderNumber(generatedOrderNumber);
      
      // Connect to database
      const { db } = await connectToDatabase();
      
      // Get user data if authenticated
      let userId = null;
      if (orderData.isAuthenticated) {
        const { data } = await supabaseClient.auth.getUser();
        userId = data.user?.id;
      }
      
      // Get selected address
      let deliveryAddress;
      if (orderData.isAuthenticated && orderData.selectedAddress) {
        deliveryAddress = orderData.addresses.find(addr => addr.id === orderData.selectedAddress);
      } else {
        deliveryAddress = orderData.addressData;
      }
      
      // Create order object
      const newOrder = {
        numero_pedido: generatedOrderNumber,
        cliente_id: userId,
        restaurante_id: orderData.checkoutData.restaurantId,
        subtotal: orderData.checkoutData.subtotal,
        taxa_entrega: orderData.checkoutData.deliveryFee,
        taxa_servico: 0,
        imposto: 0,
        total: orderData.checkoutData.total,
        metodo_pagamento: orderData.selectedPayment,
        status_pagamento: 'pendente',
        status: 'pendente',
        endereco_entrega: `${deliveryAddress.street}, ${deliveryAddress.complement || ''}`,
        cidade_entrega: deliveryAddress.city,
        estado_entrega: deliveryAddress.state,
        cep_entrega: deliveryAddress.zipcode,
        instrucoes_entrega: orderData.notes,
        criado_em: new Date(),
        atualizado_em: new Date()
      };
      
      // Save order to database
      const result = await db.collection('pedidos').insertOne(newOrder);
      
      if (!result || result.error) {
        throw new Error('Erro ao salvar pedido');
      }
      
      // Save order items
      const orderItems = orderData.checkoutData.items.map((item: any) => ({
        pedido_id: result.data.insertedId,
        nome_item_cardapio: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
        preco_total: item.price * item.quantity,
        instrucoes_especiais: item.specialInstructions || ''
      }));
      
      for (const item of orderItems) {
        await db.collection('itens_pedido').insertOne(item);
      }
      
      // Success!
      toast.success('Pedido realizado com sucesso!');
      
      // Wait a bit for user to see the success message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error: any) {
      console.error('Error processing order:', error);
      toast.error(error.message || 'Erro ao processar pedido');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const redirectToOrderDetails = () => {
    navigate(`/orders/${orderNumber}`);
  };

  const requestAISuggestions = async () => {
    try {
      // Only request suggestions if we have items
      if (orderData.checkoutData?.items?.length > 0) {
        const prompt = `
          Baseado nos itens do pedido do cliente, gere 2-3 sugestões úteis relacionadas ao pedido.
          Formato esperado: SUGGESTIONS: sugestão 1, sugestão 2, sugestão 3
          
          Itens do pedido:
          ${orderData.checkoutData.items.map((item: any) => 
            `${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}`
          ).join('\n')}
          
          Restaurante: ${orderData.checkoutData.restaurantName || 'Não especificado'}
          Subtotal: R$ ${orderData.checkoutData.subtotal.toFixed(2)}
          Taxa de entrega: R$ ${orderData.checkoutData.deliveryFee.toFixed(2)}
          Total: R$ ${orderData.checkoutData.total.toFixed(2)}
        `;
        
        const response = await generateGeminiResponse(prompt);
        
        if (response.suggestions && response.suggestions.length > 0) {
          setAiSuggestions(response.suggestions);
        }
        
        // Generate a friendly AI message
        setAiMessage("Obrigado por pedir no DelivGo! Revisamos seu pedido e está tudo certo para prosseguir.");
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      // Fail silently - suggestions are not critical
    }
  };

  return {
    isProcessing,
    orderNumber,
    processOrder,
    redirectToOrderDetails,
    aiSuggestions,
    aiMessage,
    requestAISuggestions
  };
};
