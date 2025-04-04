
import { connectToDatabase } from '@/integrations/mongodb/client';
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
    const { db } = await connectToDatabase();
    const orderCollection = db.collection('orders');
    const orderResult = await orderCollection.findOne({ numero_pedido: orderNumber });
    
    if (orderResult.error || !orderResult.data) {
      console.error('Error fetching order status:', orderResult.error);
      return { result: `Pedido #${orderNumber} não encontrado` };
    }
    
    const data = orderResult.data;
    
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
      orderId: data._id,
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
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const restaurantsCollection = db.collection('restaurants');
    
    // Build query
    const query: any = { ativo: true };
    
    if (cuisine) {
      query.tipo_cozinha = { $regex: cuisine, $options: 'i' };
    }
    
    if (location) {
      query.$or = [
        { cidade: { $regex: location, $options: 'i' } },
        { endereco: { $regex: location, $options: 'i' } }
      ];
    }
    
    if (name) {
      query.nome = { $regex: name, $options: 'i' };
    }
    
    // Execute the query
    const result = await restaurantsCollection.find(query).toArray();
    
    if (result.error) {
      console.error('Error searching restaurants:', result.error);
      return { result: 'Erro ao buscar restaurantes' };
    }
    
    if (!result.data || result.data.length === 0) {
      return { 
        result: 'Nenhum restaurante encontrado com os critérios fornecidos',
        restaurants: []
      };
    }
    
    // Format the response
    const restaurants = result.data.slice(0, 5).map(restaurant => ({
      id: restaurant._id,
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
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Query the database for the order
    const orderCollection = db.collection('orders');
    const orderResult = await orderCollection.findOne({ numero_pedido: orderNumber });
    
    if (orderResult.error || !orderResult.data) {
      console.error('Error fetching order:', orderResult.error);
      return { result: `Pedido #${orderNumber} não encontrado` };
    }
    
    const order = orderResult.data;
    
    // Get restaurant information
    const restaurantCollection = db.collection('restaurants');
    const restaurantResult = await restaurantCollection.findOne({ _id: order.restaurante_id });
    
    if (restaurantResult.error || !restaurantResult.data) {
      return { result: 'Erro ao buscar informações do restaurante' };
    }
    
    const restaurant = restaurantResult.data;
    
    // Get the items in this order
    const orderItemsCollection = db.collection('order_items');
    const orderItemsResult = await orderItemsCollection.find({ pedido_id: order._id }).toArray();
    
    if (orderItemsResult.error) {
      console.error('Error fetching order items:', orderItemsResult.error);
      return { result: 'Erro ao buscar itens do pedido' };
    }
    
    if (!orderItemsResult.data || orderItemsResult.data.length === 0) {
      return { result: 'Este pedido não possui itens' };
    }
    
    // Format the items
    const items = orderItemsResult.data.map(item => ({
      name: item.nome_item_cardapio,
      quantity: item.quantidade,
      price: item.preco_unitario
    }));
    
    return {
      result: `Pedido #${orderNumber} do restaurante ${restaurant.nome} contém ${items.length} itens`,
      restaurantId: order.restaurante_id,
      restaurantName: restaurant.nome,
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
    const { db } = await connectToDatabase();
    const menuItemsCollection = db.collection('menu_items');
    const itemResult = await menuItemsCollection.findOne({ _id: itemId });
    
    if (itemResult.error || !itemResult.data) {
      console.error('Error fetching item:', itemResult.error);
      return { result: `Item não encontrado` };
    }
    
    const item = itemResult.data;
    
    // Get restaurant information
    const restaurantCollection = db.collection('restaurants');
    const restaurantResult = await restaurantCollection.findOne({ _id: item.restaurante_id });
    
    const restaurantName = restaurantResult.error || !restaurantResult.data 
      ? 'Restaurante' 
      : restaurantResult.data.nome;
    
    return {
      result: `Adicionado ${quantity}x ${item.nome} ao carrinho`,
      item: {
        id: item._id,
        name: item.nome,
        price: item.preco,
        quantity: quantity,
        restaurantId: item.restaurante_id,
        restaurantName: restaurantName,
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
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const restaurantsCollection = db.collection('restaurants');
    
    // Get cuisines from past orders if available
    let preferredCuisines: string[] = [];
    
    if (context?.previousOrders && context.previousOrders.length > 0) {
      const restaurantIds = context.previousOrders.map(order => order.restaurante_id);
      
      const restaurantQuery = { _id: { $in: restaurantIds } };
      const restaurantsResult = await restaurantsCollection.find(restaurantQuery).toArray();
      
      if (!restaurantsResult.error && restaurantsResult.data) {
        preferredCuisines = restaurantsResult.data
          .map(r => r.tipo_cozinha)
          .filter(Boolean);
      }
    }
    
    // Build query for recommendations
    let query: any = { ativo: true };
    
    // If we have preferred cuisines, prioritize those
    if (preferredCuisines.length > 0) {
      query.tipo_cozinha = { $in: preferredCuisines };
    }
    
    // Get location-based recommendations if we have user location
    if (context?.userLocation?.cidade) {
      query.cidade = context.userLocation.cidade;
    }
    
    const recommendationsResult = await restaurantsCollection.find(query).toArray();
    
    if (recommendationsResult.error) {
      console.error('Error fetching recommendations:', recommendationsResult.error);
      return { result: 'Erro ao buscar recomendações' };
    }
    
    let recommendations = recommendationsResult.data;
    
    if (!recommendations || recommendations.length === 0) {
      // Fallback to popular restaurants
      delete query.tipo_cozinha;
      delete query.cidade;
      
      const popularResult = await restaurantsCollection.find({ ativo: true }).toArray();
      
      if (popularResult.error || !popularResult.data || popularResult.data.length === 0) {
        return { result: 'Não foi possível encontrar recomendações' };
      }
      
      recommendations = popularResult.data;
    }
    
    // Limit to 5 restaurants
    const limitedRecommendations = recommendations.slice(0, 5);
    
    return {
      result: preferredCuisines.length > 0 
        ? 'Recomendações personalizadas de restaurantes' 
        : 'Recomendações populares de restaurantes',
      restaurants: limitedRecommendations.map(r => ({
        id: r._id,
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
    const { db } = await connectToDatabase();
    const restaurantCollection = db.collection('restaurants');
    const restaurantResult = await restaurantCollection.findOne({ _id: restaurantId });
    
    if (restaurantResult.error || !restaurantResult.data) {
      console.error('Error fetching restaurant:', restaurantResult.error);
      return { result: 'Restaurante não encontrado' };
    }
    
    const restaurant = restaurantResult.data;
    
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
        id: restaurant._id,
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
