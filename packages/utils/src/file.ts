export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadUrl(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 从 URL 中提取文件名（去除 query 与 hash，并 decode）
 */
export function getFileNameByUrl(url: string): string {
  const num = url.lastIndexOf('/') + 1;
  const fileName = (url.substring(num).split('?')[0] || '').split('#')[0] || '';
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

/**
 * 通过 a[download] 下载，老浏览器降级到 window.open
 * 与 downloadUrl 的区别：fileName 可省略；含 fallback
 */
export function downloadFile(url: string, target = '_self', fileName?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.target = target;

  if (link.download !== undefined) {
    link.download = fileName || getFileNameByUrl(url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const joinChar = url.includes('?') ? '&' : '?';
  const targetUrl = `${url}${joinChar}response-content-type=application/octet-stream`;
  window.open(targetUrl, target);
}

/**
 * 通过隐藏 form 提交触发下载（适用于需要服务端返回 attachment 的场景）
 */
export function doDownload(
  url: string,
  payload: Record<string, string | number> = {},
  method: 'GET' | 'POST' = 'GET',
): void {
  const body = document.getElementsByTagName('body')[0];
  const form = document.createElement('form');
  form.method = method;
  form.action = url;
  const data: Record<string, string | number> = { ...payload, t: new Date().getTime() };
  for (const key in data) {
    const param = document.createElement('input');
    param.type = 'hidden';
    param.name = key;
    param.value = String(data[key]);
    form.appendChild(param);
  }
  body?.appendChild(form);
  form.submit();
  body?.removeChild(form);
}

export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index > -1 ? filename.slice(index + 1).toLowerCase() : '';
}

export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
}

/**
 * 从 Content-Disposition 响应头中提取文件名。
 * 按优先级依次匹配：RFC 5987 encoded (filename*=UTF-8'')、双引号、无引号。
 */
export function getFilenameFromContentDisposition(header: string): string | null {
  const match =
    header.match(/filename\*=UTF-8''([^;]+)/) ||
    header.match(/filename="([^"]+)"/) ||
    header.match(/filename=([^;]+)/);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

/**
 * 从 axios blob 响应中提取文件名并触发浏览器下载。
 * headers 传入 axios response.headers（大小写均可）。
 */
export function downloadBlobResponse(
  blob: Blob,
  headers: Record<string, string>,
  fallbackFilename = 'download',
): void {
  const cd = headers['content-disposition'] || headers['Content-Disposition'] || '';
  const filename = getFilenameFromContentDisposition(cd) || fallbackFilename;
  downloadBlob(blob, filename);
}

/**
 * 通过 fetcher 函数获取 Blob 并触发浏览器下载。
 *
 * 适用于需要携带 `Authorization` 等请求头的文件下载接口（Bearer token 场景）。
 * fetcher 应使用已配置了鉴权拦截器的 axios 实例，并设置 `responseType: 'blob'`。
 *
 * @example
 * ```ts
 * await downloadBlobByFetch(
 *   () => logsApi.download({ ...filters }),
 *   { fallbackFilename: 'logs.xlsx' }
 * )
 * ```
 *
 * @param fetcher  返回含 `data: Blob` 与 `headers` 的 axios 响应的函数
 * @param options.fallbackFilename  Content-Disposition 缺失时的兜底文件名（默认 `'download'`）
 * @param options.preCheck  前置校验，返回 `false` 时中止下载，不抛出异常
 */
export async function downloadBlobByFetch(
  fetcher: () => Promise<{ data: Blob; headers: Record<string, unknown> }>,
  options?: {
    fallbackFilename?: string;
    preCheck?: () => boolean;
  },
): Promise<void> {
  const { fallbackFilename = 'download', preCheck } = options ?? {};
  if (preCheck && !preCheck()) return;
  const res = await fetcher();
  downloadBlobResponse(res.data, res.headers as Record<string, string>, fallbackFilename);
}
