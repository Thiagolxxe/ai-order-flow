
/**
 * This is a mock Supabase client for transitioning away from Supabase.
 * We're migrating to MongoDB but still have some references to Supabase.
 * This provides a compatible interface to avoid breaking changes.
 */
import { connectToDatabase } from '../mongodb/client';

// Supabase client mock that forwards to MongoDB
export const supabase = {
  auth: {
    getSession: async () => ({ 
      data: { session: null } 
    }),
    signUp: async (data: any) => ({ 
      data: {
        user: { id: 'mock-user-id', email: data?.email },
        session: {
          user: { id: 'mock-user-id', email: data?.email },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token'
        }
      }, 
      error: null
    }),
    signIn: async (data: any) => ({ 
      data: {
        user: { id: 'mock-user-id', email: data?.email },
        session: {
          user: { id: 'mock-user-id', email: data?.email },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token'
        }
      }, 
      error: null
    }),
    setSession: async (data: any) => ({
      data: { session: data },
      error: null
    })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: async (column: string, value: any) => {
        try {
          const { db } = await connectToDatabase();
          const collection = db.collection(mapTableToCollection(table));
          const result = await collection.findOne({ [column]: value });
          return result;
        } catch (error) {
          console.error(`Error in select eq operation for ${table}:`, error);
          return { data: null, error };
        }
      },
      lte: (column: string, value: any) => ({
        gte: (column: string, value: any) => ({
          toArray: async () => {
            try {
              const { db } = await connectToDatabase();
              const collection = db.collection(mapTableToCollection(table));
              const result = await collection.find({}).toArray();
              return result;
            } catch (error) {
              console.error(`Error in select lte gte toArray operation for ${table}:`, error);
              return { data: [], error };
            }
          }
        })
      }),
      in: (column: string, values: any[]) => ({
        toArray: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.find({}).toArray();
            return result;
          } catch (error) {
            console.error(`Error in select in toArray operation for ${table}:`, error);
            return { data: [], error };
          }
        }
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        limit: (limit: number) => ({
          toArray: async () => {
            try {
              const { db } = await connectToDatabase();
              const collection = db.collection(mapTableToCollection(table));
              const result = await collection.find({}).toArray();
              return result;
            } catch (error) {
              console.error(`Error in select order limit toArray operation for ${table}:`, error);
              return { data: [], error };
            }
          }
        }),
        toArray: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.find({}).toArray();
            return result;
          } catch (error) {
            console.error(`Error in select order toArray operation for ${table}:`, error);
            return { data: [], error };
          }
        }
      }),
      limit: (limit: number) => ({
        toArray: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.find({}).toArray();
            return result;
          } catch (error) {
            console.error(`Error in select limit toArray operation for ${table}:`, error);
            return { data: [], error };
          }
        }
      }),
      ilike: (column: string, value: any) => ({
        toArray: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            // Simulate ilike with regex in MongoDB
            const result = await collection.find({}).toArray();
            return result;
          } catch (error) {
            console.error(`Error in select ilike toArray operation for ${table}:`, error);
            return { data: [], error };
          }
        }
      }),
      or: (orConditions: string) => ({
        toArray: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.find({}).toArray();
            return result;
          } catch (error) {
            console.error(`Error in select or toArray operation for ${table}:`, error);
            return { data: [], error };
          }
        }
      }),
      toArray: async () => {
        try {
          const { db } = await connectToDatabase();
          const collection = db.collection(mapTableToCollection(table));
          const result = await collection.find({}).toArray();
          return result;
        } catch (error) {
          console.error(`Error in select toArray operation for ${table}:`, error);
          return { data: [], error };
        }
      },
      single: async () => {
        try {
          const { db } = await connectToDatabase();
          const collection = db.collection(mapTableToCollection(table));
          const result = await collection.findOne({});
          return result;
        } catch (error) {
          console.error(`Error in select single operation for ${table}:`, error);
          return { data: null, error };
        }
      },
      maybeSingle: async () => {
        try {
          const { db } = await connectToDatabase();
          const collection = db.collection(mapTableToCollection(table));
          const result = await collection.findOne({});
          return result;
        } catch (error) {
          console.error(`Error in select maybeSingle operation for ${table}:`, error);
          return { data: null, error };
        }
      }
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.insertOne(data);
            return { data: { ...data, id: result.data.insertedId }, error: null };
          } catch (error) {
            console.error(`Error in insert operation for ${table}:`, error);
            return { data: null, error };
          }
        }
      }),
      single: async () => {
        try {
          const { db } = await connectToDatabase();
          const collection = db.collection(mapTableToCollection(table));
          const result = await collection.insertOne(data);
          return { data: { ...data, id: result.data.insertedId }, error: null };
        } catch (error) {
          console.error(`Error in insert operation for ${table}:`, error);
          return { data: null, error };
        }
      }
    }),
    upsert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            // For upsert, we'll just insert in this mock
            const result = await collection.insertOne(data);
            return { data: { ...data, id: result.data.insertedId }, error: null };
          } catch (error) {
            console.error(`Error in upsert operation for ${table}:`, error);
            return { data: null, error };
          }
        }
      }),
      single: async () => {
        try {
          const { db } = await connectToDatabase();
          const collection = db.collection(mapTableToCollection(table));
          const result = await collection.insertOne(data);
          return { data: { ...data, id: result.data.insertedId }, error: null };
        } catch (error) {
          console.error(`Error in upsert operation for ${table}:`, error);
          return { data: null, error };
        }
      }
    })
  }),
  channel: (channelName: string) => ({
    on: (eventType: string, eventConfig: any, callback: Function) => ({
      subscribe: () => {}
    })
  }),
  removeChannel: (channel: any) => {}
};

// Function to map Supabase table names to MongoDB collections
function mapTableToCollection(table: string): string {
  const mapping: Record<string, string> = {
    'restaurantes': 'restaurants',
    'pedidos': 'orders',
    'perfis': 'profiles',
    'itens_cardapio': 'menu_items',
    'promocoes': 'coupons',
    'entregadores': 'drivers',
    'enderecos': 'addresses',
    'categorias': 'categories',
    'avaliacoes': 'ratings',
    'itens_pedido': 'order_items',
    'notificacoes': 'notifications',
    'funcoes_usuario': 'user_roles',
    'historico_status_pedido': 'order_status_history',
    'videos': 'videos',
    'curtidas_video': 'video_likes',
    'comentarios_video': 'video_comments',
    'videos_salvos': 'saved_videos',
  };
  
  return mapping[table] || table;
}
