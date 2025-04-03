
/**
 * Utilitários do MongoDB para o frontend
 * Camada de abstração para API do MongoDB na aplicação cliente
 */
import { httpClient } from '@/utils/httpClient';
import { apiConfig } from '@/config/apiConfig';

// MongoDB ObjectId helper para uso no cliente
export class ObjectId {
  private id: string;
  
  constructor(id?: string) {
    if (id) {
      this.id = id;
    } else {
      // Generate a new ID (simple implementation for browser)
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const randomPart = Array.from({ length: 16 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      this.id = timestamp + randomPart;
    }
  }
  
  toString() {
    return this.id;
  }
  
  equals(other: ObjectId | string) {
    const otherId = typeof other === 'string' ? other : other.toString();
    return this.id === otherId;
  }
  
  static isValid(id: string): boolean {
    // MongoDB ObjectId validation - either 12 bytes (24 hex chars) or string that can be converted to ObjectId
    return typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
  }
}

// Interface do database client para operações MongoDB
export interface MongoDBClient {
  db: (dbName: string) => {
    collection: (collectionName: string) => {
      findOne: (query: any) => Promise<any>;
      find: (query: any) => {
        toArray: () => Promise<any[]>;
      };
      insertOne: (document: any) => Promise<any>;
      updateOne: (filter: any, update: any) => Promise<any>;
      deleteOne: (filter: any) => Promise<any>;
    }
  }
}

// Verifica a conexão com o MongoDB através da API
export async function checkMongoDBConnection(): Promise<boolean> {
  try {
    const response = await httpClient.get(apiConfig.endpoints.connection);
    return response.error === null && response.data?.success === true;
  } catch (error) {
    console.error('Error checking MongoDB connection:', error);
    return false;
  }
}

// Connect to database through the API
export async function connectToDatabase(): Promise<MongoDBClient> {
  const isConnected = await checkMongoDBConnection();
  
  if (!isConnected) {
    throw new Error('Failed to connect to MongoDB');
  }
  
  // Return a client interface for browser usage
  return {
    db: (dbName: string) => ({
      collection: (collectionName: string) => ({
        findOne: async (query: any) => {
          const response = await httpClient.post(`${collectionName}/find-one`, { query });
          return response.data;
        },
        find: (query: any) => ({
          toArray: async () => {
            const response = await httpClient.post(`${collectionName}/find`, { query });
            return response.data || [];
          }
        }),
        insertOne: async (document: any) => {
          const response = await httpClient.post(`${collectionName}`, document);
          return response.data;
        },
        updateOne: async (filter: any, update: any) => {
          const response = await httpClient.patch(`${collectionName}/update`, { filter, update });
          return response.data;
        },
        deleteOne: async (filter: any) => {
          const response = await httpClient.delete(`${collectionName}`, { 
            body: JSON.stringify({ filter }) 
          });
          return response.data;
        }
      })
    })
  };
}

// Export ServerApiVersion for compatibility with backend
export const ServerApiVersion = {
  v1: '1'
};
