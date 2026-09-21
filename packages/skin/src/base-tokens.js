/**
 * 与皮肤无关的 --ku-* 基础层：间距 / 圆角 / 字号 / 阴影 / 过渡 / 层级 / 中性灰阶。
 * 所有皮肤共用同一份，不放进 themes/*.js，避免每套皮肤重复抄一遍。
 * key 已是最终 CSS 变量后缀（--ku-<key>），因此直接用 kebab-case。
 */
export default {
  /* ---- 中性灰阶（不随皮肤变化，用于组件默认态文字/描边） ---- */
  'neutral-50': '#fafafa',
  'neutral-100': '#f5f5f5',
  'neutral-200': '#e5e5e5',
  'neutral-300': '#d4d4d4',
  'neutral-400': '#a3a3a3',
  'neutral-500': '#737373',
  'neutral-600': '#525252',
  'neutral-700': '#404040',
  'neutral-800': '#262626',
  'neutral-900': '#171717',

  /* ---- 间距 ---- */
  'space-1': '0.25rem',
  'space-2': '0.5rem',
  'space-3': '0.75rem',
  'space-4': '1rem',
  'space-5': '1.25rem',
  'space-6': '1.5rem',
  'space-8': '2rem',

  /* ---- 圆角 ---- */
  'radius-sm': '0.25rem',
  'radius-base': '0.375rem',
  'radius-md': '0.5rem',
  'radius-lg': '0.75rem',
  'radius-xl': '1rem',
  'radius-full': '9999px',

  /* ---- 字号 / 字重 ---- */
  'font-size-xs': '0.75rem',
  'font-size-sm': '0.875rem',
  'font-size-base': '1rem',
  'font-size-lg': '1.125rem',
  'font-size-xl': '1.25rem',
  'font-size-2xl': '1.5rem',
  'font-weight-medium': '500',
  'font-weight-semibold': '600',

  /*
   * 正文字体：系统 UI 无衬线（与后台可读性对齐）。
   * 禁止把未托管的展示字体（如 Noto Serif / Songti）放进 body 栈首位。
   * 全局正文不引入第三方品牌字体文件。
   */
  'font-family-base':
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  'font-family-mono':
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

  /* ---- 通用阴影（组件用，区别于皮肤的 shadow-card 等品牌阴影） ---- */
  'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  /* ---- 过渡 / 层级 ---- */
  'transition-fast': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  'transition-base': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  'transition-slow': '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  'z-dropdown': '1000',
  'z-sticky': '1020',
  'z-overlay': '1040',
  'z-modal': '1050',
  'z-popover': '1060',
  'z-tooltip': '1070',
};
