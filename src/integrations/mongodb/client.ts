
// MongoDB client simplified for browser-side usage
import { ObjectId as MongoObjectId } from 'mongodb';

// Re-export ObjectId for use in the app
export const ObjectId = MongoObjectId;

// Connection status tracking
let connectionStatus = {
  status: 'disconnected', // 'disconnected', 'connecting', 'connected'
  error: null as Error | null
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

// Connect to MongoDB
export async function connectToDatabase(): Promise<{ db: any }> {
  try {
    console.log('Connecting to MongoDB...');
    connectionStatus = { status: 'connecting', error: null };
    
    // In a real app, we would connect to a real MongoDB instance
    // For this example, we're simulating the connection
    await new Promise(resolve => setTimeout(resolve, 500));
    
    mongoClient = {
      db: {
        collection: (collectionName: string) => ({
          find: async (query = {}) => {
            console.log(`Finding documents in ${collectionName} with query:`, query);
            // Simulate database query
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Mock data with toArray method
            const response = {
              data: [],
              count: 0,
              toArray: function() { return this.data; }
            };
            
            return response;
          },
          findOne: async (query = {}) => {
            console.log(`Finding one document in ${collectionName} with query:`, query);
            // Simulate database query
            await new Promise(resolve => setTimeout(resolve, 100));
            return { data: null };
          },
          insertOne: async (document) => {
            console.log(`Inserting document into ${collectionName}:`, document);
            // Simulate database insertion
            await new Promise(resolve => setTimeout(resolve, 150));
            return { data: { insertedId: new ObjectId() } };
          },
          updateOne: async (query, update) => {
            console.log(`Updating document in ${collectionName}:`, { query, update });
            // Simulate database update
            await new Promise(resolve => setTimeout(resolve, 150));
            return { data: { modifiedCount: 1 } };
          },
          deleteOne: async (query) => {
            console.log(`Deleting document from ${collectionName} with query:`, query);
            // Simulate database deletion
            await new Promise(resolve => setTimeout(resolve, 150));
            return { data: { deletedCount: 1 } };
          },
          createIndex: async (keys, options) => {
            console.log(`Creating index in ${collectionName}:`, { keys, options });
            return 'index-name';
          },
          toArray: async () => {
            return [];
          }
        }),
        listCollections: async () => {
          return {
            data: [],
            toArray: () => []
          };
        },
        createCollection: async (name, options) => {
          console.log(`Creating collection ${name}:`, options);
          return { data: { name } };
        }
      }
    };
    
    connectionStatus = { status: 'connected', error: null };
    console.log('Connected to MongoDB successfully');
    
    return { db: mongoClient.db };
  } catch (error) {
    const err = error as Error;
    console.error('Failed to connect to MongoDB:', err);
    connectionStatus = { status: 'disconnected', error: err };
    throw err;
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
