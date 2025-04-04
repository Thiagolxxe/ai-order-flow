
/**
 * Services for restaurant functionality
 */
import { connectToDatabase, ObjectId } from "@/integrations/mongodb/client";
import { authService } from "@/services/authService";

/**
 * Fetches restaurant data from MongoDB
 */
export const fetchRestaurantFromDatabase = async (restaurantId: string): Promise<any | null> => {
  try {
    // Check if the ID is valid
    if (!ObjectId.isValid(restaurantId)) {
      console.warn(`Invalid ID format for restaurant ID: ${restaurantId}`);
      return null;
    }

    const { db } = await connectToDatabase();
    const restaurants = db.collection("restaurants");
    
    // Fetch restaurant data
    const restaurant = await restaurants.findOne({
      _id: restaurantId
    });

    if (!restaurant) {
      console.log("Restaurant not found in database");
      return null;
    }

    // Get average rating
    const ratings = await db.collection("ratings")
      .find({ restaurantId: restaurantId })
      .toArray();
    
    const avgRating = calculateAverageRating(ratings);
    
    // Define default coordinates
    const defaultLat = -23.5643;
    const defaultLng = -46.6527;
    
    // Format and return restaurant data
    return {
      id: restaurant._id.toString(),
      name: restaurant.nome,
      address: `${restaurant.endereco}, ${restaurant.cidade} - ${restaurant.estado}`,
      cuisine: restaurant.tipo_cozinha,
      rating: avgRating,
      imageUrl: restaurant.banner_url || restaurant.logo_url,
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
 * Creates a new restaurant owner and restaurant
 */
export const createRestaurant = async (restaurantData: any, userData: any) => {
  try {
    // First, check if we already have an authenticated session
    const { data: sessionData } = await authService.getSession();
    let session = sessionData.session;
    let userId;
    
    if (!session) {
      // Only attempt to create a user if not already authenticated
      console.log("Creating new user account");
      
      try {
        // Create user account
        const { data: authData, error: signUpError } = await authService.signUp(
          userData.email,
          userData.password,
          {
            nome: userData.nome,
            sobrenome: userData.sobrenome,
          }
        );

        if (signUpError) {
          console.error("Sign up error:", signUpError);
          throw signUpError;
        }

        if (!authData?.user) {
          throw new Error('Failed to create user account');
        }

        userId = authData.user.id;
        session = authData.session;
        
      } catch (authError: any) {
        throw authError;
      }
    } else {
      // Use existing authenticated user
      userId = session.id;
      console.log("Using existing authenticated user:", userId);
    }

    const { db } = await connectToDatabase();
    const restaurants = db.collection("restaurants");
    const userRoles = db.collection("user_roles");
    
    // Register the restaurant
    console.log("Creating restaurant with owner ID:", userId);
    const restaurant = {
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
      created_at: new Date()
    };
    
    const result = await restaurants.insertOne(restaurant);
    
    if (!result.insertedId) {
      throw new Error("Failed to create restaurant");
    }

    // Add restaurant owner role
    await userRoles.insertOne({
      userId: userId,
      role: "restaurante",
      created_at: new Date()
    });

    console.log("Restaurant created successfully:", result.insertedId.toString());
    return { success: true, restaurantId: result.insertedId.toString(), userId };
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return { success: false, error: error.message || 'Error registering restaurant' };
  }
};

/**
 * Calculate average rating helper function
 */
function calculateAverageRating(ratings: any[]): number {
  if (!ratings || ratings.length === 0) {
    return 0;
  }
  
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / ratings.length;
}

/**
 * Gets restaurant data from the database
 */
export const getRestaurantData = async (restaurantId: string): Promise<any> => {
  // Try to fetch from database
  const dbRestaurant = await fetchRestaurantFromDatabase(restaurantId);
  
  if (dbRestaurant) {
    return dbRestaurant;
  }
  
  // Return a mock restaurant if not found
  return {
    id: restaurantId,
    name: "Restaurante Exemplo",
    address: "Rua Exemplo, 123 - São Paulo - SP",
    cuisine: "Brasileira",
    rating: 4.5,
    imageUrl: "https://via.placeholder.com/400x200",
    deliveryPosition: {
      lat: -23.5643,
      lng: -46.6527
    }
  };
};

/**
 * Registers a new user as a restaurant owner
 */
export const registerRestaurantOwner = async (userId: string) => {
  try {
    const { db } = await connectToDatabase();
    const userRoles = db.collection("user_roles");
    
    await userRoles.insertOne({
      userId: userId,
      role: "restaurante",
      created_at: new Date()
    });
    
    return true;
  } catch (error) {
    console.error("Failed to register restaurant owner:", error);
    throw error;
  }
};
