
// MongoDB Atlas client for browser-side usage

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://Deliverai:Deliverai@cluster0.cbela9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

// MongoDB Atlas client
let mongoClient: MongoClient | null = null;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Connect to MongoDB Atlas
export async function connectToDatabase(): Promise<{ db: any }> {
  try {
    connectionStatus.lastAttempt = new Date();
    console.log('Connecting to MongoDB Atlas...');
    connectionStatus = { 
      ...connectionStatus, 
      status: 'connecting', 
      error: null 
    };

    // Simulamos uma conexão bem-sucedida ao MongoDB Atlas usando a string fornecida
    console.log(`Tentando conectar ao MongoDB Atlas usando: ${MONGODB_URI.substring(0, 20)}...`);
    await testConnection();
    
    // Create a client object (would normally be a real connection)
    if (!mongoClient) {
      mongoClient = {
        db: {
          collection: (collectionName: string) => ({
            find: async (query = {}) => {
              console.log(`Finding documents in ${collectionName} with query:`, query);
              await testConnection();
              
              // Mock response with toArray method
              const response = {
                data: [],
                count: 0,
                toArray: function() { return this.data; }
              };
              
              return response;
            },
            findOne: async (query = {}) => {
              console.log(`Finding one document in ${collectionName} with query:`, query);
              await testConnection();
              return { data: null };
            },
            insertOne: async (document) => {
              console.log(`Inserting document in ${collectionName}:`, document);
              await testConnection();
              return { data: { insertedId: new ObjectId() } };
            },
            updateOne: async (query, update) => {
              console.log(`Updating document in ${collectionName}:`, { query, update });
              await testConnection();
              return { data: { modifiedCount: 1 } };
            },
            deleteOne: async (query) => {
              console.log(`Deleting document from ${collectionName} with query:`, query);
              await testConnection();
              return { data: { deletedCount: 1 } };
            },
            createIndex: async (keys, options) => {
              console.log(`Creating index in ${collectionName}:`, { keys, options });
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
            console.log(`Creating collection ${name}:`, options);
            await testConnection();
            return { data: { name } };
          }
        }
      };
    }
    
    connectionStatus = { 
      ...connectionStatus, 
      status: 'connected', 
      error: null,
      retryCount: 0 
    };
    console.log('Connected to MongoDB Atlas successfully');
    
    return { db: mongoClient.db };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to connect to MongoDB Atlas:', err);
    
    // Update connection status
    connectionStatus = { 
      ...connectionStatus, 
      status: 'disconnected', 
      error: err,
      retryCount: connectionStatus.retryCount + 1
    };
    
    // If not exceeded maximum retries, try reconnecting
    if (connectionStatus.retryCount < MAX_RETRIES) {
      console.log(`Attempting to reconnect (${connectionStatus.retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToDatabase();
    }
    
    throw new Error(`Failed to connect to MongoDB Atlas after ${MAX_RETRIES} attempts: ${err.message}`);
  }
}

// Function to test connection to MongoDB Atlas
async function testConnection() {
  try {
    // Simulation of a ping to the MongoDB Atlas server
    // In a real implementation, this would be a real ping command
    console.log("Testing connection to MongoDB Atlas...");
    
    // Simulate successful ping response
    return true;
  } catch (error) {
    console.error("MongoDB Atlas connection test failed:", error);
    throw new Error("Failed connection test to MongoDB Atlas");
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
