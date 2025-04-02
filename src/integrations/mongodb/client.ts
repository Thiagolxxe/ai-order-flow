
// This file provides a browser-safe MongoDB client interface
// For browser environments, we'll use REST API endpoints instead of direct MongoDB driver

// MongoDB Atlas connection string - Replace this with your own
const ATLAS_APP_ID = "<your-atlas-app-id>"; // Replace with your MongoDB Atlas App ID

// Browser-compatible MongoDB client
class BrowserMongoClient {
  private baseUrl: string;
  private dbName: string;
  
  constructor(appId: string, dbName: string = "delivery_app") {
    this.baseUrl = `https://data.mongodb-api.com/app/${appId}/endpoint/data/v1`;
    this.dbName = dbName;
  }
  
  async connect() {
    console.log("Browser MongoDB client initialized");
    return {
      db: (dbName: string = this.dbName) => this.getDatabase(dbName)
    };
  }
  
  getDatabase(dbName: string) {
    return {
      collection: (collectionName: string) => this.getCollection(dbName, collectionName)
    };
  }
  
  getCollection(dbName: string, collectionName: string) {
    return {
      findOne: async (query: any) => this.findOne(dbName, collectionName, query),
      find: (query: any) => this.find(dbName, collectionName, query),
      insertOne: async (document: any) => this.insertOne(dbName, collectionName, document),
      updateOne: async (filter: any, update: any) => this.updateOne(dbName, collectionName, filter, update),
      deleteOne: async (filter: any) => this.deleteOne(dbName, collectionName, filter)
    };
  }
  
  // Collection operations - in a real app, these would make API calls to your backend
  // For now, we'll use localStorage as a simple data store for demonstration
  private getStorageKey(dbName: string, collectionName: string) {
    return `mongodb_${dbName}_${collectionName}`;
  }
  
  private getCollectionData(dbName: string, collectionName: string): any[] {
    const key = this.getStorageKey(dbName, collectionName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  
  private saveCollectionData(dbName: string, collectionName: string, data: any[]) {
    const key = this.getStorageKey(dbName, collectionName);
    localStorage.setItem(key, JSON.stringify(data));
  }
  
  async findOne(dbName: string, collectionName: string, query: any) {
    console.log(`Finding document in ${collectionName} with query:`, query);
    const collection = this.getCollectionData(dbName, collectionName);
    
    // Simple query matcher
    return collection.find(item => {
      for (const key in query) {
        // Handle ObjectId comparisons
        if (key === "_id") {
          if (query[key].toString() !== item[key].toString()) {
            return false;
          }
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  }
  
  find(dbName: string, collectionName: string, query: any) {
    console.log(`Finding documents in ${collectionName} with query:`, query);
    const collection = this.getCollectionData(dbName, collectionName);
    
    // Filter collection based on query
    const results = collection.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
    
    // Return object with toArray method to mimic MongoDB cursor
    return {
      toArray: async () => results
    };
  }
  
  async insertOne(dbName: string, collectionName: string, document: any) {
    console.log(`Inserting document into ${collectionName}:`, document);
    
    // Generate an ID if not provided
    if (!document._id) {
      document._id = this.generateObjectId();
    }
    
    const collection = this.getCollectionData(dbName, collectionName);
    collection.push(document);
    this.saveCollectionData(dbName, collectionName, collection);
    
    return {
      insertedId: document._id,
      acknowledged: true
    };
  }
  
  async updateOne(dbName: string, collectionName: string, filter: any, update: any) {
    console.log(`Updating document in ${collectionName} with filter:`, filter);
    const collection = this.getCollectionData(dbName, collectionName);
    let modifiedCount = 0;
    
    const updatedCollection = collection.map(item => {
      let matches = true;
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        modifiedCount++;
        if (update.$set) {
          return { ...item, ...update.$set };
        }
        return { ...item, ...update };
      }
      
      return item;
    });
    
    this.saveCollectionData(dbName, collectionName, updatedCollection);
    
    return {
      matchedCount: modifiedCount,
      modifiedCount,
      acknowledged: true
    };
  }
  
  async deleteOne(dbName: string, collectionName: string, filter: any) {
    console.log(`Deleting document from ${collectionName} with filter:`, filter);
    const collection = this.getCollectionData(dbName, collectionName);
    let deletedCount = 0;
    
    const index = collection.findIndex(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    });
    
    if (index !== -1) {
      collection.splice(index, 1);
      deletedCount = 1;
    }
    
    this.saveCollectionData(dbName, collectionName, collection);
    
    return {
      deletedCount,
      acknowledged: true
    };
  }
  
  // Helper functions
  generateObjectId() {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    
    return timestamp + machineId + processId + counter;
  }
}

// For browser compatibility, we'll implement a simplified version of ObjectId
export class ObjectId {
  private id: string;
  
  constructor(id?: string) {
    if (id) {
      this.id = id;
    } else {
      // Generate a new ID
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
      const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
      const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
      
      this.id = timestamp + machineId + processId + counter;
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

// Create a client instance
const client = new BrowserMongoClient(ATLAS_APP_ID);

// Cached connection
let cached = {
  conn: null,
  promise: null
};

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db("delivery_app"),
      };
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
