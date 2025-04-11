
import { SESSION_STORAGE_KEY } from '@/config/apiConfig';
import { User } from '@/types/user';
import { connectToDatabase } from '@/integrations/mongodb/client';

/**
 * Load the session from local storage
 */
export const loadSession = async () => {
  try {
    // Try to load session from localStorage
    const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
    
    if (!sessionStr) {
      return { user: null, session: null, role: null };
    }
    
    try {
      const sessionData = JSON.parse(sessionStr);
      const { session, expires_at } = sessionData;
      
      // Check if session expired
      if (expires_at && new Date(expires_at) < new Date()) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return { user: null, session: null, role: null };
      }
      
      let role = null;
      
      // Try to check user role from MongoDB Atlas
      try {
        const { db } = await connectToDatabase();
        const userRolesResult = await db.collection('user_roles').findOne({
          userId: session.user.id
        });
        
        if (userRolesResult) {
          role = userRolesResult.role;
        }
      } catch (error) {
        console.error('Error checking user role from MongoDB Atlas:', error);
        // Don't fail the whole application if we can't check roles
      }
      
      return { 
        user: session.user as User, 
        session: { access_token: session.access_token },
        role
      };
    } catch (e) {
      console.error('Error parsing session:', e);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return { user: null, session: null, role: null };
    }
  } catch (error) {
    console.error('Error loading session:', error);
    return { user: null, session: null, role: null };
  }
};
