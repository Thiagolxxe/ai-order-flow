
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
            maybeSingle: async () => ({ id: 'mock-id' }),
            single: async () => ({ id: 'mock-id' }),
            order: (column: string, { ascending }: { ascending: boolean }) => ({
              limit: (limit: number) => ({
                maybeSingle: async () => ({ id: 'mock-id' }),
                single: async () => ({ id: 'mock-id' }),
                toArray: async () => [{ id: 'mock-id' }]
              }),
              maybeSingle: async () => ({ id: 'mock-id' }),
              single: async () => ({ id: 'mock-id' }),
              toArray: async () => [{ id: 'mock-id' }]
            }),
            limit: (limit: number) => ({
              maybeSingle: async () => ({ id: 'mock-id' }),
              single: async () => ({ id: 'mock-id' }),
              toArray: async () => [{ id: 'mock-id' }]
            }),
            ilike: (column: string, value: any) => ({
              toArray: async () => [{ id: 'mock-id' }]
            }),
            or: (orConditions: string) => ({
              toArray: async () => [{ id: 'mock-id' }]
            }),
            in: (column: string, values: any[]) => ({
              toArray: async () => [{ id: 'mock-id' }]
            }),
            toArray: async () => [{ id: 'mock-id' }]
          })
        }),
        in: (column: string, values: any[]) => ({
          toArray: async () => [{ id: 'mock-id' }]
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          limit: (limit: number) => ({
            toArray: async () => [{ id: 'mock-id' }]
          }),
          toArray: async () => [{ id: 'mock-id' }]
        }),
        limit: (limit: number) => ({
          toArray: async () => [{ id: 'mock-id' }]
        }),
        ilike: (column: string, value: any) => ({
          toArray: async () => [{ id: 'mock-id' }]
        }),
        or: (orConditions: string) => ({
          toArray: async () => [{ id: 'mock-id' }]
        }),
        in: (column: string, values: any[]) => ({
          toArray: async () => [{ id: 'mock-id' }]
        }),
        toArray: async () => [{ id: 'mock-id' }],
        maybeSingle: async () => ({ id: 'mock-id' }),
        single: async () => ({ id: 'mock-id' })
      }),
      in: (column: string, values: any[]) => ({
        toArray: async () => [{ id: 'mock-id' }]
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        limit: (limit: number) => ({
          toArray: async () => [{ id: 'mock-id' }]
        }),
        toArray: async () => [{ id: 'mock-id' }]
      }),
      limit: (limit: number) => ({
        toArray: async () => [{ id: 'mock-id' }]
      }),
      ilike: (column: string, value: any) => ({
        toArray: async () => [{ id: 'mock-id' }]
      }),
      or: (orConditions: string) => ({
        toArray: async () => [{ id: 'mock-id' }]
      }),
      toArray: async () => {
        return { data: [{ id: 'mock-id' }], error: null };
      }
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => ({ data: { id: 'mock-id' }, error: null })
      })
    }),
    upsert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => ({ data: { id: 'mock-id' }, error: null })
      }),
      error: null
    })
  })
};
