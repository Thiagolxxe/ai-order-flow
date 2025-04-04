
import { connectToDatabase } from '@/integrations/mongodb/client';

/**
 * Service for restaurant-related operations
 */
export const restaurantService = {
  /**
   * Get featured restaurants
   */
  getFeaturedRestaurants: async () => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('restaurants');
      
      const result = await collection.find({ 
        ativo: true,
        destaque: true
      }).toArray();
      
      if (result.error) {
        throw new Error('Failed to fetch featured restaurants');
      }
      
      return result.data.map(restaurant => ({
        id: restaurant._id,
        nome: restaurant.nome,
        endereco: `${restaurant.endereco}, ${restaurant.cidade}-${restaurant.estado}`,
        tipo_cozinha: restaurant.tipo_cozinha,
        taxa_entrega: restaurant.taxa_entrega,
        tempo_entrega_estimado: restaurant.tempo_entrega_estimado,
        logo_url: restaurant.logo_url,
        banner_url: restaurant.banner_url,
        avaliacao: restaurant.avaliacao || 0
      }));
    } catch (error) {
      console.error('Error fetching featured restaurants:', error);
      return [];
    }
  },

  /**
   * Get restaurant by ID
   */
  getRestaurantById: async (id) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('restaurants');
      
      const result = await collection.findOne({ _id: id });
      
      if (result.error || !result.data) {
        throw new Error('Restaurant not found');
      }
      
      return {
        id: result.data._id,
        nome: result.data.nome,
        endereco: result.data.endereco,
        cidade: result.data.cidade,
        estado: result.data.estado,
        tipo_cozinha: result.data.tipo_cozinha,
        descricao: result.data.descricao,
        taxa_entrega: result.data.taxa_entrega,
        tempo_entrega_estimado: result.data.tempo_entrega_estimado,
        valor_pedido_minimo: result.data.valor_pedido_minimo,
        telefone: result.data.telefone,
        email: result.data.email,
        logo_url: result.data.logo_url,
        banner_url: result.data.banner_url,
        avaliacao: result.data.avaliacao || 0
      };
    } catch (error) {
      console.error(`Error fetching restaurant with ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Get restaurant menu categories
   */
  getMenuCategories: async (restaurantId) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('categories');
      
      const result = await collection.find({ 
        restaurante_id: restaurantId
      }).toArray();
      
      if (result.error) {
        throw new Error('Failed to fetch menu categories');
      }
      
      return result.data.map(category => ({
        id: category._id,
        nome: category.nome,
        descricao: category.descricao || '',
        ordem_exibicao: category.ordem_exibicao || 0
      })).sort((a, b) => a.ordem_exibicao - b.ordem_exibicao);
    } catch (error) {
      console.error(`Error fetching menu categories for restaurant ${restaurantId}:`, error);
      return [];
    }
  },

  /**
   * Get menu items for a restaurant
   */
  getMenuItems: async (restaurantId, categoryId = null) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('menu_items');
      
      const query: any = { restaurante_id: restaurantId, disponivel: true };
      
      if (categoryId) {
        query.categoria_id = categoryId;
      }
      
      const result = await collection.find(query).toArray();
      
      if (result.error) {
        throw new Error('Failed to fetch menu items');
      }
      
      return result.data.map(item => ({
        id: item._id,
        nome: item.nome,
        descricao: item.descricao || '',
        preco: item.preco,
        imagem_url: item.imagem_url,
        destaque: !!item.destaque,
        categoria_id: item.categoria_id
      }));
    } catch (error) {
      console.error(`Error fetching menu items for restaurant ${restaurantId}:`, error);
      return [];
    }
  },

  /**
   * Create a new restaurant (for owner registration)
   */
  createRestaurant: async (restaurantData, ownerId) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('restaurants');
      
      const data = {
        ...restaurantData,
        proprietario_id: ownerId,
        ativo: true,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString()
      };
      
      const result = await collection.insertOne(data);
      
      if (result.error) {
        throw new Error('Failed to create restaurant');
      }
      
      return {
        id: result.data.insertedId,
        ...data
      };
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  },

  /**
   * Add or update a menu item
   */
  saveMenuItem: async (restaurantId, itemData) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection('menu_items');
      
      let result;
      
      if (itemData.id) {
        // Update existing item
        result = await collection.updateOne(
          { _id: itemData.id },
          { 
            $set: {
              ...itemData,
              restaurante_id: restaurantId,
              atualizado_em: new Date().toISOString()
            }
          }
        );
        
        if (result.error) {
          throw new Error('Failed to update menu item');
        }
        
        return {
          id: itemData.id,
          ...itemData
        };
      } else {
        // Create new item
        const data = {
          ...itemData,
          restaurante_id: restaurantId,
          disponivel: true,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        };
        
        result = await collection.insertOne(data);
        
        if (result.error) {
          throw new Error('Failed to create menu item');
        }
        
        return {
          id: result.data.insertedId,
          ...data
        };
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      throw error;
    }
  }
};
