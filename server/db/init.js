
/**
 * MongoDB Initialization Script
 * This script creates the necessary collections and indexes for the MongoDB database.
 */

const createCollectionsAndIndexes = async (db) => {
  console.log('Creating collections and indexes...');
  
  // Create collections
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
  
  // Get existing collections to avoid recreation errors
  const existingCollections = await db.listCollections().toArray();
  const existingCollectionNames = existingCollections.map(col => col.name);
  
  // Create collections that don't exist yet
  for (const collection of collections) {
    if (!existingCollectionNames.includes(collection)) {
      console.log(`Creating collection: ${collection}`);
      await db.createCollection(collection);
    } else {
      console.log(`Collection ${collection} already exists`);
    }
  }
  
  // Create indexes
  console.log('Creating indexes...');
  
  // Users collection
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  
  // Profiles collection
  // Remove the unique:true option for _id as it's already unique by default
  await db.collection('profiles').createIndex({ userId: 1 });
  
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
  
  // Order status history collection
  await db.collection('order_status_history').createIndex({ pedido_id: 1 });
  
  // Addresses collection
  await db.collection('addresses').createIndex({ usuario_id: 1 });
  await db.collection('addresses').createIndex({ usuario_id: 1, isdefault: 1 });
  
  // Drivers collection
  // Remove the unique:true option for _id as it's already unique by default
  await db.collection('drivers').createIndex({ usuario_id: 1 });
  
  // User roles collection
  await db.collection('user_roles').createIndex({ userId: 1, role: 1 }, { unique: true });
  
  // Ratings collection
  await db.collection('ratings').createIndex({ restaurante_id: 1 });
  await db.collection('ratings').createIndex({ cliente_id: 1 });
  await db.collection('ratings').createIndex({ pedido_id: 1 });
  
  // Videos collection
  await db.collection('videos').createIndex({ restaurante_id: 1 });
  await db.collection('videos').createIndex({ item_cardapio_id: 1 });
  
  // Video likes collection
  await db.collection('video_likes').createIndex({ video_id: 1 });
  await db.collection('video_likes').createIndex({ usuario_id: 1, video_id: 1 }, { unique: true });
  
  // Video comments collection
  await db.collection('video_comments').createIndex({ video_id: 1 });
  await db.collection('video_comments').createIndex({ usuario_id: 1 });
  
  // Saved videos collection
  await db.collection('saved_videos').createIndex({ usuario_id: 1 });
  await db.collection('saved_videos').createIndex({ usuario_id: 1, video_id: 1 }, { unique: true });
  
  // Coupons collection
  await db.collection('coupons').createIndex({ codigo: 1 }, { unique: true });
  await db.collection('coupons').createIndex({ restaurante_id: 1 });
  
  // Notifications collection
  await db.collection('notifications').createIndex({ usuario_id: 1 });
  
  console.log('Collections and indexes created successfully!');
};

module.exports = { createCollectionsAndIndexes };
