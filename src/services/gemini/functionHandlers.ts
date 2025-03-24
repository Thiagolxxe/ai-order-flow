import { supabase } from '@/integrations/supabase/client';
import { FunctionCall, FunctionResponse, OrderContext } from './types';

/**
 * Handle function calls from Gemini AI
 */
export const handleFunctionCall = async (
  functionCall: FunctionCall,
  context?: OrderContext
): Promise<FunctionResponse> => {
  console.log(`Handling function call: ${functionCall.name}`);
  
  try {
    switch (functionCall.name) {
      case 'get_order_status':
        return await getOrderStatus(functionCall.arguments.order_number, context);
      
      case 'search_restaurants':
        return await searchRestaurants(
          functionCall.arguments.cuisine,
          functionCall.arguments.location,
          functionCall.arguments.name
        );
      
      case 'reorder_previous_meal':
        return await reorderPreviousMeal(functionCall.arguments.order_number, context);
      
      case 'add_item_to_cart':
        return await addItemToCart(
          functionCall.arguments.item_id,
          functionCall.arguments.quantity,
          functionCall.arguments.special_instructions
        );
        
      case 'recommend_restaurants':
        return await recommendRestaurants(context);
        
      case 'initiate_checkout':
        return await initiateCheckout(functionCall.arguments.restaurant_id, context);
      
      default:
        return {
          result: `Função não implementada: ${functionCall.name}`
        };
    }
  } catch (error) {
    console.error(`Error handling function call ${functionCall.name}:`, error);
    return {
      result: `Erro ao processar função ${functionCall.name}: ${error.message || 'Erro desconhecido'}`
    };
  }
};

/**
 * Get the status of a specific order
 */
const getOrderStatus = async (
  orderNumber: string,
  context?: OrderContext
): Promise<FunctionResponse> => {
  try {
    // Validate order number
    if (!orderNumber) {
      return { result: 'Número do pedido não fornecido' };
    }
    
    // Query the database for the order
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        status,
        numero_pedido,
        criado_em,
        restaurante_id,
        restaurantes (
          nome
        )
      `)
      .eq('numero_pedido', orderNumber)
      .single();
    
    if (error) {
      console.error('Error fetching order status:', error);
      return { result: `Pedido #${orderNumber} não encontrado` };
    }
    
    if (!data) {
      return { result: `Pedido #${orderNumber} não encontrado` };
    }
    
    // Calculate estimated time based on order creation time
    const orderDate = new Date(data.criado_em);
    const now = new Date();
    const minutesPassed = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    // For demonstration, assume orders take 30-45 minutes
    let estimatedTime = 45 - minutesPassed;
    if (estimatedTime < 0) estimatedTime = 5; // If past expected time, say "5 more minutes"
    
    // Format the response
    return {
      result: `Pedido #${data.numero_pedido} - ${formatOrderStatus(data.status)}`,
      orderNumber: data.numero_pedido,
      status: data.status,
      restaurant: data.restaurantes?.nome || 'Restaurante',
      estimatedTimeMinutes: estimatedTime,
      orderId: data.id,
      orderDate: data.criado_em
    };
  } catch (error) {
    console.error('Error in get order status function:', error);
    return { result: 'Erro ao buscar status do pedido' };
  }
};

/**
 * Search for restaurants based on criteria
 */
const searchRestaurants = async (
  cuisine?: string,
  location?: string,
  name?: string
): Promise<FunctionResponse> => {
  try {
    if (!cuisine && !location && !name) {
      return { result: 'Nenhum critério de busca fornecido' };
    }
    
    // Start building the query
    let query = supabase
      .from('restaurantes')
      .select(`
        id,
        nome,
        tipo_cozinha,
        cidade,
        taxa_entrega,
        valor_pedido_minimo
      `)
      .eq('ativo', true);
    
    // Apply filters if provided
    if (cuisine) {
      query = query.ilike('tipo_cozinha', `%${cuisine}%`);
    }
    
    if (location) {
      query = query.or(`cidade.ilike.%${location}%,endereco.ilike.%${location}%`);
    }
    
    if (name) {
      query = query.ilike('nome', `%${name}%`);
    }
    
    // Execute the query
    const { data, error } = await query.limit(5);
    
    if (error) {
      console.error('Error searching restaurants:', error);
      return { result: 'Erro ao buscar restaurantes' };
    }
    
    if (!data || data.length === 0) {
      return { 
        result: 'Nenhum restaurante encontrado com os critérios fornecidos',
        restaurants: []
      };
    }
    
    // Format the response
    const restaurants = data.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.nome,
      cuisine: restaurant.tipo_cozinha,
      city: restaurant.cidade,
      deliveryFee: restaurant.taxa_entrega,
      minimumOrder: restaurant.valor_pedido_minimo
    }));
    
    return {
      result: `Encontrados ${restaurants.length} restaurantes`,
      restaurants
    };
  } catch (error) {
    console.error('Error in search restaurants function:', error);
    return { result: 'Erro ao buscar restaurantes' };
  }
};

