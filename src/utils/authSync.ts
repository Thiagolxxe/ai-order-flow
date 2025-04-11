
import { connectToDatabase } from '@/integrations/mongodb/client';

/**
 * Utility to synchronize user data between systems
 */
export const authSync = {
  /**
   * Creates a user in the system if they don't exist
   */
  async createUserIfNotExists(email: string, password: string, userData?: any) {
    try {
      // Check if user exists in MongoDB
      const { db } = await connectToDatabase();
      const user = await db.collection('users').findOne({ email });
      
      if (user) {
        return { success: true, user };
      }
      
      // User doesn't exist, create them
      const hashedPassword = password; // In a real app, this would be hashed
      
      const newUser = {
        email,
        password: hashedPassword,
        user_metadata: userData || {},
        created_at: new Date()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      
      return { 
        success: true, 
        user: { 
          id: result.insertedId.toString(),
          email,
          ...newUser
        } 
      };
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
      return { success: false, error };
    }
  },
  
  /**
   * Verifies user credentials
   */
  async verifyCredentials(email: string, password: string) {
    try {
      const { db } = await connectToDatabase();
      
      // Find user
      const user = await db.collection('users').findOne({ email });
      
      if (!user) {
        return { 
          verified: false, 
          error: 'User not found' 
        };
      }
      
      // In a real app, we would compare hashed passwords
      // This is just a simplified example
      const passwordMatches = user.password === password;
      
      if (!passwordMatches) {
        return { 
          verified: false, 
          error: 'Invalid password' 
        };
      }
      
      return { 
        verified: true, 
        user 
      };
    } catch (error) {
      console.error('Error checking credentials:', error);
      return { 
        verified: false, 
        error 
      };
    }
  }
};
