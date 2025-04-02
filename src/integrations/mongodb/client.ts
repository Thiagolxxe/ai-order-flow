
import { MongoClient, ServerApiVersion } from 'mongodb';

// Replace this connection string with your own from MongoDB Atlas
const MONGODB_URI = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connection to MongoDB
let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global is used here to maintain a cached connection across hot reloads
// @ts-ignore
let cached = global.mongo;

if (!cached) {
  // @ts-ignore
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db("delivery_app"),
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
