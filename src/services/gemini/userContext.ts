
import { connectToDatabase } from '@/integrations/mongodb/client';
import { OrderContext } from './types';

/**
 * Fetch user context information from database
 */
export const fetchUserContext = async (userId?: string): Promise<OrderContext> => {
  if (!userId) return {};
  
  try {
    const context: OrderContext = {};
    const { db } = await connectToDatabase();
    
    // Fetch user's previous orders
    const orderCollection = db.collection('orders');
    const orderResult = await orderCollection.find({
      cliente_id: userId
    }).toArray();
    
    if (orderResult.data && Array.isArray(orderResult.data)) {
      context.previousOrders = orderResult.data.map(order => ({
        id: order._id || '',
        numero_pedido: order.numero_pedido || '',
        restaurante_id: order.restaurante_id || '',
        restaurante_nome: order.restaurantes?.nome || 'Restaurante',
        total: order.total || 0,
        criado_em: order.criado_em || new Date().toISOString()
      }));
    }
    
    // Fetch user's profile information
    const profileCollection = db.collection('profiles');
    const profileResult = await profileCollection.findOne({
      _id: userId
    });
    
    if (profileResult.data) {
      context.userProfile = {
        nome: profileResult.data.nome || '',
        sobrenome: profileResult.data.sobrenome || '',
        nomeCompleto: `${profileResult.data.nome || ''} ${profileResult.data.sobrenome || ''}`.trim(),
        telefone: profileResult.data.telefone
      };
    }
    
    // Fetch user's default address
    const addressCollection = db.collection('addresses');
    const addressResult = await addressCollection.findOne({
      usuario_id: userId,
      isdefault: true
    });
    
    if (addressResult.data) {
      context.userAddress = addressResult.data;
      
      // Add user location information
      context.userLocation = {
        cidade: addressResult.data.cidade,
        estado: addressResult.data.estado,
        cep: addressResult.data.cep
      };
    }
    
    // Fetch user's most frequently ordered items
    if (context.previousOrders && context.previousOrders.length > 0) {
      const orderIds = context.previousOrders.map(order => order.id);
      
      const itemsCollection = db.collection('order_items');
      const frequentItemsResult = await itemsCollection.find({
        pedido_id: { $in: orderIds }
      }).toArray();
      
      if (frequentItemsResult.data && Array.isArray(frequentItemsResult.data)) {
        // Group and count items
        const itemCounts: Record<string, number> = {};
        frequentItemsResult.data.forEach(item => {
          const itemName = item.nome_item_cardapio;
          if (itemName) {
            itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
          }
        });
        
        // Sort by count and take top 3
        context.frequentItems = Object.entries(itemCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([itemName]) => itemName);
      }
    }
    
    return context;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {};
  }
};
