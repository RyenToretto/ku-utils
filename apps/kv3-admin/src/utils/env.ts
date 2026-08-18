export const doEnv = {
  VITE_APP_PROJECT_NAME: import.meta.env.VITE_APP_PROJECT_NAME || 'kv3-admin',
  VITE_APP_API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL || '/api',
  VITE_APP_API_PROXY: import.meta.env.VITE_APP_API_PROXY || '',
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',
  VITE_APP_USE_EXAMPLE: import.meta.env.VITE_APP_USE_EXAMPLE === '1',
  BASE_URL: import.meta.env.BASE_URL || '/',
};
