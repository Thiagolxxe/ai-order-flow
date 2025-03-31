
import { supabase } from '@/integrations/supabase/client';
import { 
  validateImageUrl, 
  calculateAverageRating, 
  getMockRestaurantData 
} from '@/utils/restaurant-helpers';
import { RestaurantDetailsData } from '@/hooks/useRestaurantDetails';
import { isValidUUID } from '@/utils/id-helpers';
import { toast } from '@/components/ui/use-toast';

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
    
    // Define default coordinates
    const defaultLat = -23.5643;
    const defaultLng = -46.6527;
    
    // Format and return restaurant data
    return {
      id: data.id,
      name: data.nome,
      address: `${data.endereco}, ${data.cidade} - ${data.estado}`,
      cuisine: data.tipo_cozinha,
      rating: avgRating,
      imageUrl: imageUrl,
      deliveryPosition: {
        lat: defaultLat,
        lng: defaultLng
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
 * Creates a new restaurant owner and restaurant
 */
export const createRestaurant = async (restaurantData: any, userData: any) => {
  try {
    // 1. Create user account first
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          nome: userData.nome,
          sobrenome: userData.sobrenome,
        }
      }
    });

    if (signUpError) throw signUpError;

    if (!authData.user) {
      throw new Error('Falha ao criar conta de usuário');
    }

    const userId = authData.user.id;

    // 2. Register the restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurantes')
      .insert({
        nome: restaurantData.nome,
        tipo_cozinha: restaurantData.tipo_cozinha,
        descricao: restaurantData.descricao || null,
        telefone: restaurantData.telefone,
        endereco: restaurantData.endereco,
        cidade: restaurantData.cidade,
        estado: restaurantData.estado,
        cep: restaurantData.cep,
        faixa_preco: restaurantData.faixa_preco,
        proprietario_id: userId,
      })
      .select()
      .single();

    if (restaurantError) throw restaurantError;

    // 3. Add restaurant owner role - Fixed: Use new column name
    const { error: roleError } = await supabase
      .from('funcoes_usuario')
      .insert({
        usuario_id: userId,
        role_name: 'restaurante'  // Updated field name
      });

    if (roleError) throw roleError;

    return { success: true, restaurantId: restaurant.id, userId };
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return { success: false, error: error.message || 'Erro ao cadastrar restaurante' };
  }
};

/**
 * Registers a new user as a restaurant owner
 */
export const registerRestaurantOwner = async (userId: string) => {
  try {
    // Updated field name to avoid ambiguity
    const { error } = await supabase
      .from('funcoes_usuario')
      .insert({
        usuario_id: userId,
        role_name: 'restaurante'  // Updated field name
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

// New functions to fetch states and cities

/**
 * Gets all Brazilian states from the database
 */
export const fetchEstados = async () => {
  try {
    const { data, error } = await supabase
      .from('estados')
      .select('uf, nome')
      .order('nome');

    if (error) {
      console.error('Error fetching states:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch states:', error);
    return [];
  }
};

/**
 * Gets cities by state from the database
 */
export const fetchCidadesByEstado = async (uf: string) => {
  if (!uf) return [];
  
  try {
    const { data, error } = await supabase
      .from('cidades')
      .select('id, nome')
      .eq('estado_uf', uf)
      .order('nome');

    if (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    return [];
  }
};
