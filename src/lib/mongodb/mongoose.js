import mongoose from 'mongoose';

// Global variable to cache the database connection
const cached = {
  conn: null,
  promise: null
};

/**
 * Connect to MongoDB database
 * This function implements connection pooling to reuse the connection across requests
 */
async function dbConnect() {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is being established, wait for it
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-app';

    // Set up mongoose options
    const opts = {
      bufferCommands: false,
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Reset the promise if there's an error
    cached.promise = null;
    throw error;
  }
}

export default dbConnect;
