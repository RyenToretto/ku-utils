/**
 * 巨效典籍 Tome — kv3-admin 默认皮肤。
 * 灵感：冒险手记商店 / 羊皮纸叠层（深褐炭顶栏 + 石板蓝侧栏 + 羊皮纸货架）。
 * 浅色实心主色控件：深金 + 白字（对齐 Featured）；暗色烛金 + 墨字。
 * 色值对齐 `.playwright-mcp/logs/design/tome-reference.md` 取样。
 *
 * 这里只放「品牌语义色」数据；间距 / 圆角 / 字号等通用 token 在 ../base-tokens.js。
 * Element Plus 的 --el-color-* 完整色阶由 scripts/generate.mjs 通过 mix() 从
 * 下面的基色算出，不在这里手写第二套色板。
 *
 * 要启用：跑一次 `pnpm --filter @ku-utils/skin build`，再 `import '@ku-utils/skin/tome'`。
 * kv3-admin 已默认引用本皮肤。
 */
export default {
  id: 'tome',
  label: '巨效典籍 Tome',
  description: '冒险手记风：深褐炭顶栏 + 石板蓝侧栏 + 羊皮纸内容；浅色深金白字选中，暗色烛金墨字。',

  light: {
    primaryScale: {
      50: '#fbf6ec',
      100: '#f5ead2',
      200: '#ebd5a8',
      300: '#dfbc78',
      400: '#c9964a',
      500: '#9a6328',
      600: '#8b572a',
      700: '#7a4a24',
      800: '#633c1e',
      900: '#4a2d16',
      950: '#2e1b0d',
    },
    'color-primary': '#9a6328',
    'color-primary-hover': '#8b572a',
    'color-primary-light': '#dfbc78',
    'color-primary-bg': '#fbf6ec',

    'color-success': '#3d9a5c',
    'color-success-bg': '#f0f7f2',
    'color-success-border': '#b7dfc4',
    'color-warning': '#d4a017',
    'color-warning-bg': '#fff9e8',
    'color-warning-border': '#f0d78a',
    'color-danger': '#9f6559',
    'color-danger-bg': '#fdf2f0',
    'color-danger-border': '#e8c4bc',
    'color-info': '#6b7280',
    'color-info-bg': '#f4f1ea',
    'color-info-border': '#d8d0c0',

    /* 羊皮纸货架：内容底略暗于卡片 */
    'bg-page-from': '#f4eee1',
    'bg-page-to': '#efe6d6',
    'bg-card': '#f7f3eb',
    'bg-card-elevated': '#fcf8f2',
    /* 石板蓝导航（取样加深以保证象牙字对比） */
    'bg-sidebar': '#4a596b',
    'bg-sidebar-active': '#9e6528',
    'bg-sidebar-hover': 'rgba(230, 216, 193, 0.12)',
    'table-stripe-bg': '#f3ebe0',
    'table-header-bg': '#ebe3d4',
    'bg-input': '#fcf8f2',
    'bg-hover': 'rgba(154, 99, 40, 0.12)',
    'bg-active': 'rgba(158, 101, 40, 0.2)',
    'bg-tag': '#f5ead2',
    'bg-overlay': 'rgba(46, 39, 43, 0.48)',
    'bg-tooltip': '#2e272b',

    /* 深褐炭顶栏，对齐商店顶条 */
    'top-header-bg': '#2e272b',
    'top-header-text': '#e6d8c1',
    'top-header-text-muted': '#d8ccb8',
    'top-header-hover-bg': 'rgba(230, 216, 193, 0.1)',
    'top-header-hover-border': 'rgba(158, 101, 40, 0.4)',
    'top-header-active-bg': 'rgba(158, 101, 40, 0.22)',
    'top-header-active-border': 'transparent',
    'top-header-active-indicator': '#c9964a',
    'top-header-active-indicator-size': '3px',
    'top-header-expanded-bg': 'rgba(230, 216, 193, 0.14)',
    'top-header-expanded-border': 'rgba(158, 101, 40, 0.45)',
    'top-header-expanded-text': '#f4eee1',
    'top-header-selection-bg': 'rgba(158, 101, 40, 0.4)',
    'top-header-selection-text': '#ffffff',

    /* 纸上墨迹；侧栏未选中象牙；实心主色控件白字 */
    'text-primary': '#4e4540',
    'text-secondary': '#6d655a',
    'text-disabled': '#a89f90',
    'text-placeholder': '#8a8172',
    'text-link': '#8b572a',
    'text-link-hover': '#6f4522',
    'text-inverse': '#f4eee1',
    'text-on-sidebar': '#e6d8c1',
    'text-on-sidebar-muted': '#d8ccb8',
    'text-on-sidebar-active': '#ffffff',
    'text-on-primary': '#ffffff',

    /* 灰金描边，对齐卡片双线边 */
    'border-default': '#c5bcb0',
    'border-hover': '#b0a494',
    'border-focus': '#9a6328',
    'border-light': '#ddd4c6',
    divider: '#e5dccf',

    'chart-ring-1': '#9f6559',
    'chart-ring-2': '#3d9a5c',
    'chart-ring-3': '#d4a017',
    'chart-ring-4': '#c9964a',
    'chart-ring-track': 'rgba(154, 99, 40, 0.16)',

    'scrollbar-track': '#ebe3d4',
    'scrollbar-thumb': '#b8ad96',
    'scrollbar-thumb-hover': '#9a6328',
    'selection-bg': 'rgba(154, 99, 40, 0.28)',
    'selection-text': '#ffffff',

    'shadow-card': '0 1px 2px rgba(46, 39, 43, 0.06), 0 3px 10px rgba(46, 39, 43, 0.08)',
    'shadow-card-hover': '0 4px 14px rgba(46, 39, 43, 0.1), 0 10px 28px rgba(46, 39, 43, 0.08)',
    'shadow-nav-active': '0 0 12px rgba(158, 101, 40, 0.35), 0 2px 8px rgba(154, 99, 40, 0.25)',
    'shadow-modal': '0 12px 36px rgba(46, 39, 43, 0.22)',
    'shadow-dropdown': '0 6px 20px rgba(46, 39, 43, 0.12)',

    'loading-bg': 'rgba(247, 243, 235, 0.88)',

    'font-family-base':
      "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'PingFang SC', 'Microsoft YaHei', Georgia, serif",
    'font-family-mono': "'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace",
  },

  dark: {
    /* 夜读：冷炭页 + 烛金，去掉泥褐脏感 */
    'color-primary': '#e0a060',
    'color-primary-hover': '#ebb078',
    'color-primary-light': '#b8843c',
    'color-primary-bg': 'rgba(224, 160, 96, 0.16)',

    'color-success-bg': 'rgba(61, 154, 92, 0.14)',
    'color-success-border': 'rgba(61, 154, 92, 0.3)',
    'color-warning-bg': 'rgba(212, 160, 23, 0.14)',
    'color-warning-border': 'rgba(212, 160, 23, 0.3)',
    'color-danger': '#c4877c',
    'color-danger-bg': 'rgba(159, 101, 89, 0.18)',
    'color-danger-border': 'rgba(159, 101, 89, 0.35)',
    'color-info-bg': 'rgba(168, 159, 144, 0.14)',
    'color-info-border': 'rgba(168, 159, 144, 0.28)',

    'bg-page-from': '#1a1c22',
    'bg-page-to': '#14161b',
    'bg-card': '#262a33',
    'bg-card-elevated': '#2f3440',
    'bg-sidebar': '#3a4554',
    'bg-sidebar-active': '#e0a060',
    'bg-sidebar-hover': 'rgba(230, 216, 193, 0.1)',
    'table-stripe-bg': '#22262e',
    'table-header-bg': '#1f232b',
    'bg-input': '#262a33',
    'bg-hover': 'rgba(224, 160, 96, 0.16)',
    'bg-active': 'rgba(224, 160, 96, 0.22)',
    'bg-tag': 'rgba(224, 160, 96, 0.14)',
    'bg-overlay': 'rgba(0, 0, 0, 0.72)',
    'bg-tooltip': '#ede6da',

    'top-header-bg': '#1e1c20',
    'top-header-text': '#ede6da',
    'top-header-text-muted': '#c9bba8',
    'top-header-hover-bg': 'rgba(230, 216, 193, 0.08)',
    'top-header-active-bg': 'rgba(224, 160, 96, 0.18)',
    'top-header-active-indicator': '#e0a060',
    'top-header-expanded-bg': 'rgba(230, 216, 193, 0.12)',
    'top-header-expanded-text': '#ede6da',
    'top-header-selection-bg': 'rgba(224, 160, 96, 0.36)',
    'top-header-selection-text': '#1a1c22',

    'text-primary': '#ede6da',
    'text-secondary': '#b8aa96',
    'text-disabled': '#6d655a',
    'text-placeholder': '#8a8172',
    'text-link': '#e0a060',
    'text-link-hover': '#ebb078',
    'text-inverse': '#1a1c22',
    'text-on-sidebar': '#ede6da',
    'text-on-sidebar-muted': '#c9bba8',
    'text-on-sidebar-active': '#1a1c22',
    'text-on-primary': '#1a1c22',

    'border-default': 'rgba(201, 184, 150, 0.28)',
    'border-hover': 'rgba(201, 184, 150, 0.42)',
    'border-focus': '#e0a060',
    'border-light': 'rgba(201, 184, 150, 0.14)',
    divider: 'rgba(201, 184, 150, 0.1)',

    'chart-ring-4': '#e0a060',
    'chart-ring-track': 'rgba(224, 160, 96, 0.18)',

    'scrollbar-track': '#262a33',
    'scrollbar-thumb': '#4a5566',
    'scrollbar-thumb-hover': '#e0a060',
    'selection-bg': 'rgba(224, 160, 96, 0.3)',
    'selection-text': '#ede6da',

    'shadow-card': '0 2px 8px rgba(0, 0, 0, 0.36), 0 8px 24px rgba(0, 0, 0, 0.24)',
    'shadow-card-hover': '0 6px 16px rgba(0, 0, 0, 0.44), 0 16px 36px rgba(0, 0, 0, 0.3)',
    'shadow-nav-active': '0 0 14px rgba(224, 160, 96, 0.35)',
    'shadow-modal': '0 12px 32px rgba(0, 0, 0, 0.58)',
    'shadow-dropdown': '0 8px 24px rgba(0, 0, 0, 0.44)',

    'loading-bg': 'rgba(26, 28, 34, 0.84)',
  },

  layout: {
    scrollbarWidth: '10px',
    asideWidth: '220px',
  },
};
