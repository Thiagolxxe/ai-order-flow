
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
    signUp: async () => ({ 
      data: null, 
      error: { message: 'Supabase authentication is not supported.' }
    }),
    signIn: async () => ({ 
      data: null, 
      error: { message: 'Supabase authentication is not supported.' } 
    })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        lte: () => ({
          gte: () => ({
            maybeSingle: async () => null
          })
        })
      }),
      toArray: async () => []
    }),
    insert: () => ({
      select: () => ({
        single: async () => null
      })
    })
  })
};
