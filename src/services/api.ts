
import { connectToDatabase, ObjectId } from "@/integrations/mongodb/client";

/**
 * Service layer to handle all MongoDB API operations
 * In a real application, these would call a backend API instead of directly using the MongoDB client
 */
export const api = {
  // Auth operations
  auth: {
    signUp: async (email: string, password: string, userData: any) => {
      try {
        const { db } = await connectToDatabase();
        
        // Check if user exists
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
          return { error: { message: 'Email already registered' } };
        }
        
        // Create user
        const user = {
          email,
          password, // In a real app, this would be hashed on the server
          ...userData,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        const result = await db.collection('users').insertOne(user);
        
        return {
          data: {
            user: {
              id: result.insertedId.toString(),
              email,
              ...userData
            },
            session: {
              user: {
                id: result.insertedId.toString(),
                email
              },
              access_token: `mock_token_${result.insertedId.toString()}`,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
          }
        };
      } catch (error) {
        console.error('Sign up error:', error);
        return { error: { message: 'Failed to create account' } };
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        const { db } = await connectToDatabase();
        
        // Find user by email and password
        const user = await db.collection('users').findOne({ email, password });
        
        if (!user) {
          return { error: { message: 'Invalid login credentials' } };
        }
        
        // Create session
        const session = {
          user: {
            id: user._id.toString(),
            email: user.email
          },
          access_token: `mock_token_${user._id.toString()}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        };
        
        // Store session in localStorage
        localStorage.setItem('deliveryapp_session', JSON.stringify({
          session,
          expires_at: session.expires_at.toISOString()
        }));
        
        return {
          data: {
            user: {
              id: user._id.toString(),
              email: user.email,
              nome: user.nome,
              sobrenome: user.sobrenome
            },
            session
          }
        };
      } catch (error) {
        console.error('Sign in error:', error);
        return { error: { message: 'Authentication failed' } };
      }
    },
    
    signOut: async () => {
      try {
        // Remove session from localStorage
        localStorage.removeItem('deliveryapp_session');
        
        return { error: null };
      } catch (error) {
        console.error('Sign out error:', error);
        return { error: { message: 'Failed to sign out' } };
      }
    },
    
    getSession: async () => {
      try {
        // Get session from localStorage
        const sessionStr = localStorage.getItem('deliveryapp_session');
        
        if (!sessionStr) {
          return { data: { session: null } };
        }
        
        const { session, expires_at } = JSON.parse(sessionStr);
        
        // Check if session is expired
        if (new Date(expires_at) < new Date()) {
          localStorage.removeItem('deliveryapp_session');
          return { data: { session: null } };
        }
        
        return { data: { session } };
      } catch (error) {
        console.error('Get session error:', error);
        return { data: { session: null } };
      }
    }
  },
  
  // Restaurant operations
  restaurants: {
    create: async (restaurantData: any, userData: any) => {
      try {
        const { db } = await connectToDatabase();
        
        // First check if user exists
        let userId;
        
        // Check if we already have an authenticated session
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (sessionStr) {
          const { session } = JSON.parse(sessionStr);
          userId = session.user.id;
        } else {
          // Create user
          const userResult = await api.auth.signUp(userData.email, userData.password, {
            nome: userData.nome,
            sobrenome: userData.sobrenome
          });
          
          if (userResult.error) {
            throw new Error(userResult.error.message);
          }
          
          userId = userResult.data.user.id;
        }
        
        // Create restaurant
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
        
        const result = await db.collection('restaurants').insertOne(restaurant);
        
        // Add restaurant owner role
        await db.collection('user_roles').insertOne({
          userId: userId,
          role: 'restaurante',
          created_at: new Date()
        });
        
        return { 
          success: true, 
          restaurantId: result.insertedId.toString(), 
          userId 
        };
      } catch (error) {
        console.error('Create restaurant error:', error);
        return { 
          success: false, 
          error: error.message || 'Error creating restaurant' 
        };
      }
    },
    
    getById: async (id: string) => {
      try {
        const { db } = await connectToDatabase();
        
        // Get restaurant by ID
        const restaurant = await db.collection('restaurants').findOne({
          _id: id
        });
        
        if (!restaurant) {
          return { error: { message: 'Restaurant not found' } };
        }
        
        // Get ratings
        const ratings = await db.collection('ratings')
          .find({ restaurantId: id })
          .toArray();
        
        const avgRating = ratings.length > 0
          ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
          : 0;
        
        return {
          data: {
            id: restaurant._id.toString(),
            name: restaurant.nome,
            address: `${restaurant.endereco}, ${restaurant.cidade} - ${restaurant.estado}`,
            cuisine: restaurant.tipo_cozinha,
            rating: avgRating,
            imageUrl: restaurant.banner_url || restaurant.logo_url,
            deliveryPosition: {
              lat: -23.5643,
              lng: -46.6527
            }
          }
        };
      } catch (error) {
        console.error('Get restaurant error:', error);
        return { error: { message: 'Failed to get restaurant' } };
      }
    }
  },
  
  // Delivery operations
  delivery: {
    register: async (deliveryData: any, userData: any) => {
      try {
        const { db } = await connectToDatabase();
        
        // Check if user exists
        let userId;
        
        // Check if we already have an authenticated session
        const sessionStr = localStorage.getItem('deliveryapp_session');
        if (sessionStr) {
          const { session } = JSON.parse(sessionStr);
          userId = session.user.id;
        } else {
          // Create user
          const userResult = await api.auth.signUp(userData.email, userData.password, {
            nome: userData.nome,
            sobrenome: userData.sobrenome
          });
          
          if (userResult.error) {
            throw new Error(userResult.error.message);
          }
          
          userId = userResult.data.user.id;
        }
        
        // Create delivery person profile
        const deliveryPerson = {
          ...deliveryData,
          user_id: userId,
          status: 'pending',
          created_at: new Date()
        };
        
        const result = await db.collection('delivery_people').insertOne(deliveryPerson);
        
        // Add delivery person role
        await db.collection('user_roles').insertOne({
          userId: userId,
          role: 'entregador',
          created_at: new Date()
        });
        
        return { 
          success: true, 
          deliveryId: result.insertedId.toString(), 
          userId 
        };
      } catch (error) {
        console.error('Register delivery person error:', error);
        return { 
          success: false, 
          error: error.message || 'Error registering delivery person' 
        };
      }
    },
    
    getProfile: async (userId: string) => {
      try {
        const { db } = await connectToDatabase();
        
        // Get delivery person profile
        const profile = await db.collection('delivery_people').findOne({
          user_id: userId
        });
        
        if (!profile) {
          return { error: { message: 'Delivery profile not found' } };
        }
        
        return { data: profile };
      } catch (error) {
        console.error('Get delivery profile error:', error);
        return { error: { message: 'Failed to get delivery profile' } };
      }
    }
  },
  
  // Notifications
  notifications: {
    getByUserId: async (userId: string) => {
      try {
        const { db } = await connectToDatabase();
        
        // Get notifications by user ID
        const notifications = await db.collection('notifications')
          .find({ usuario_id: userId })
          .toArray();
        
        return { data: notifications };
      } catch (error) {
        console.error('Get notifications error:', error);
        return { error: { message: 'Failed to get notifications' } };
      }
    },
    
    markAsRead: async (id: string) => {
      try {
        const { db } = await connectToDatabase();
        
        // Mark notification as read
        await db.collection('notifications').updateOne(
          { _id: id },
          { $set: { lida: true } }
        );
        
        return { success: true };
      } catch (error) {
        console.error('Mark notification as read error:', error);
        return { success: false, error: error.message };
      }
    }
  }
};
