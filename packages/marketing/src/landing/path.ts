/**
 * 去掉尾部斜杠（但保留根路径 `/`）
 */
const normalPath = (path: string): string => (path !== '/' ? path.replace(/\/+$/, '') : '/');

/**
 * 检查当前路由是否匹配指定页面（支持国际化前缀如 `/en/...`）
 *
 * @example
 *   isMatchPage('/pricing', ['/pricing']) // true
 *   isMatchPage('/en/pricing', ['/pricing']) // true
 */
export const isMatchPage = (routePath?: string, pages?: string[]): boolean => {
  if (!routePath || !pages?.length) return false;

  const normalizedPath = normalPath(routePath);

  return pages.some((page) => {
    const normalizedPage = normalPath(page);
    if (normalizedPath === normalizedPage) return true;
    if (normalizedPage === '/') {
      const regex = new RegExp('^/[a-z]{2}(-[A-Z]{2})?$');
      return regex.test(normalizedPath);
    }
    const regex = new RegExp(`^/[a-z]{2}(-[A-Z]{2})?${normalizedPage}$`);
    return regex.test(normalizedPath);
  });
};

/**
 * 检查当前路由是否包含指定页面路径（前缀匹配，去 query / locale 前缀）
 */
export const isContainMatchPage = (routePath?: string, pages?: string[]): boolean => {
  if (!routePath || !pages?.length) return false;

  const pathWithoutQuery = routePath.split('?')[0];
  if (!pathWithoutQuery) return false;

  const normalizedPath = pathWithoutQuery !== '/' ? pathWithoutQuery.replace(/\/+$/, '') : '/';
  const localePrefixRegex = /^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/;

  return pages.some((page) => {
    const normalizedPage = page !== '/' ? page.replace(/\/+$/, '') : '/';

    if (normalizedPage === '/') {
      const regex = new RegExp('^/[a-z]{2}(-[A-Z]{2})?/?$');
      return regex.test(normalizedPath);
    }

    if (normalizedPath === normalizedPage || normalizedPath.startsWith(`${normalizedPage}/`)) {
      return true;
    }

    const pathWithoutLocale = normalizedPath.replace(localePrefixRegex, '') || '/';
    return (
      pathWithoutLocale === normalizedPage || pathWithoutLocale.startsWith(`${normalizedPage}/`)
    );
  });
};

export const isFramePage = (curPath?: string): boolean =>
  isMatchPage(curPath, ['/pay/success', '/pay/cancel']);

export const isPricingPage = (curPath?: string): boolean => isMatchPage(curPath, ['/pricing']);
