
import { connectToDatabase } from "@/integrations/mongodb/client";
import { ObjectId } from "mongodb";
import bcrypt from "crypto-browserify";

export interface UserAuth {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    sobrenome?: string;
  };
}

export interface Session {
  user: UserAuth;
  access_token: string;
}

// Generate a random token
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Store active sessions (this is just for demo purposes, in production you would use proper JWT)
const activeSessions: Record<string, Session> = {};

// Hash password
const hashPassword = (password: string): string => {
  return bcrypt.createHash('sha256').update(password).digest('hex');
};

// Compare password with hash
const comparePassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const authService = {
  // Sign up new user
  signUp: async (email: string, password: string, userData?: any) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection("users");
      
      // Check if user already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return { error: { message: "User already exists" }, data: null };
      }
      
      // Create new user
      const hashedPassword = hashPassword(password);
      const user = {
        email,
        password: hashedPassword,
        user_metadata: userData || {},
        created_at: new Date(),
      };
      
      const result = await collection.insertOne(user);
      const userId = result.insertedId.toString();
      
      // Create user profile
      await db.collection("profiles").insertOne({
        userId,
        name: userData?.nome || "",
        lastName: userData?.sobrenome || "",
        created_at: new Date(),
      });
      
      // Assign default role
      await db.collection("user_roles").insertOne({
        userId,
        role: "cliente",
        created_at: new Date(),
      });
      
      // Create a session
      const session = {
        user: {
          id: userId,
          email,
          user_metadata: userData
        },
        access_token: generateToken()
      };
      
      // Store session
      activeSessions[session.access_token] = session;
      
      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("delivery_session", JSON.stringify(session));
      }
      
      return { data: { user: session.user, session }, error: null };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  // Sign in user
  signInWithPassword: async (email: string, password: string) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection("users");
      
      // Find user
      const user = await collection.findOne({ email });
      if (!user) {
        return { error: { message: "User not found" }, data: null };
      }
      
      // Check password
      if (!comparePassword(password, user.password)) {
        return { error: { message: "Invalid password" }, data: null };
      }
      
      // Create session
      const session = {
        user: {
          id: user._id.toString(),
          email: user.email,
          user_metadata: user.user_metadata
        },
        access_token: generateToken()
      };
      
      // Store session
      activeSessions[session.access_token] = session;
      
      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("delivery_session", JSON.stringify(session));
      }
      
      return { data: { user: session.user, session }, error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { data: null, error: { message: error.message } };
    }
  },
  
  // Sign out user
  signOut: async () => {
    try {
      if (typeof window !== "undefined") {
        const sessionData = localStorage.getItem("delivery_session");
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Remove from active sessions
          delete activeSessions[session.access_token];
          // Remove from localStorage
          localStorage.removeItem("delivery_session");
        }
      }
      return { error: null };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return { error: { message: error.message } };
    }
  },
  
  // Get current session
  getSession: async () => {
    try {
      if (typeof window !== "undefined") {
        const sessionData = localStorage.getItem("delivery_session");
        if (sessionData) {
          const session = JSON.parse(sessionData);
          return { data: { session }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    } catch (error: any) {
      console.error("Get session error:", error);
      return { data: { session: null }, error: { message: error.message } };
    }
  },
  
  // Update user
  updateUser: async (userId: string, data: any) => {
    try {
      const { db } = await connectToDatabase();
      const collection = db.collection("users");
      
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { user_metadata: data } }
      );
      
      return { data: { user: { id: userId, ...data } }, error: null };
    } catch (error: any) {
      console.error("Update user error:", error);
      return { data: null, error: { message: error.message } };
    }
  }
};
