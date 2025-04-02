
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
 * Creates a new restaurant owner and restaurant with enhanced error handling
 */
export const createRestaurant = async (restaurantData: any, userData: any) => {
  try {
    // Check if we already have an authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    let userId;
    
    if (!user) {
      // Only attempt to create a user if not already authenticated
      console.log("Creating new user account");
      
      try {
        // 1. Create user account
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

        if (signUpError) {
          // Handle rate limiting errors specifically
          if (signUpError.message.includes("security purposes") || signUpError.status === 429) {
            console.error("Rate limit reached:", signUpError);
            return {
              success: false, 
              error: "Muitas tentativas recentes. Por favor, aguarde um minuto e tente novamente.",
              isRateLimited: true,
              timeToWait: extractWaitTime(signUpError.message)
            };
          }
          
          console.error("Sign up error:", signUpError);
          throw signUpError;
        }

        if (!authData.user) {
          throw new Error('Falha ao criar conta de usuário');
        }

        userId = authData.user.id;
      } catch (authError: any) {
        // Check for rate limit error in the catch block as well
        if (authError.message && (authError.message.includes("security purposes") || authError.status === 429)) {
          console.error("Rate limit caught in catch:", authError);
          return {
            success: false, 
            error: "Muitas tentativas recentes. Por favor, aguarde um minuto e tente novamente.",
            isRateLimited: true,
            timeToWait: extractWaitTime(authError.message)
          };
        }
        throw authError;
      }
    } else {
      // Use existing authenticated user
      userId = user.id;
      console.log("Using existing authenticated user:", userId);
    }

    // 2. Register the restaurant with the proprietario_id set to the user ID
    console.log("Creating restaurant with owner ID:", userId);
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

    if (restaurantError) {
      console.error("Restaurant creation error:", restaurantError);
      throw restaurantError;
    }

    // 3. Add restaurant owner role
    const { error: roleError } = await supabase
      .from('funcoes_usuario')
      .insert({
        usuario_id: userId,
        role_name: 'restaurante'
      });

    if (roleError) {
      console.error("Role assignment error:", roleError);
      throw roleError;
    }

    console.log("Restaurant created successfully:", restaurant?.id);
    return { success: true, restaurantId: restaurant?.id, userId };
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return { success: false, error: error.message || 'Erro ao cadastrar restaurante' };
  }
};

/**
 * Extract wait time from Supabase rate limiting error message
 */
function extractWaitTime(errorMessage: string): number {
  // Default wait time in seconds if we can't extract it
  const defaultWaitTime = 60;
  
  // Try to extract the wait time from the error message
  // Example message: "For security purposes, you can only request this after 46 seconds"
  const match = errorMessage.match(/after (\d+) seconds/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return defaultWaitTime;
}

/**
 * Registers a new user as a restaurant owner
 */
export const registerRestaurantOwner = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('funcoes_usuario')
      .insert({
        usuario_id: userId,
        role_name: 'restaurante'
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
