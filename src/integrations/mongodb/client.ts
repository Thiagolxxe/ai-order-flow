
/**
 * Utilitários do MongoDB para o frontend
 * Camada de abstração para API do MongoDB na aplicação cliente
 */
import { httpClient } from '@/utils/httpClient';

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
  
  equals(other: ObjectId) {
    return this.id === other.toString();
  }
  
  static isValid(id: string): boolean {
    // Simple validation - in real implementation would be more thorough
    return typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
  }
}

// Connect to database through the API
export async function connectToDatabase() {
  try {
    // Check connection to backend
    const response = await httpClient.get('check-connection');
    
    if (response.error || !response.data?.success) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    // Return a simplified client object for browser usage
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
              return response.data;
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
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Export ServerApiVersion for compatibility
export const ServerApiVersion = {
  v1: '1'
};
