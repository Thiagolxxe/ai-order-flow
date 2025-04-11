
// Mock implementation of MongoDB client for browser-side usage
// This avoids Node.js-specific dependencies like 'events' and 'crypto'

// Simple ObjectId implementation for browser
export class ObjectId {
  id: string;
  
  constructor(id?: string) {
    this.id = id || this._generateId();
  }
  
  toString() {
    return this.id;
  }
  
  // Simple ID generator for browser context
  private _generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // Check if a string is a valid ObjectId
  static isValid(id?: string): boolean {
    if (!id) return false;
    return typeof id === 'string' && id.length > 0;
  }
}

// Connection status tracking
let connectionStatus = {
  status: 'disconnected' as 'disconnected' | 'connecting' | 'connected',
  error: null as Error | null,
  lastAttempt: null as Date | null,
  retryCount: 0
};

export function getConnectionStatus() {
  return connectionStatus;
}

export function isConnected() {
  return connectionStatus.status === 'connected';
}

// Interface for MongoDB responses
export interface MongoResponse<T> {
  data: T;
  count?: number;
  toArray?: () => T;
}

// Interface for the MongoDB client
interface MongoClient {
  db: {
    collection: (collectionName: string) => {
      find: (query?: any) => Promise<MongoResponse<any[]>>;
      findOne: (query?: any) => Promise<{ data: any; error?: any }>;
      insertOne: (document: any) => Promise<{ data: any; error?: any }>;
      updateOne: (query: any, update: any) => Promise<{ data: any; error?: any }>;
      deleteOne: (query: any) => Promise<{ data: any; error?: any }>;
      createIndex?: (keys: any, options?: any) => Promise<string>;
      listCollections?: () => Promise<MongoResponse<any[]>>;
      toArray?: () => Promise<any[]>;
    };
    listCollections?: () => Promise<MongoResponse<any[]>>;
    createCollection?: (name: string, options?: any) => Promise<{ data: any }>;
  };
}

// Simulated MongoDB client for browser development
let mongoClient: MongoClient | null = null;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos

// Connect to MongoDB Atlas
export async function connectToDatabase(): Promise<{ db: any }> {
  try {
    connectionStatus.lastAttempt = new Date();
    console.log('Conectando ao MongoDB Atlas...');
    connectionStatus = { 
      ...connectionStatus, 
      status: 'connecting', 
      error: null 
    };

    // In a real app, we would connect to MongoDB Atlas
    // For this example, we're simulating the connection with some delay
    // to test connection functionality
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create a client object
    mongoClient = {
      db: {
        collection: (collectionName: string) => ({
          find: async (query = {}) => {
            console.log(`Buscando documentos em ${collectionName} com query:`, query);
            await testConnection();
            
            // Mock data with toArray method
            const response = {
              data: [],
              count: 0,
              toArray: function() { return this.data; }
            };
            
            return response;
          },
          findOne: async (query = {}) => {
            console.log(`Buscando um documento em ${collectionName} com query:`, query);
            await testConnection();
            return { data: null };
          },
          insertOne: async (document) => {
            console.log(`Inserindo documento em ${collectionName}:`, document);
            await testConnection();
            return { data: { insertedId: new ObjectId() } };
          },
          updateOne: async (query, update) => {
            console.log(`Atualizando documento em ${collectionName}:`, { query, update });
            await testConnection();
            return { data: { modifiedCount: 1 } };
          },
          deleteOne: async (query) => {
            console.log(`Deletando documento de ${collectionName} com query:`, query);
            await testConnection();
            return { data: { deletedCount: 1 } };
          },
          createIndex: async (keys, options) => {
            console.log(`Criando índice em ${collectionName}:`, { keys, options });
            await testConnection();
            return 'index-name';
          },
          toArray: async () => {
            await testConnection();
            return [];
          }
        }),
        listCollections: async () => {
          await testConnection();
          return {
            data: [],
            toArray: () => []
          };
        },
        createCollection: async (name, options) => {
          console.log(`Criando coleção ${name}:`, options);
          await testConnection();
          return { data: { name } };
        }
      }
    };
    
    // Teste de conexão inicial
    await testConnection();
    
    connectionStatus = { 
      ...connectionStatus, 
      status: 'connected', 
      error: null,
      retryCount: 0 
    };
    console.log('Conectado ao MongoDB Atlas com sucesso');
    
    return { db: mongoClient.db };
  } catch (error) {
    const err = error as Error;
    console.error('Falha ao conectar ao MongoDB Atlas:', err);
    
    // Atualizar status de conexão
    connectionStatus = { 
      ...connectionStatus, 
      status: 'disconnected', 
      error: err,
      retryCount: connectionStatus.retryCount + 1
    };
    
    // Se ainda não excedeu o número máximo de tentativas, tenta reconectar
    if (connectionStatus.retryCount < MAX_RETRIES) {
      console.log(`Tentando reconectar (${connectionStatus.retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToDatabase();
    }
    
    throw new Error(`Falha ao conectar ao MongoDB Atlas após ${MAX_RETRIES} tentativas: ${err.message}`);
  }
}

// Função para testar a conexão com o MongoDB Atlas
async function testConnection() {
  try {
    // Simulação de um ping para o servidor MongoDB Atlas
    // Em uma implementação real, isso seria um comando de ping real
    console.log("Testando conexão com MongoDB Atlas...");
    
    // Simular uma resposta de ping bem-sucedida
    return true;
  } catch (error) {
    console.error("Teste de conexão com MongoDB Atlas falhou:", error);
    throw new Error("Falha no teste de conexão com MongoDB Atlas");
  }
}

// Get database instance (creating connection if needed)
export async function getDb() {
  if (!mongoClient) {
    await connectToDatabase();
  }
  return mongoClient?.db;
}

// Add toArray method to promises that don't have it
export function extendWithToArray<T>(promise: Promise<MongoResponse<T[]>>): Promise<MongoResponse<T[]> & { toArray: () => Promise<T[]> }> {
  return promise.then(result => {
    if (!result.toArray) {
      (result as any).toArray = () => Promise.resolve(result.data);
    }
    return result as MongoResponse<T[]> & { toArray: () => Promise<T[]> };
  });
}
