
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
    try {
      const orderResult = await orderCollection.find({
        cliente_id: userId
      });
      
      // Properly handle the orderResult
      const orderData = orderResult.data || [];
      
      context.previousOrders = Array.isArray(orderData) ? orderData.map(order => ({
        id: order._id || '',
        numero_pedido: order.numero_pedido || '',
        restaurante_id: order.restaurante_id || '',
        restaurante_nome: order.restaurantes?.nome || 'Restaurante',
        total: order.total || 0,
        criado_em: order.criado_em || new Date().toISOString()
      })) : [];
    } catch (err) {
      console.error('Error fetching previous orders:', err);
      context.previousOrders = [];
    }
    
    // Fetch user's profile information
    const profileCollection = db.collection('profiles');
    try {
      const profileResult = await profileCollection.findOne({
        _id: userId
      });
      
      if (profileResult && profileResult.data) {
        context.userProfile = {
          nome: profileResult.data.nome || '',
          sobrenome: profileResult.data.sobrenome || '',
          nomeCompleto: `${profileResult.data.nome || ''} ${profileResult.data.sobrenome || ''}`.trim(),
          telefone: profileResult.data.telefone
        };
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
    
    // Fetch user's default address
    const addressCollection = db.collection('addresses');
    try {
      const addressResult = await addressCollection.findOne({
        usuario_id: userId,
        isdefault: true
      });
      
      if (addressResult && addressResult.data) {
        context.userAddress = addressResult.data;
        
        // Add user location information
        context.userLocation = {
          cidade: addressResult.data.cidade,
          estado: addressResult.data.estado,
          cep: addressResult.data.cep
        };
      }
    } catch (err) {
      console.error('Error fetching user address:', err);
    }
    
    // Fetch user's most frequently ordered items
    if (context.previousOrders && context.previousOrders.length > 0) {
      try {
        const orderIds = context.previousOrders.map(order => order.id);
        
        const itemsCollection = db.collection('order_items');
        const frequentItemsResult = await itemsCollection.find({
          pedido_id: { $in: orderIds }
        });
        
        // Properly handle the frequentItemsResult
        const itemsData = frequentItemsResult.data || [];
        
        if (Array.isArray(itemsData) && itemsData.length > 0) {
          // Group and count items
          const itemCounts: Record<string, number> = {};
          itemsData.forEach(item => {
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
      } catch (err) {
        console.error('Error fetching frequent items:', err);
        context.frequentItems = [];
      }
    }
    
    console.log('Carregado contexto do usuário:', context);
    return context;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {};
  }
};
