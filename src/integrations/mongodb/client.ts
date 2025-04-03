
// MongoDB utilities for the browser
// This is a thin wrapper around the API calls to the MongoDB backend

// Helper function to handle fetch requests
async function fetchApi(endpoint: string, options?: RequestInit) {
  const baseUrl = 'http://localhost:5000/api';
  
  try {
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {})
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Get authentication header if user is logged in
function getAuthHeader() {
  const sessionStr = localStorage.getItem('deliveryapp_session');
  if (!sessionStr) return {};
  
  try {
    const { session } = JSON.parse(sessionStr);
    if (!session?.access_token) return {};
    
    return { 'Authorization': `Bearer ${session.access_token}` };
  } catch (e) {
    console.error('Error parsing session:', e);
    return {};
  }
}

// MongoDB ObjectId helper
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

// Connect to database
export async function connectToDatabase() {
  try {
    // Check connection to backend
    const data = await fetchApi('check-connection');
    
    if (!data.success) {
      throw new Error('Failed to connect to MongoDB');
    }
    
    // Return a simplified client object for browser usage
    return {
      db: (dbName: string) => ({
        collection: (collectionName: string) => ({
          findOne: async (query: any) => {
            return fetchApi(`${collectionName}/find-one`, {
              method: 'POST',
              body: JSON.stringify({ query })
            });
          },
          find: (query: any) => ({
            toArray: async () => {
              return fetchApi(`${collectionName}/find`, {
                method: 'POST',
                body: JSON.stringify({ query })
              });
            }
          }),
          insertOne: async (document: any) => {
            return fetchApi(`${collectionName}`, {
              method: 'POST',
              body: JSON.stringify(document)
            });
          },
          updateOne: async (filter: any, update: any) => {
            return fetchApi(`${collectionName}/update`, {
              method: 'PATCH',
              body: JSON.stringify({ filter, update })
            });
          },
          deleteOne: async (filter: any) => {
            return fetchApi(`${collectionName}`, {
              method: 'DELETE',
              body: JSON.stringify({ filter })
            });
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
