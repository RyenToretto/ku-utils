import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  projectName: 'ka-admin',
  publicPath: '/',
  apiBaseUrl: '/api',
  useMock: true,
  useExample: false,
  loginUrl: '',
  logoutUrl: '',
};
