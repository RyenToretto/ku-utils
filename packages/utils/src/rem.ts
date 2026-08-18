export interface SetFontSizeOptions {
  designWid?: number;
  maxRatio?: number;
  maxMobileWidth?: number;
}

interface VueLikeApp {
  use?: (plugin: unknown, ...args: unknown[]) => unknown;
}

function applyFontSize(opts: Required<SetFontSizeOptions>): void {
  const viewportWidth = document.documentElement.clientWidth;
  let ratio = viewportWidth / (opts.designWid / 100);

  if (viewportWidth > opts.maxMobileWidth) {
    ratio = opts.maxRatio;
  }

  const fs = Math.min(ratio, opts.maxRatio);
  document.documentElement.style.fontSize = fs ? `${fs}px` : '';
}

/**
 * 启用 rem 自适应字号
 * @returns 取消监听的清理函数
 */
export function initFontSize(options: SetFontSizeOptions = {}): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const opts: Required<SetFontSizeOptions> = {
    designWid: options.designWid ?? 750,
    maxRatio: options.maxRatio ?? 100,
    maxMobileWidth: options.maxMobileWidth ?? 720,
  };

  applyFontSize(opts);

  let timer: ReturnType<typeof setTimeout>;
  const handler = () => {
    clearTimeout(timer);
    timer = setTimeout(() => applyFontSize(opts), 300);
  };

  window.addEventListener('resize', handler, false);
  return () => window.removeEventListener('resize', handler, false);
}

/**
 * Vue 2/3 插件形式：
 *   app.use(setFontSizePlugin, { designWid: 750 })
 */
export const setFontSizePlugin = {
  install(_app: VueLikeApp, options: SetFontSizeOptions = {}): void {
    initFontSize(options);
  },
};
