
/**
 * This is a mock Supabase client for transitioning away from Supabase.
 * We're migrating to MongoDB but still have some references to Supabase.
 * This provides a compatible interface to avoid breaking changes.
 */

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
      eq: (column: string, value: any) => ({
        lte: (column: string, value: any) => ({
          gte: (column: string, value: any) => ({
            maybeSingle: async () => ({ data: { id: 'mock-id' }, error: null }),
            single: async () => ({ data: { id: 'mock-id' }, error: null }),
            order: (column: string, { ascending }: { ascending: boolean }) => ({
              limit: (limit: number) => ({
                maybeSingle: async () => ({ data: { id: 'mock-id' }, error: null }),
                single: async () => ({ data: { id: 'mock-id' }, error: null }),
                toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
              }),
              maybeSingle: async () => ({ data: { id: 'mock-id' }, error: null }),
              single: async () => ({ data: { id: 'mock-id' }, error: null }),
              toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
            }),
            limit: (limit: number) => ({
              maybeSingle: async () => ({ data: { id: 'mock-id' }, error: null }),
              single: async () => ({ data: { id: 'mock-id' }, error: null }),
              toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
            }),
            ilike: (column: string, value: any) => ({
              toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
            }),
            or: (orConditions: string) => ({
              toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
            }),
            in: (column: string, values: any[]) => ({
              toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
            }),
            toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
          })
        }),
        in: (column: string, values: any[]) => ({
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          limit: (limit: number) => ({
            toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
          }),
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        limit: (limit: number) => ({
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        ilike: (column: string, value: any) => ({
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        or: (orConditions: string) => ({
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        in: (column: string, values: any[]) => ({
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null }),
        maybeSingle: async () => ({ data: { id: 'mock-id' }, error: null }),
        single: async () => ({ data: { id: 'mock-id' }, error: null })
      }),
      in: (column: string, values: any[]) => ({
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        limit: (limit: number) => ({
          toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
        }),
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
      }),
      limit: (limit: number) => ({
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
      }),
      ilike: (column: string, value: any) => ({
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
      }),
      or: (orConditions: string) => ({
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null })
      }),
      eq: (column: string, value: any) => ({
        toArray: async () => ({ data: [{ id: 'mock-id' }], error: null }),
        single: async () => ({ data: { id: 'mock-id' }, error: null }),
        maybeSingle: async () => ({ data: { id: 'mock-id' }, error: null })
      }),
      toArray: async () => {
        return { data: [{ id: 'mock-id' }], error: null };
      }
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => ({ data: { id: 'mock-id' }, error: null })
      }),
      error: null
    }),
    upsert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => ({ data: { id: 'mock-id' }, error: null })
      }),
      error: null
    })
  })
};