/**
 * Prepare to reorder items from a previous order
 */
const reorderPreviousMeal = async (
  orderNumber: string,
  context?: OrderContext
): Promise<FunctionResponse> => {
  try {
    if (!orderNumber) {
      return { result: 'Número do pedido não fornecido' };
    }
    
    // Query the database for the order and its items
    const { data: order, error: orderError } = await supabase
      .from('pedidos')
      .select(`
        id,
        restaurante_id,
        restaurantes (
          nome,
          id
        )
      `)
      .eq('numero_pedido', orderNumber)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return { result: `Pedido #${orderNumber} não encontrado` };
    }
    
    // Get the items in this order
    const { data: orderItems, error: itemsError } = await supabase
      .from('itens_pedido')
      .select(`
        id,
        quantidade,
        nome_item_cardapio,
        preco_unitario
      `)
      .eq('pedido_id', order.id);
    
    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      return { result: 'Erro ao buscar itens do pedido' };
    }
    
    if (!orderItems || orderItems.length === 0) {
      return { result: 'Este pedido não possui itens' };
    }
    
    // Format the items
    const items = orderItems.map(item => ({
      name: item.nome_item_cardapio,
      quantity: item.quantidade,
      price: item.preco_unitario
    }));
    
    return {
      result: `Pedido #${orderNumber} do restaurante ${order.restaurantes.nome} contém ${items.length} itens`,
      restaurantId: order.restaurante_id,
      restaurantName: order.restaurantes.nome,
      items
    };
  } catch (error) {
    console.error('Error in reorder previous meal function:', error);
    return { result: 'Erro ao buscar detalhes do pedido' };
  }
};

/**
 * Format order status for display
 */
const formatOrderStatus = (status: string): string => {
  switch (status) {
    case 'pendente':
      return 'Pedido pendente';
    case 'confirmado':
      return 'Pedido confirmado pelo restaurante';
    case 'preparando':
      return 'Pedido em preparação';
    case 'pronto':
      return 'Pedido pronto para entrega';
    case 'em_entrega':
      return 'Pedido em rota de entrega';
    case 'entregue':
      return 'Pedido entregue';
    case 'cancelado':
      return 'Pedido cancelado';
    default:
      return `Status: ${status}`;
  }
};

/**
 * Add an item to the user's cart
 */
const addItemToCart = async (
  itemId: string,
  quantity: number = 1,
  specialInstructions?: string
): Promise<FunctionResponse> => {
  try {
    if (!itemId) {
      return { result: 'ID do item não fornecido' };
    }
    
    // Fetch item details from database
    const { data: itemData, error: itemError } = await supabase
      .from('itens_cardapio')
      .select(`
        id,
        nome,
        preco,
        restaurante_id,
        restaurantes (
          nome
        )
      `)
      .eq('id', itemId)
      .single();
    
    if (itemError || !itemData) {
      console.error('Error fetching item:', itemError);
      return { result: `Item não encontrado` };
    }
    
    return {
      result: `Adicionado ${quantity}x ${itemData.nome} ao carrinho`,
      item: {
        id: itemData.id,
        name: itemData.nome,
        price: itemData.preco,
        quantity: quantity,
        restaurantId: itemData.restaurante_id,
        restaurantName: itemData.restaurantes?.nome || 'Restaurante',
        specialInstructions: specialInstructions
      },
      action: 'add_to_cart'
    };
  } catch (error) {
    console.error('Error in add item to cart function:', error);
    return { result: 'Erro ao adicionar item ao carrinho' };
  }
};

