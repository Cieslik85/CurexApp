// Environment configuration and validation
export const ENV_CONFIG = {
  // Exchange Rate API
  EXCHANGE_RATE_API_KEY: process.env.EXPO_PUBLIC_EXCHANGE_RATE_API_KEY,
  
  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'CurexApp',
  DEFAULT_BASE_CURRENCY: process.env.EXPO_PUBLIC_DEFAULT_BASE_CURRENCY || 'USD',
  CACHE_DURATION_HOURS: parseInt(process.env.EXPO_PUBLIC_CACHE_DURATION_HOURS || '4'),
  DAILY_REQUEST_LIMIT: parseInt(process.env.EXPO_PUBLIC_DAILY_REQUEST_LIMIT || '48'),
};

// Validation function for required environment variables
export const validateEnvConfig = (): string[] => {
  const errors: string[] = [];
  
  if (!ENV_CONFIG.EXCHANGE_RATE_API_KEY) {
    errors.push('EXPO_PUBLIC_EXCHANGE_RATE_API_KEY is required');
  }
  
  if (isNaN(ENV_CONFIG.CACHE_DURATION_HOURS) || ENV_CONFIG.CACHE_DURATION_HOURS <= 0) {
    errors.push('EXPO_PUBLIC_CACHE_DURATION_HOURS must be a positive number');
  }
  
  if (isNaN(ENV_CONFIG.DAILY_REQUEST_LIMIT) || ENV_CONFIG.DAILY_REQUEST_LIMIT <= 0) {
    errors.push('EXPO_PUBLIC_DAILY_REQUEST_LIMIT must be a positive number');
  }
  
  return errors;
};

// Log configuration errors in development
if (__DEV__) {
  const errors = validateEnvConfig();
  if (errors.length > 0) {
    console.error('Environment Configuration Errors:');
    errors.forEach(error => console.error(`- ${error}`));
    console.error('Please check your .env file or create one from .env.example');
  }
}