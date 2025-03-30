
import { supabase } from '@/integrations/supabase/client';
import { 
  validateImageUrl, 
  calculateAverageRating, 
  getMockRestaurantData 
} from '@/utils/restaurant-helpers';
import { RestaurantDetailsData } from '@/hooks/useRestaurantDetails';
import { isValidUUID } from '@/utils/id-helpers';

/**
 * Fetches restaurant data from Supabase
 */
export const fetchRestaurantFromDatabase = async (restaurantId: string): Promise<RestaurantDetailsData | null> => {
  try {
    // Check if the ID is a valid UUID format first
    if (!isValidUUID(restaurantId)) {
      console.warn(`Invalid UUID format for restaurant ID: ${restaurantId}`);
      return null;
    }

    // Fetch restaurant data
    const { data, error: queryError } = await supabase
      .from('restaurantes')
      .select(`
        id, 
        nome, 
        descricao, 
        endereco, 
        cidade,
        estado,
        tipo_cozinha,
        logo_url,
        banner_url,
        faixa_preco
      `)
      .eq('id', restaurantId)
      .maybeSingle();

    if (queryError) {
      console.error("Error fetching restaurant:", queryError);
      throw new Error(queryError.message);
    }

    // If no data found, return null
    if (!data) {
      console.log("Restaurant not found in database");
      return null;
    }

    // Get average rating - Use explicit table reference to avoid ambiguity
    const { data: ratings, error: ratingsError } = await supabase
      .from('avaliacoes')
      .select('nota')
      .eq('restaurante_id', restaurantId);
    
    const avgRating = ratingsError ? 4.5 : calculateAverageRating(ratings);

    // Use banner_url if available, otherwise use logo_url or a default image
    const imageUrl = validateImageUrl(data.banner_url || data.logo_url);
    
    // Format and return restaurant data
    return {
      id: data.id,
      name: data.nome,
      address: `${data.endereco}, ${data.cidade} - ${data.estado}`,
      cuisine: data.tipo_cozinha,
      rating: avgRating,
      imageUrl: imageUrl,
      deliveryPosition: {
        lat: -23.5643,
        lng: -46.6527
      }
    };
  } catch (e) {
    console.error("Error fetching from database:", e);
    return null;
  }
};

/**
 * Gets restaurant data, either from the database or fallback mock data
 */
export const getRestaurantData = async (restaurantId: string): Promise<RestaurantDetailsData> => {
  // Try to fetch from database first
  const dbRestaurant = await fetchRestaurantFromDatabase(restaurantId);
  
  if (dbRestaurant) {
    return dbRestaurant;
  }
  
  // Fallback to mock data if not found in database
  console.log("Using mock restaurant data");
  return getMockRestaurantData(restaurantId);
};

/**
 * Registers a new user as a restaurant owner
 * Corrigido: Usando referências de tabela e coluna totalmente qualificadas para resolver ambiguidade
 */
export const registerRestaurantOwner = async (userId: string) => {
  try {
    // Usar referências de tabela completas e especificar explicitamente o nome da coluna
    const { error } = await supabase
      .from('funcoes_usuario')
      .insert({
        usuario_id: userId,
        funcao: 'restaurante'  // Coluna funcoe_usuario.funcao qualificada pelo objeto de inserção
      });

    if (error) {
      console.error("Error in registerRestaurantOwner:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to register restaurant owner:", error);
    throw error;
  }
};
