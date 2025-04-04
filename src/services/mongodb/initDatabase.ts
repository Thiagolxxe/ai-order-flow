
import { connectToDatabase } from '@/integrations/mongodb/client';

/**
 * Initialize MongoDB database with collections and indexes
 */
export const initializeDatabase = async () => {
  try {
    console.log('Initializing MongoDB database...');
    const { db } = await connectToDatabase();
    
    // Create collections if they don't exist
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map(col => col.name);
    
    const collections = [
      'users',
      'profiles',
      'restaurants',
      'menu_items',
      'categories',
      'orders',
      'order_items',
      'order_status_history',
      'addresses',
      'drivers',
      'user_roles',
      'ratings',
      'videos',
      'video_likes',
      'video_comments',
      'saved_videos',
      'coupons',
      'notifications'
    ];
    
    // Create collections that don't exist
    for (const collection of collections) {
      if (!existingCollectionNames.includes(collection)) {
        console.log(`Creating collection: ${collection}`);
        await db.createCollection(collection);
      }
    }
    
    // Create indexes
    console.log('Creating indexes...');
    
    // Users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Profiles collection
    await db.collection('profiles').createIndex({ _id: 1 }, { unique: true });
    
    // Restaurants collection
    await db.collection('restaurants').createIndex({ proprietario_id: 1 });
    await db.collection('restaurants').createIndex({ cidade: 1, estado: 1 });
    await db.collection('restaurants').createIndex({ tipo_cozinha: 1 });
    
    // Menu items collection
    await db.collection('menu_items').createIndex({ restaurante_id: 1 });
    await db.collection('menu_items').createIndex({ categoria_id: 1 });
    
    // Categories collection
    await db.collection('categories').createIndex({ restaurante_id: 1 });
    
    // Orders collection
    await db.collection('orders').createIndex({ cliente_id: 1 });
    await db.collection('orders').createIndex({ restaurante_id: 1 });
    await db.collection('orders').createIndex({ entregador_id: 1 });
    await db.collection('orders').createIndex({ numero_pedido: 1 }, { unique: true });
    
    // Order items collection
    await db.collection('order_items').createIndex({ pedido_id: 1 });
    
    // Addresses collection
    await db.collection('addresses').createIndex({ usuario_id: 1 });
    await db.collection('addresses').createIndex({ usuario_id: 1, isdefault: 1 });
    
    console.log('MongoDB database initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing MongoDB database:', error);
    return false;
  }
};
