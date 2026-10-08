import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  projectName: 'ka-admin',
  publicPath: '/',
  apiBaseUrl: '/api',
  useMock: true,
  useExample: true,
  loginUrl: '',
  logoutUrl: '',
};
