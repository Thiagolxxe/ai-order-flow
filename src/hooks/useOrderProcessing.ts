
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { connectToDatabase, ObjectId } from '@/integrations/mongodb/client';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  instructions?: string;
  options?: any[];
}

interface OrderAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

interface OrderData {
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  address: OrderAddress;
  notes?: string;
  userId?: string;
}

export const useOrderProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const navigate = useNavigate();

  const processOrder = async (orderData: OrderData) => {
    if (!orderData.restaurantId) {
      toast.error('ID do restaurante não fornecido');
      return false;
    }

    if (!orderData.items || orderData.items.length === 0) {
      toast.error('Nenhum item no pedido');
      return false;
    }

    setIsProcessing(true);

    try {
      // Generate a unique order number
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      const generatedOrderNumber = `ORD-${Date.now().toString().substring(9)}${randomPart}`;
      
      // Connect to MongoDB
      const { db } = await connectToDatabase();
      
      // Create order in MongoDB
      const orderDetails = {
        numero_pedido: generatedOrderNumber,
        cliente_id: orderData.userId || null,
        restaurante_id: orderData.restaurantId,
        subtotal: orderData.subtotal,
        taxa_entrega: orderData.deliveryFee,
        taxa_servico: 0, // Default to 0 for service fee
        imposto: 0, // Default to 0 for tax
        gorjeta: 0, // Default to 0 for tip
        total: orderData.total,
        metodo_pagamento: orderData.paymentMethod,
        status_pagamento: 'pendente',
        status: 'pendente',
        endereco_entrega: `${orderData.address.street}, ${orderData.address.number}`,
        cidade_entrega: orderData.address.city,
        estado_entrega: orderData.address.state,
        cep_entrega: orderData.address.zipCode,
        instrucoes_entrega: orderData.notes || null,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      
      // Insert order into database
      const orderResult = await db.collection('orders').insertOne(orderDetails);
      
      if (!orderResult.data) {
        throw new Error('Erro ao criar pedido');
      }
      
      const orderId = orderResult.data.insertedId;
      
      // Insert order items
      for (const item of orderData.items) {
        const orderItem = {
          pedido_id: orderId,
          nome_item_cardapio: item.name,
          quantidade: item.quantity,
          preco_unitario: item.price,
          preco_total: item.price * item.quantity,
          instrucoes_especiais: item.instructions || null,
          criado_em: new Date().toISOString()
        };
        
        // Insert item
        const itemResult = await db.collection('order_items').insertOne(orderItem);
        
        if (!itemResult.data) {
          throw new Error('Erro ao adicionar itens ao pedido');
        }
        
        // Insert item options if any
        if (item.options && item.options.length > 0) {
          for (const option of item.options) {
            const itemOption = {
              item_pedido_id: itemResult.data.insertedId,
              nome_opcao: option.group || 'Opção',
              nome_escolha: option.name,
              ajuste_preco: option.price || 0,
              criado_em: new Date().toISOString()
            };
            
            await db.collection('escolhas_item_pedido').insertOne(itemOption);
          }
        }
      }
      
      // Create initial order status history
      await db.collection('order_status_history').insertOne({
        pedido_id: orderId,
        status: 'pendente',
        criado_em: new Date().toISOString(),
        observacoes: 'Pedido recebido pelo sistema'
      });
      
      // Create notification for order
      if (orderData.userId) {
        await db.collection('notifications').insertOne({
          usuario_id: orderData.userId,
          titulo: 'Pedido Realizado',
          mensagem: `Seu pedido #${generatedOrderNumber} foi recebido e está sendo processado.`,
          tipo: 'pedido',
          id_relacionado: orderId,
          lida: false,
          criado_em: new Date().toISOString()
        });
      }
      
      // Set order number for the UI
      setOrderNumber(generatedOrderNumber);
      
      // Show success message
      toast.success('Pedido realizado com sucesso!');
      
      return true;
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Erro ao processar pedido. Por favor, tente novamente.');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const redirectToOrderDetails = () => {
    if (orderNumber) {
      // Navigate to order status page
      navigate(`/order/${orderNumber}`);
    }
  };

  return {
    isProcessing,
    orderNumber,
    processOrder,
    redirectToOrderDetails,
  };
};
