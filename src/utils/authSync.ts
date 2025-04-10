
import { supabase } from '@/integrations/supabase/client';
import { connectToDatabase } from '@/integrations/mongodb/client';

/**
 * Utility to synchronize user data between Supabase and MongoDB
 */
export const authSync = {
  /**
   * Creates a user in Supabase if they exist in MongoDB but not in Supabase
   */
  async createSupabaseUserFromMongoDB(email: string, password: string) {
    try {
      // Check if user exists in MongoDB
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({ email });
      
      if (!user) {
        return { success: false, error: 'User not found in MongoDB' };
      }
      
      // Try to create the user in Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: user.user_metadata?.nome || '',
            sobrenome: user.user_metadata?.sobrenome || '',
          }
        }
      });
      
      if (error) {
        console.error('Error creating Supabase user:', error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in createSupabaseUserFromMongoDB:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Checks if a user exists in MongoDB and updates Supabase user if needed
   */
  async ensureUserSynchronized(userId: string) {
    try {
      const { db } = await connectToDatabase();
      
      // Check MongoDB for user
      const mongoUser = await db.collection('users').findOne({ _id: userId });
      
      if (!mongoUser) {
        console.warn('User exists in Supabase but not in MongoDB');
        return { synchronized: false };
      }
      
      return { synchronized: true, user: mongoUser };
    } catch (error) {
      console.error('Error checking user synchronization:', error);
      return { synchronized: false, error };
    }
  }
};
