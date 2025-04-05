
// This file now serves as a facade for MongoDB operations
// It maintains the Supabase-like interface for backward compatibility
// while using MongoDB under the hood

import { connectToDatabase } from '../mongodb/client';
import { toast } from 'sonner';

class SupabaseAuthMock {
  async signUp(credentials: any) {
    try {
      const { db } = await connectToDatabase();
      const { email, password, ...userData } = credentials;
      
      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return { 
          error: { message: 'Email já está em uso' },
          data: null
        };
      }
      
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In a real app, this would be hashed
        created_at: new Date().toISOString(),
        ...userData
      };
      
      await db.collection('users').insertOne(newUser);
      
      return {
        data: { user: newUser },
        error: null
      };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return {
        data: null,
        error: { message: error.message || 'Erro ao criar conta' }
      };
    }
  }
  
  async signIn(credentials: any) {
    try {
      const { db } = await connectToDatabase();
      const { email, password } = credentials;
      
      // Find user with matching email and password
      const user = await db.collection('users').findOne({ email, password });
      if (!user) {
        return { 
          error: { message: 'Email ou senha inválidos' },
          data: null
        };
      }
      
      // In a real app, you'd create a session
      return {
        data: { 
          user,
          session: { 
            access_token: 'mock-token', 
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
          }
        },
        error: null
      };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return {
        data: null,
        error: { message: error.message || 'Erro ao fazer login' }
      };
    }
  }
  
  async signOut() {
    // In a real app, you'd invalidate the session
    return { error: null };
  }
  
  getSession() {
    // Mock session retrieval
    const userData = localStorage.getItem('userData');
    if (!userData) {
      return { data: { session: null }, error: null };
    }
    
    try {
      const user = JSON.parse(userData);
      return {
        data: {
          session: {
            user,
            access_token: 'mock-token',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        },
        error: null
      };
    } catch (error) {
      return { data: { session: null }, error: null };
    }
  }
  
  onAuthStateChange(callback: Function) {
    // Simplified auth state monitoring
    const unsubscribe = () => {};
    return { data: { subscription: { unsubscribe } }, error: null };
  }
}

class SupabaseFunctionsMock {
  async invoke(functionName: string, { body }: { body: any }) {
    try {
      const { db } = await connectToDatabase();
      
      console.log(`Invoking function: ${functionName}`, body);
      
      // Mock different function behaviors
      switch (functionName) {
        case 'process-order': {
          const { orderData } = body;
          
          // Generate order number
          const orderNumber = `ORD-${Math.floor(Math.random() * 1000000)}`;
          
          // Store order in database
          const order = {
            id: crypto.randomUUID(),
            numero_pedido: orderNumber,
            ...orderData,
            status: 'pendente',
            data_criacao: new Date().toISOString()
          };
          
          await db.collection('orders').insertOne(order);
          
          return { data: { success: true, orderNumber }, error: null };
        }
        
        default:
          return { data: null, error: { message: `Function ${functionName} not implemented` } };
      }
    } catch (error: any) {
      console.error(`Error invoking function ${functionName}:`, error);
      return { data: null, error: { message: error.message || 'Erro ao processar requisição' } };
    }
  }
}

class SupabaseStorageMock {
  async getPublicUrl(bucket: string, path: string) {
    // Return a mock URL
    return { data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` } };
  }
  
  from(bucket: string) {
    return {
      upload: async (path: string, file: any) => {
        try {
          console.log(`Uploading to ${bucket}/${path}`);
          // In real implementation, this would upload to MongoDB GridFS
          return { data: { path }, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` } };
      }
    };
  }
}

class SupabaseClientMock {
  auth: SupabaseAuthMock;
  functions: SupabaseFunctionsMock;
  storage: SupabaseStorageMock;
  
  constructor() {
    this.auth = new SupabaseAuthMock();
    this.functions = new SupabaseFunctionsMock();
    this.storage = new SupabaseStorageMock();
  }
  
  // MongoDB-based data operations that mimic Supabase interface
  from(table: string) {
    return {
      select: async (columns = '*') => {
        try {
          const { db } = await connectToDatabase();
          const data = await db.collection(table).find({}).toArray();
          return { data, error: null };
        } catch (error: any) {
          console.error(`Error selecting from ${table}:`, error);
          return { data: null, error };
        }
      },
      
      insert: async (values: any, options = {}) => {
        try {
          const { db } = await connectToDatabase();
          
          // Handle single or multiple inserts
          const items = Array.isArray(values) ? values : [values];
          const itemsWithIds = items.map(item => ({
            id: item.id || crypto.randomUUID(),
            ...item
          }));
          
          const result = await db.collection(table).insertMany(itemsWithIds);
          return { 
            data: itemsWithIds,
            error: null,
            count: result.insertedCount
          };
        } catch (error: any) {
          console.error(`Error inserting into ${table}:`, error);
          return { data: null, error };
        }
      },
      
      update: async (values: any, options = {}) => {
        try {
          const { db } = await connectToDatabase();
          const { match } = options;
          
          if (!match) {
            throw new Error('Update requires a match condition');
          }
          
          const result = await db.collection(table).updateMany(
            match,
            { $set: values }
          );
          
          return {
            data: { updated: result.modifiedCount },
            error: null
          };
        } catch (error: any) {
          console.error(`Error updating ${table}:`, error);
          return { data: null, error };
        }
      },
      
      delete: async (options = {}) => {
        try {
          const { db } = await connectToDatabase();
          const { match } = options;
          
          if (!match) {
            throw new Error('Delete requires a match condition');
          }
          
          const result = await db.collection(table).deleteMany(match);
          
          return {
            data: { deleted: result.deletedCount },
            error: null
          };
        } catch (error: any) {
          console.error(`Error deleting from ${table}:`, error);
          return { data: null, error };
        }
      },
      
      eq: (column: string, value: any) => {
        const match = { [column]: value };
        return {
          single: async () => {
            try {
              const { db } = await connectToDatabase();
              const data = await db.collection(table).findOne(match);
              return { data, error: null };
            } catch (error: any) {
              console.error(`Error querying ${table}:`, error);
              return { data: null, error };
            }
          },
          
          select: async (columns = '*') => {
            try {
              const { db } = await connectToDatabase();
              const data = await db.collection(table).find(match).toArray();
              return { data, error: null };
            } catch (error: any) {
              console.error(`Error querying ${table}:`, error);
              return { data: null, error };
            }
          },
          
          update: async (values: any) => {
            try {
              const { db } = await connectToDatabase();
              const result = await db.collection(table).updateMany(
                match,
                { $set: values }
              );
              
              return {
                data: { updated: result.modifiedCount },
                error: null
              };
            } catch (error: any) {
              console.error(`Error updating ${table}:`, error);
              return { data: null, error };
            }
          },
          
          delete: async () => {
            try {
              const { db } = await connectToDatabase();
              const result = await db.collection(table).deleteMany(match);
              
              return {
                data: { deleted: result.deletedCount },
                error: null
              };
            } catch (error: any) {
              console.error(`Error deleting from ${table}:`, error);
              return { data: null, error };
            }
          }
        };
      }
    };
  }
}

// Create a singleton instance
const supabaseClient = new SupabaseClientMock();

export { supabaseClient };
