
/**
 * This is a mock Supabase client for transitioning away from Supabase.
 * We're migrating to MongoDB but still have some references to Supabase.
 * This provides a compatible interface to avoid breaking changes.
 */
import { connectToDatabase, MongoResponse } from '../mongodb/client';

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
    select: (columns?: string) => {
      const selectQuery = {
        eq: async (column: string, value: any) => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.findOne({ [column]: value });
            return { data: result.data, error: result.error };
          } catch (error) {
            console.error(`Error in select eq operation for ${table}:`, error);
            return { data: null, error };
          }
        },
        in: async (column: string, values: any[]) => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            // Since we're mocking, we can just simulate the response structure here
            return {
              toArray: async () => {
                const result = await collection.find({ [column]: { $in: values } }).toArray();
                return { data: result.data, error: result.error };
              }
            };
          } catch (error) {
            console.error(`Error in select in operation for ${table}:`, error);
            return {
              toArray: async () => ({ data: [], error })
            };
          }
        },
        ilike: async (column: string, value: string) => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            // Simulate case-insensitive search in MongoDB
            return {
              toArray: async () => {
                const result = await collection.find({ [column]: new RegExp(value.replace(/%/g, ''), 'i') }).toArray();
                return { data: result.data, error: result.error };
              }
            };
          } catch (error) {
            console.error(`Error in select ilike operation for ${table}:`, error);
            return {
              toArray: async () => ({ data: [], error })
            };
          }
        },
        or: async (conditions: string) => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            // Parse the or conditions string (in a real implementation, this would be more sophisticated)
            return {
              toArray: async () => {
                const result = await collection.find({}).toArray();
                return { data: result.data, error: result.error };
              }
            };
          } catch (error) {
            console.error(`Error in select or operation for ${table}:`, error);
            return {
              toArray: async () => ({ data: [], error })
            };
          }
        },
        order: (column: string, { ascending }: { ascending: boolean }) => {
          return {
            limit: (limit: number) => {
              return {
                toArray: async () => {
                  try {
                    const { db } = await connectToDatabase();
                    const collection = db.collection(mapTableToCollection(table));
                    const result = await collection.find({}).toArray();
                    return { data: result.data, error: result.error };
                  } catch (error) {
                    console.error(`Error in select order limit toArray operation for ${table}:`, error);
                    return { data: [], error };
                  }
                }
              };
            },
            toArray: async () => {
              try {
                const { db } = await connectToDatabase();
                const collection = db.collection(mapTableToCollection(table));
                const result = await collection.find({}).toArray();
                return { data: result.data, error: result.error };
              } catch (error) {
                console.error(`Error in select order toArray operation for ${table}:`, error);
                return { data: [], error };
              }
            }
          };
        },
        limit: (limit: number) => {
          return {
            toArray: async () => {
              try {
                const { db } = await connectToDatabase();
                const collection = db.collection(mapTableToCollection(table));
                const result = await collection.find({}).toArray();
                return { data: result.data, error: result.error };
              } catch (error) {
                console.error(`Error in select limit toArray operation for ${table}:`, error);
                return { data: [], error };
              }
            }
          };
        },
        toArray: async () => {
          try {
            const { db } = await connectToDatabase();
            const collection = db.collection(mapTableToCollection(table));
            const result = await collection.find({}).toArray();
            return { data: result.data, error: result.error };
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
            return { data: result.data, error: result.error };
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
            return { data: result.data, error: result.error };
          } catch (error) {
            console.error(`Error in select maybeSingle operation for ${table}:`, error);
            return { data: null, error };
          }
        }
      };
      
      return selectQuery;
    },
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
