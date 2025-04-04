
import { supabase } from '@/integrations/supabase/client';
import { OrderContext } from './types';

/**
 * Fetch user context information from database
 */
export const fetchUserContext = async (userId?: string): Promise<OrderContext> => {
  if (!userId) return {};
  
  try {
    const context: OrderContext = {};
    
    // Fetch user's previous orders
    const { data: orderData, error: orderError } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_pedido,
        restaurante_id,
        restaurantes (
          nome
        ),
        total,
        criado_em
      `)
      .eq('cliente_id', userId)
      .order('criado_em', { ascending: false })
      .limit(5)
      .toArray();
    
    if (!orderError && orderData && Array.isArray(orderData)) {
      context.previousOrders = orderData.map(order => ({
        id: order.id || '',
        numero_pedido: order.numero_pedido || '',
        restaurante_id: order.restaurante_id || '',
        restaurante_nome: order.restaurantes?.nome || 'Restaurante',
        total: order.total || 0,
        criado_em: order.criado_em || new Date().toISOString()
      }));
    }
    
    // Fetch user's profile information
    const { data: profileData, error: profileError } = await supabase
      .from('perfis')
      .select('nome, sobrenome, telefone')
      .eq('id', userId)
      .maybeSingle();
    
    if (!profileError && profileData) {
      context.userProfile = {
        nome: profileData.nome || '',
        sobrenome: profileData.sobrenome || '',
        nomeCompleto: `${profileData.nome || ''} ${profileData.sobrenome || ''}`.trim(),
        telefone: profileData.telefone
      };
    }
    
    // Fetch user's default address
    const { data: addressData, error: addressError } = await supabase
      .from('enderecos')
      .select('*')
      .eq('usuario_id', userId)
      .eq('isdefault', true)
      .maybeSingle();
    
    if (!addressError && addressData) {
      context.userAddress = addressData;
      
      // Add user location information
      context.userLocation = {
        cidade: addressData.cidade,
        estado: addressData.estado,
        cep: addressData.cep
      };
    }
    
    // Fetch user's most frequently ordered items
    if (context.previousOrders && context.previousOrders.length > 0) {
      const orderIds = context.previousOrders.map(order => order.id);
      
      const { data: frequentItems, error: itemsError } = await supabase
        .from('itens_pedido')
        .select('nome_item_cardapio, count')
        .in('pedido_id', orderIds)
        .order('count', { ascending: false })
        .limit(3)
        .toArray();
      
      if (!itemsError && frequentItems && Array.isArray(frequentItems)) {
        context.frequentItems = frequentItems.map(item => item.nome_item_cardapio);
      }
    }
    
    return context;
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {};
  }
};
