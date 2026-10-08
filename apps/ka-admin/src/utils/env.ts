import { environment } from '@/environments/environment';

/** 运行时环境（对齐 kr `doEnv`；真源 `src/environments/*`，按构建配置 fileReplacements） */
export const doEnv = {
  projectName: environment.projectName || 'ka-admin',
  apiBaseUrl: environment.apiBaseUrl || '/api',
  useMock: environment.useMock,
  useExample: environment.useExample,
  baseUrl: environment.publicPath || '/',
  loginUrl: environment.loginUrl,
  logoutUrl: environment.logoutUrl,
};
