/**
 * 关闭 Mock（environment.development.ts `useMock: false`）时的后端代理，对齐 kr `VITE_APP_API_PROXY`。
 * 目标可用环境变量 `KA_API_PROXY` 覆盖。
 */
const target = process.env.KA_API_PROXY || 'http://localhost:8181';

export default ['/api', '/oauth2', '/login', '/logout'].reduce((acc, path) => {
  acc[path] = { target, changeOrigin: true, secure: false };
  return acc;
}, {});
