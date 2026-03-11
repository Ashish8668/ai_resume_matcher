/**
 * CORS configuration for the API Gateway
 */
const cors = require('cors');
const { ALLOWED_ORIGINS, NODE_ENV } = require('./env');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins for easier testing
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed list
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
      callback(null, true);
    } else {
      // Log the blocked origin for debugging
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, false); // Return false instead of Error to avoid throwing
    }
  },
  credentials: false, // No cookies/auth needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-User-UUID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

module.exports = cors(corsOptions);
