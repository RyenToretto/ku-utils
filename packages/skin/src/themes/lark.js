/**
 * 巨效云雀（Lark）— v1 唯一皮肤，来自 jx-dsp 桌面端默认皮肤。
 * 主色 #3370FF，参考飞书桌面端；高键冷灰白底，避开青绿 / 暖霞玫粉。
 *
 * 这里只放「品牌语义色」数据；间距 / 圆角 / 字号等通用 token 在 ../base-tokens.js。
 * Element Plus 的 --el-color-* 完整色阶由 scripts/generate.mjs 通过 mix() 从
 * 下面的基色算出，不在这里手写第二套色板。
 *
 * key 已是最终 CSS 变量后缀（--ku-<key>），照抄本文件形状改色值即可新增皮肤，
 * 不需要改 generate.mjs。
 */
export default {
  id: 'lark',
  label: '巨效云雀 Lark',
  description: 'jx-dsp 桌面端默认皮肤：主色 #3370FF，Light 页面底 #f7f8fa → #f2f3f5。',

  light: {
    primaryScale: {
      50: '#f0f4ff',
      100: '#e1eaff',
      200: '#c2d4ff',
      300: '#94b4ff',
      400: '#668fff',
      500: '#3370ff',
      600: '#245bdb',
      700: '#1a4bb8',
      800: '#143a8f',
      900: '#0f2a66',
      950: '#0a1a40',
    },
    'color-primary': '#3370ff',
    'color-primary-hover': '#245bdb',
    'color-primary-light': '#c2d4ff',
    'color-primary-bg': '#f0f4ff',

    'color-success': '#34c724',
    'color-success-bg': '#f0faf0',
    'color-success-border': '#b7eb8f',
    'color-warning': '#ff8800',
    'color-warning-bg': '#fff7e8',
    'color-warning-border': '#ffe1a6',
    'color-danger': '#f54a45',
    'color-danger-bg': '#fef1f1',
    'color-danger-border': '#fdcdc5',
    'color-info': '#8f959e',
    'color-info-bg': '#f7f8fa',
    'color-info-border': '#dee0e3',

    'bg-page-from': '#f7f8fa',
    'bg-page-to': '#f2f3f5',
    'bg-card': '#ffffff',
    'bg-card-elevated': '#ffffff',
    'bg-sidebar': '#eff0f1',
    'bg-sidebar-active': 'rgba(51, 112, 255, 0.12)',
    'bg-sidebar-hover': 'rgba(51, 112, 255, 0.06)',
    'table-stripe-bg': '#fafbfc',
    'table-header-bg': '#f5f6f7',
    'bg-input': '#ffffff',
    'bg-hover': 'rgba(51, 112, 255, 0.06)',
    'bg-active': 'rgba(51, 112, 255, 0.1)',
    'bg-tag': '#f0f4ff',
    'bg-overlay': 'rgba(31, 35, 41, 0.5)',
    'bg-tooltip': '#1f2329',

    'top-header-bg': '#000000',
    'top-header-text': '#f2f3f5',
    'top-header-text-muted': '#8f959e',
    'top-header-hover-bg': 'rgba(255, 255, 255, 0.08)',
    'top-header-hover-border': 'rgba(222, 224, 227, 0.22)',
    'top-header-active-bg': 'rgba(255, 255, 255, 0.1)',
    'top-header-active-border': 'transparent',
    'top-header-active-indicator': '#3370ff',
    'top-header-active-indicator-size': '3px',
    'top-header-expanded-bg': 'rgba(255, 255, 255, 0.14)',
    'top-header-expanded-border': 'rgba(255, 255, 255, 0.24)',
    'top-header-expanded-text': '#ffffff',
    'top-header-selection-bg': 'rgba(51, 112, 255, 0.36)',
    'top-header-selection-text': '#ffffff',

    'text-primary': '#1f2329',
    'text-secondary': '#646a73',
    'text-disabled': '#bbbfc4',
    'text-placeholder': '#8f959e',
    'text-link': '#3370ff',
    'text-link-hover': '#245bdb',
    'text-inverse': '#ffffff',
    'text-on-sidebar': '#1f2329',
    'text-on-sidebar-muted': '#646a73',

    'border-default': '#dee0e3',
    'border-hover': '#c6c9ce',
    'border-focus': '#245bdb',
    'border-light': '#e5e6eb',
    divider: '#e5e6eb',

    'chart-ring-1': '#f54a45',
    'chart-ring-2': '#34c724',
    'chart-ring-3': '#ff8800',
    'chart-ring-4': '#3370ff',
    'chart-ring-track': 'rgba(51, 112, 255, 0.14)',

    'scrollbar-track': '#f2f3f5',
    'scrollbar-thumb': '#c6c9ce',
    'scrollbar-thumb-hover': '#3370ff',
    'selection-bg': 'rgba(51, 112, 255, 0.22)',
    'selection-text': '#1f2329',

    'shadow-card': '0 1px 2px rgba(31, 35, 41, 0.04), 0 1px 3px rgba(31, 35, 41, 0.03)',
    'shadow-card-hover': '0 4px 12px rgba(31, 35, 41, 0.06), 0 8px 20px rgba(31, 35, 41, 0.04)',
    'shadow-nav-active': '0 2px 8px rgba(51, 112, 255, 0.12)',
    'shadow-modal': '0 12px 32px rgba(31, 35, 41, 0.14)',
    'shadow-dropdown': '0 4px 16px rgba(31, 35, 41, 0.08)',

    'loading-bg': 'rgba(255, 255, 255, 0.8)',

    'font-family-base':
      "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif",
    'font-family-mono': "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
  },

  // 只列出相对 light 变化的键，未出现的键沿用 light（html.dark 与 :root 同为 <html>，
  // 未重新声明的自定义属性会保留 :root 的值，不需要手工合并）。
  dark: {
    'color-primary': '#4e83fd',
    'color-primary-hover': '#75a0fe',
    'color-primary-light': '#1a4bb8',
    'color-primary-bg': 'rgba(78, 131, 253, 0.16)',

    'color-success-bg': 'rgba(52, 199, 36, 0.12)',
    'color-success-border': 'rgba(52, 199, 36, 0.28)',
    'color-warning-bg': 'rgba(255, 136, 0, 0.12)',
    'color-warning-border': 'rgba(255, 136, 0, 0.28)',
    'color-danger-bg': 'rgba(245, 74, 69, 0.12)',
    'color-danger-border': 'rgba(245, 74, 69, 0.28)',
    'color-info-bg': 'rgba(143, 149, 158, 0.14)',
    'color-info-border': 'rgba(143, 149, 158, 0.28)',

    'bg-page-from': '#1a1b1e',
    'bg-page-to': '#121316',
    'bg-card': '#1f2329',
    'bg-card-elevated': '#2b2f36',
    'bg-sidebar': '#1a1b1e',
    'bg-sidebar-active': 'rgba(78, 131, 253, 0.22)',
    'bg-sidebar-hover': 'rgba(255, 255, 255, 0.06)',
    'table-stripe-bg': '#25272c',
    'table-header-bg': '#22252b',
    'bg-input': '#1f2329',
    'bg-hover': 'rgba(78, 131, 253, 0.12)',
    'bg-active': 'rgba(78, 131, 253, 0.2)',
    'bg-tag': 'rgba(78, 131, 253, 0.14)',
    'bg-overlay': 'rgba(0, 0, 0, 0.74)',
    'bg-tooltip': '#f0f4ff',

    // 顶栏固定深色，不随 html.dark 切换视觉，仅主色指示条跟随品牌色。
    'top-header-active-indicator': '#4e83fd',
    'top-header-selection-bg': 'rgba(78, 131, 253, 0.36)',

    'text-primary': '#f2f3f5',
    'text-secondary': '#8f959e',
    'text-disabled': '#4e535a',
    'text-placeholder': '#646a73',
    'text-link': '#4e83fd',
    'text-link-hover': '#75a0fe',
    'text-inverse': '#121316',
    'text-on-sidebar': '#f2f3f5',
    'text-on-sidebar-muted': '#8f959e',

    'border-default': 'rgba(143, 149, 158, 0.22)',
    'border-hover': 'rgba(143, 149, 158, 0.36)',
    'border-focus': '#4e83fd',
    'border-light': 'rgba(143, 149, 158, 0.12)',
    divider: 'rgba(143, 149, 158, 0.1)',

    'chart-ring-4': '#4e83fd',
    'chart-ring-track': 'rgba(78, 131, 253, 0.18)',

    'scrollbar-track': '#1f2329',
    'scrollbar-thumb': '#3a3f47',
    'scrollbar-thumb-hover': '#4e83fd',
    'selection-bg': 'rgba(78, 131, 253, 0.3)',
    'selection-text': '#f2f3f5',

    'shadow-card': '0 2px 8px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.28)',
    'shadow-card-hover': '0 6px 16px rgba(0, 0, 0, 0.48), 0 16px 36px rgba(0, 0, 0, 0.36)',
    'shadow-nav-active': '0 0 0 1px rgba(78, 131, 253, 0.14)',
    'shadow-modal': '0 12px 32px rgba(0, 0, 0, 0.6)',
    'shadow-dropdown': '0 8px 24px rgba(0, 0, 0, 0.48)',

    'loading-bg': 'rgba(23, 23, 23, 0.8)',
  },

  layout: {
    scrollbarWidth: '10px',
    asideWidth: '220px',
  },
};
