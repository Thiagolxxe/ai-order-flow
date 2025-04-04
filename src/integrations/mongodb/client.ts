
/**
 * MongoDB client for connecting to the database
 */

// Use a type declaration for ObjectId
export class ObjectId {
  constructor(id?: string) {
    // Implementation not needed for front-end
  }

  toString(): string {
    return "mock-object-id";
  }

  static isValid(id?: string): boolean {
    if (!id) return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

// Connection status
const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  ERROR: 'error'
};

let connectionStatus = CONNECTION_STATUS.DISCONNECTED;
let connectionError: Error | null = null;

// Define response type for MongoDB operations
export interface MongoResponse<T> {
  data: T;
  error: null | Error;
}

// Define collection interface
interface MongoCollection {
  findOne: (query: any) => Promise<MongoResponse<any>>;
  find: (query: any) => {
    toArray: () => Promise<MongoResponse<any[]>>;
  };
  insertOne: (document: any) => Promise<MongoResponse<{ insertedId: string }>>;
  updateOne: (filter: any, update: any) => Promise<MongoResponse<{ modifiedCount: number }>>;
  deleteOne: (filter: any) => Promise<MongoResponse<{ deletedCount: number }>>;
}

// Mock MongoDB client
export async function connectToDatabase() {
  try {
    connectionStatus = CONNECTION_STATUS.CONNECTING;
    console.log('Connecting to MongoDB...');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    connectionStatus = CONNECTION_STATUS.CONNECTED;
    console.log('Connected to MongoDB');
    
    // Define database operations
    const db = {
      collection: (collectionName: string): MongoCollection => {
        return {
          // Find one document
          findOne: async (query: any): Promise<MongoResponse<any>> => {
            console.log(`MongoDB findOne on ${collectionName}:`, query);
            // Return mock data based on collection
            const data = getMockDataByCollection(collectionName, query);
            return { data, error: null };
          },
          
          // Find multiple documents
          find: (query: any) => {
            console.log(`MongoDB find on ${collectionName}:`, query);
            return {
              toArray: async (): Promise<MongoResponse<any[]>> => {
                // Return array of mock data based on collection
                return { data: [getMockDataByCollection(collectionName, query)], error: null };
              }
            };
          },
          
          // Insert one document
          insertOne: async (document: any): Promise<MongoResponse<{ insertedId: string }>> => {
            console.log(`MongoDB insertOne on ${collectionName}:`, document);
            return {
              data: {
                insertedId: new ObjectId().toString()
              },
              error: null
            };
          },
          
          // Update one document
          updateOne: async (filter: any, update: any): Promise<MongoResponse<{ modifiedCount: number }>> => {
            console.log(`MongoDB updateOne on ${collectionName}:`, { filter, update });
            return {
              data: {
                modifiedCount: 1
              },
              error: null
            };
          },
          
          // Delete one document
          deleteOne: async (filter: any): Promise<MongoResponse<{ deletedCount: number }>> => {
            console.log(`MongoDB deleteOne on ${collectionName}:`, filter);
            return {
              data: {
                deletedCount: 1
              },
              error: null
            };
          }
        };
      }
    };
    
    return { db };
  } catch (error) {
    connectionStatus = CONNECTION_STATUS.ERROR;
    connectionError = error as Error;
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Helper function to generate mock data based on collection name
function getMockDataByCollection(collectionName: string, query: any): any {
  switch (collectionName) {
    case 'users':
      return {
        _id: new ObjectId().toString(),
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user',
        createdAt: new Date()
      };
    case 'restaurants':
      return {
        _id: new ObjectId().toString(),
        nome: 'Example Restaurant',
        tipo_cozinha: 'Italian',
        endereco: '123 Main St',
        cidade: 'Example City',
        estado: 'SP',
        deliveryFee: 5.0,
        valor_pedido_minimo: 20.0,
        tempo_entrega_estimado: 30,
        logo_url: '/images/restaurants/logo-default.png',
        banner_url: '/images/restaurants/banner-default.jpg'
      };
    case 'orders':
      return {
        _id: new ObjectId().toString(),
        numero_pedido: 'ORD-' + Math.floor(Math.random() * 1000000),
        status: 'pendente',
        restaurante_id: new ObjectId().toString(),
        endereco_entrega: '123 Main St',
        cidade_entrega: 'Example City',
        estado_entrega: 'SP',
        criado_em: new Date().toISOString(),
        subtotal: 15.0,
        taxa_entrega: 5.0,
        total: 20.0,
        entregador_id: new ObjectId().toString(),
        restaurantes: { 
          nome: 'Mock Restaurant',
          id: 'mock-restaurant-id'
        }
      };
    case 'menu_items':
      return {
        _id: new ObjectId().toString(),
        nome: 'Pizza Margherita',
        descricao: 'Classic Italian pizza with tomato and mozzarella',
        preco: 15.0,
        disponivel: true,
        restaurante_id: new ObjectId().toString()
      };
    case 'profiles':
      return {
        _id: query.id || new ObjectId().toString(),
        nome: 'John',
        sobrenome: 'Doe',
        telefone: '555-123-4567'
      };
    case 'enderecos':
      return { 
        _id: new ObjectId().toString(), 
        endereco: '123 Main St', 
        complemento: 'Apt 4B', 
        bairro: 'Centro', 
        cidade: 'São Paulo', 
        estado: 'SP', 
        cep: '01234-567',
        isdefault: true
      };
    case 'ratings':
      return {
        _id: new ObjectId().toString(),
        restaurantId: query.restaurantId || new ObjectId().toString(),
        rating: 4.5,
        comment: 'Great food and service!'
      };
    case 'promocoes':
      return {
        _id: new ObjectId().toString(),
        codigo: 'DISCOUNT10',
        valor: 10,
        tipo: 'percentual',
        restaurante_id: query.restaurante_id || new ObjectId().toString(),
        valor_pedido_minimo: 20.0,
        data_inicio: new Date(Date.now() - 86400000).toISOString(),
        data_fim: new Date(Date.now() + 86400000).toISOString(),
        ativo: true
      };
    case 'entregadores':
      return { 
        _id: query.id || new ObjectId().toString(), 
        tipo_veiculo: 'Moto', 
        latitude_atual: -23.5505, 
        longitude_atual: -46.6333 
      };
    case 'itens_pedido':
      return {
        _id: new ObjectId().toString(),
        pedido_id: query.pedido_id || new ObjectId().toString(),
        quantidade: 1,
        nome_item_cardapio: 'Pizza Margherita',
        preco_unitario: 15.0,
        preco_total: 15.0
      };
    default:
      return {
        _id: new ObjectId().toString(),
        createdAt: new Date()
      };
  }
}

/**
 * Get connection status
 */
export function getConnectionStatus() {
  return {
    status: connectionStatus,
    error: connectionError
  };
}

/**
 * Check if connected to database
 */
export function isConnected() {
  return connectionStatus === CONNECTION_STATUS.CONNECTED;
}

/**
 * Check MongoDB connection status
 * @returns Promise<boolean> True if connection is successful
 */
export async function checkMongoDBConnection(): Promise<boolean> {
  try {
    // If already connected, return true
    if (connectionStatus === CONNECTION_STATUS.CONNECTED) {
      return true;
    }
    
    // Try to connect
    await connectToDatabase();
    return true;
  } catch (error) {
    console.error('MongoDB connection check failed:', error);
    return false;
  }
}
