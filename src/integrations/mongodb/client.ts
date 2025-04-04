
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
      collection: (collectionName: string) => {
        return {
          // Find one document
          findOne: async (query: any): Promise<any> => {
            console.log(`MongoDB findOne on ${collectionName}:`, query);
            // Return mock data based on collection
            return getMockDataByCollection(collectionName, query);
          },
          
          // Find multiple documents
          find: (query: any) => {
            console.log(`MongoDB find on ${collectionName}:`, query);
            return {
              toArray: async (): Promise<any[]> => {
                // Return array of mock data based on collection
                return [getMockDataByCollection(collectionName, query)];
              }
            };
          },
          
          // Insert one document
          insertOne: async (document: any): Promise<any> => {
            console.log(`MongoDB insertOne on ${collectionName}:`, document);
            return {
              acknowledged: true,
              insertedId: new ObjectId().toString()
            };
          },
          
          // Update one document
          updateOne: async (filter: any, update: any): Promise<any> => {
            console.log(`MongoDB updateOne on ${collectionName}:`, { filter, update });
            return {
              acknowledged: true,
              modifiedCount: 1
            };
          },
          
          // Delete one document
          deleteOne: async (filter: any): Promise<any> => {
            console.log(`MongoDB deleteOne on ${collectionName}:`, filter);
            return {
              acknowledged: true,
              deletedCount: 1
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
        name: 'Example Restaurant',
        cuisine: 'Italian',
        address: '123 Main St',
        city: 'Example City',
        deliveryFee: 5.0,
        minimumOrder: 20.0,
        estimatedDeliveryTime: 30
      };
    case 'orders':
      return {
        _id: new ObjectId().toString(),
        orderNumber: 'ORD-' + Math.floor(Math.random() * 1000000),
        status: 'pending',
        items: [
          { 
            name: 'Pizza', 
            price: 15.0, 
            quantity: 1 
          }
        ],
        subtotal: 15.0,
        deliveryFee: 5.0,
        total: 20.0,
        createdAt: new Date()
      };
    case 'menu_items':
      return {
        _id: new ObjectId().toString(),
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with tomato and mozzarella',
        price: 15.0,
        available: true,
        restaurantId: new ObjectId().toString()
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
