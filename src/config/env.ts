// Environment configuration and validation
export const ENV_CONFIG = {
  // App Configuration
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'CurexApp',
  DEFAULT_BASE_CURRENCY: process.env.EXPO_PUBLIC_DEFAULT_BASE_CURRENCY || 'USD',
  CACHE_DURATION_MINUTES: parseInt(process.env.EXPO_PUBLIC_CACHE_DURATION_MINUTES || '30'),
  REFRESH_INTERVAL_MINUTES: parseInt(process.env.EXPO_PUBLIC_REFRESH_INTERVAL_MINUTES || '30'),
};

// Validation function for environment variables
export const validateEnvConfig = (): string[] => {
  const errors: string[] = [];
  
  if (isNaN(ENV_CONFIG.CACHE_DURATION_MINUTES) || ENV_CONFIG.CACHE_DURATION_MINUTES <= 0) {
    errors.push('EXPO_PUBLIC_CACHE_DURATION_MINUTES must be a positive number');
  }
  
  if (isNaN(ENV_CONFIG.REFRESH_INTERVAL_MINUTES) || ENV_CONFIG.REFRESH_INTERVAL_MINUTES <= 0) {
    errors.push('EXPO_PUBLIC_REFRESH_INTERVAL_MINUTES must be a positive number');
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