/**
 * Recommend restaurants based on user context
 */
const recommendRestaurants = async (context?: OrderContext): Promise<FunctionResponse> => {
  try {
    // Get cuisines from past orders if available
    let preferredCuisines: string[] = [];
    
    if (context?.previousOrders && context.previousOrders.length > 0) {
      const restaurantIds = context.previousOrders.map(order => order.restaurante_id);
      
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurantes')
        .select('tipo_cozinha')
        .in('id', restaurantIds);
      
      if (!restaurantsError && restaurants) {
        preferredCuisines = restaurants.map(r => r.tipo_cozinha).filter(Boolean);
      }
    }
    
    // Build query for recommendations
    let query = supabase
      .from('restaurantes')
      .select(`
        id,
        nome,
        tipo_cozinha,
        descricao,
        taxa_entrega,
        logo_url
      `)
      .eq('ativo', true);
    
    // If we have preferred cuisines, prioritize those
    if (preferredCuisines.length > 0) {
      query = query.in('tipo_cozinha', preferredCuisines);
    }
    
    // Get location-based recommendations if we have user location
    if (context?.userLocation?.cidade) {
      query = query.eq('cidade', context.userLocation.cidade);
    }
    
    const { data: recommendations, error: recError } = await query.limit(5);
    
    if (recError) {
      console.error('Error fetching recommendations:', recError);
      return { result: 'Erro ao buscar recomendações' };
    }
    
    if (!recommendations || recommendations.length === 0) {
      // Fallback to popular restaurants
      const { data: popular, error: popError } = await supabase
        .from('restaurantes')
        .select(`
          id,
          nome,
          tipo_cozinha,
          descricao,
          taxa_entrega,
          logo_url
        `)
        .eq('ativo', true)
        .limit(5);
      
      if (popError || !popular || popular.length === 0) {
        return { result: 'Não foi possível encontrar recomendações' };
      }
      
      return {
        result: 'Recomendações populares de restaurantes',
        restaurants: popular.map(r => ({
          id: r.id,
          name: r.nome,
          cuisine: r.tipo_cozinha,
          description: r.descricao,
          deliveryFee: r.taxa_entrega,
          logoUrl: r.logo_url
        }))
      };
    }
    
    return {
      result: 'Recomendações personalizadas de restaurantes',
      restaurants: recommendations.map(r => ({
        id: r.id,
        name: r.nome,
        cuisine: r.tipo_cozinha,
        description: r.descricao,
        deliveryFee: r.taxa_entrega,
        logoUrl: r.logo_url
      }))
    };
  } catch (error) {
    console.error('Error in recommend restaurants function:', error);
    return { result: 'Erro ao gerar recomendações' };
  }
};

/**
 * Initialize checkout process
 */
const initiateCheckout = async (
  restaurantId: string,
  context?: OrderContext
): Promise<FunctionResponse> => {
  try {
    if (!restaurantId) {
      return { result: 'ID do restaurante não fornecido' };
    }
    
    // Get restaurant information
    const { data: restaurant, error: restError } = await supabase
      .from('restaurantes')
      .select(`
        id,
        nome,
        taxa_entrega,
        valor_pedido_minimo
      `)
      .eq('id', restaurantId)
      .single();
    
    if (restError || !restaurant) {
      console.error('Error fetching restaurant:', restError);
      return { result: 'Restaurante não encontrado' };
    }
    
    // Get user's default address if available
    let deliveryAddress = null;
    if (context?.userAddress) {
      deliveryAddress = {
        endereco: context.userAddress.endereco,
        complemento: context.userAddress.complemento || '',
        bairro: context.userAddress.bairro,
        cidade: context.userAddress.cidade,
        estado: context.userAddress.estado,
        cep: context.userAddress.cep
      };
    }
    
    return {
      result: `Iniciando checkout para ${restaurant.nome}`,
      restaurant: {
        id: restaurant.id,
        name: restaurant.nome,
        deliveryFee: restaurant.taxa_entrega,
        minimumOrder: restaurant.valor_pedido_minimo
      },
      deliveryAddress,
      action: 'initiate_checkout'
    };
  } catch (error) {
    console.error('Error in initiate checkout function:', error);
    return { result: 'Erro ao iniciar checkout' };
  }
};
