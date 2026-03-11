/**
 * Environment variable validation and configuration
 */
require('dotenv').config();

const requiredEnvVars = [
  'MONGODB_URI',
  'AI_ENGINE_URL'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated');
};

module.exports = {
  validateEnv,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  UUID_VALIDATION_ENABLED: process.env.UUID_VALIDATION_ENABLED !== 'false',
};
