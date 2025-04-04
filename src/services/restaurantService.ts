
import { connectToDatabase, ObjectId } from '@/integrations/mongodb/client';
import { toast } from 'sonner';

// Interface for restaurant data
interface RestaurantData {
  nome: string;
  tipo_cozinha: string;
  descricao?: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  faixa_preco: number;
}

// Interface for user data
interface UserData {
  email: string;
  password: string;
  nome: string;
  sobrenome: string;
}

/**
 * Create a new restaurant and owner account
 */
export const createRestaurant = async (
  restaurantData: RestaurantData,
  userData: UserData
): Promise<{ success: boolean; restaurantId?: string; userId?: string; error?: string }> => {
  try {
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Create user account
    const userId = new ObjectId().toString();
    const user = {
      _id: userId,
      email: userData.email,
      password: userData.password, // In a real app, this would be hashed
      created_at: new Date().toISOString()
    };
    
    const userResult = await db.collection('users').insertOne(user);
    
    if (!userResult.data) {
      throw new Error('Falha ao criar conta de usuário');
    }
    
    // Create profile
    const profileResult = await db.collection('profiles').insertOne({
      _id: userId,
      nome: userData.nome,
      sobrenome: userData.sobrenome,
      created_at: new Date().toISOString()
    });
    
    if (!profileResult.data) {
      throw new Error('Falha ao criar perfil de usuário');
    }
    
    // Assign restaurant owner role
    const roleResult = await db.collection('user_roles').insertOne({
      usuario_id: userId,
      role_name: 'restaurante',
      created_at: new Date().toISOString()
    });
    
    if (!roleResult.data) {
      throw new Error('Falha ao atribuir papel de proprietário');
    }
    
    // Create restaurant
    const restaurant = {
      ...restaurantData,
      proprietario_id: userId,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const restaurantResult = await db.collection('restaurants').insertOne(restaurant);
    
    if (!restaurantResult.data) {
      throw new Error('Falha ao criar restaurante');
    }
    
    return {
      success: true,
      restaurantId: restaurantResult.data.insertedId,
      userId
    };
  } catch (error: any) {
    console.error('Error creating restaurant:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar restaurante'
    };
  }
};

/**
 * Get restaurant details by ID
 */
export const getRestaurantData = async (id: string) => {
  try {
    if (!id || !ObjectId.isValid(id)) {
      throw new Error('ID de restaurante inválido');
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Fetch restaurant
    const restaurantResult = await db.collection('restaurants').findOne({
      _id: id
    });
    
    if (!restaurantResult.data) {
      throw new Error('Restaurante não encontrado');
    }
    
    // Fetch ratings
    const ratingsResult = await db.collection('ratings').find({
      restaurante_id: id
    }).toArray();
    
    // Calculate average rating
    let avgRating = 0;
    if (ratingsResult.data && ratingsResult.data.length > 0) {
      const totalRating = ratingsResult.data.reduce((acc, curr) => acc + curr.nota, 0);
      avgRating = totalRating / ratingsResult.data.length;
    }
    
    return {
      id: restaurantResult.data._id.toString(),
      name: restaurantResult.data.nome,
      address: `${restaurantResult.data.endereco}, ${restaurantResult.data.cidade} - ${restaurantResult.data.estado}`,
      cuisine: restaurantResult.data.tipo_cozinha,
      rating: avgRating,
      imageUrl: restaurantResult.data.banner_url || restaurantResult.data.logo_url,
      deliveryPosition: {
        lat: -23.5643,
        lng: -46.6527
      }
    };
  } catch (error: any) {
    console.error('Error fetching restaurant data:', error);
    toast.error(error.message || 'Erro ao buscar dados do restaurante');
    return null;
  }
};
