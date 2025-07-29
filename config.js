const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Determine environment
const env = process.env.NODE_ENV || 'development';

// Load base environment file
const envPath = path.resolve(__dirname, `.env.${env}`);
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Load local overrides if they exist
const localEnvPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

// Export configuration
module.exports = {
  env,
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  apiBaseUrl: process.env.API_BASE_URL,
  corsOrigin: process.env.CORS_ORIGIN,
  debug: process.env.DEBUG === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  sentryDsn: process.env.SENTRY_DSN,
  isProduction: env === 'production',
  isTest: env === 'test'
};