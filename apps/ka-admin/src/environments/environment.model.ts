export interface AppEnvironment {
  production: boolean;
  projectName: string;
  /** 部署子路径，对齐 kr `VITE_APP_PUBLIC_PATH` */
  publicPath: string;
  apiBaseUrl: string;
  /** 本地 dev-server 内联 Mock（`esbuild/mock-middleware.ts`）；关闭后走 `esbuild/proxy.conf.mjs` */
  useMock: boolean;
  /** 是否装配 `_example` Demo；关闭须走 `business` 构建配置（fileReplacements 换 stubs） */
  useExample: boolean;
  /** OIDC 登录入口覆盖；空则同源 `/login` */
  loginUrl: string;
  /** RP 登出入口覆盖；空则同源 `/logout` */
  logoutUrl: string;
}
