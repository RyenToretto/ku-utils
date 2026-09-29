import type { ProxyOptions, UserConfig } from 'vite';

function createPassThroughProxy(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    secure: false,
    // 沙盒 Set-Cookie 若带 Domain=10.48.1.171，改写后才能落到 localhost
    cookieDomainRewrite: '',
  };
}

export function createServerConfig(
  useMock: boolean,
  proxyTarget: string,
  port: number,
  logProxy = false,
): UserConfig['server'] {
  if (logProxy && !useMock) {
    console.warn(`[vite] API proxy → ${proxyTarget}`);
  }

  return {
    port,
    strictPort: false,
    ...(!useMock && {
      proxy: {
        '/api': createPassThroughProxy(proxyTarget),
        '/oauth2': createPassThroughProxy(proxyTarget),
        '/login': createPassThroughProxy(proxyTarget),
        '/logout': createPassThroughProxy(proxyTarget),
      },
    }),
  };
}
