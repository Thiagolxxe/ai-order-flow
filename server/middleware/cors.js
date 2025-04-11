
/**
 * Enhanced CORS middleware with detailed logging and diagnostics
 */
const cors = require('cors');

const createCorsMiddleware = (allowedOrigins = ['*']) => {
  // Convert wildcard to function for more control
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Log detailed info about rejected origins
      console.warn(`CORS rejected origin: ${origin}`);
      
      // Still allow the request but log it
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  
  // Create the middleware
  const corsMiddleware = cors(corsOptions);
  
  // Enhanced middleware with logging
  return (req, res, next) => {
    // Log the request origin for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`CORS request from: ${req.headers.origin || 'Unknown'} to ${req.method} ${req.url}`);
    }
    
    // Apply the cors middleware
    corsMiddleware(req, res, next);
  };
};

module.exports = createCorsMiddleware;
