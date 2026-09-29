/**
 * 轻量图标：Element UI font class，替代 @element-plus/icons-vue。
 * 用法：`<el-icon><Check /></el-icon>` 或 `import { EditPen } from '@/components/icons/elIcons'`
 *
 * 注意：禁止把 `class` / `style` 声明为 props（Vue 保留属性，会刷控制台警告）；
 * 单根节点由 Vue 2 自动把父级 class/style 合并到根 `<i>`。
 */
import Vue, { defineComponent, h } from 'vue';

const NAME_TO_CLASS: Record<string, string> = {
  EditPen: 'el-icon-edit',
  Edit: 'el-icon-edit',
  Delete: 'el-icon-delete',
  Search: 'el-icon-search',
  Close: 'el-icon-close',
  Lock: 'el-icon-lock',
  Loading: 'el-icon-loading',
  Check: 'el-icon-check',
  Minus: 'el-icon-minus',
  Plus: 'el-icon-plus',
  Refresh: 'el-icon-refresh',
  ArrowDown: 'el-icon-arrow-down',
  ArrowUp: 'el-icon-arrow-up',
  ArrowRight: 'el-icon-arrow-right',
  Sunny: 'el-icon-sunny',
  SwitchButton: 'el-icon-switch-button',
  CircleCheck: 'el-icon-circle-check',
  Collection: 'el-icon-collection',
  Filter: 'el-icon-s-operation',
  Grid: 'el-icon-s-grid',
  Menu: 'el-icon-menu',
  Share: 'el-icon-share',
  TrendCharts: 'el-icon-data-line',
};

function makeIcon(iconClass: string, exportName: string) {
  return defineComponent({
    name: `Icon${exportName}`,
    render() {
      return h('i', { class: iconClass });
    },
  });
}

export const EditPen = makeIcon(NAME_TO_CLASS.EditPen, 'EditPen');
export const Edit = makeIcon(NAME_TO_CLASS.Edit, 'Edit');
export const Delete = makeIcon(NAME_TO_CLASS.Delete, 'Delete');
export const Search = makeIcon(NAME_TO_CLASS.Search, 'Search');
export const Close = makeIcon(NAME_TO_CLASS.Close, 'Close');
export const Lock = makeIcon(NAME_TO_CLASS.Lock, 'Lock');
export const Loading = makeIcon(NAME_TO_CLASS.Loading, 'Loading');
export const Check = makeIcon(NAME_TO_CLASS.Check, 'Check');
export const Minus = makeIcon(NAME_TO_CLASS.Minus, 'Minus');
export const Plus = makeIcon(NAME_TO_CLASS.Plus, 'Plus');
export const Refresh = makeIcon(NAME_TO_CLASS.Refresh, 'Refresh');
export const ArrowDown = makeIcon(NAME_TO_CLASS.ArrowDown, 'ArrowDown');
export const ArrowUp = makeIcon(NAME_TO_CLASS.ArrowUp, 'ArrowUp');
export const ArrowRight = makeIcon(NAME_TO_CLASS.ArrowRight, 'ArrowRight');
export const Sunny = makeIcon(NAME_TO_CLASS.Sunny, 'Sunny');
export const SwitchButton = makeIcon(NAME_TO_CLASS.SwitchButton, 'SwitchButton');
export const CircleCheck = makeIcon(NAME_TO_CLASS.CircleCheck, 'CircleCheck');
export const Collection = makeIcon(NAME_TO_CLASS.Collection, 'Collection');
export const Filter = makeIcon(NAME_TO_CLASS.Filter, 'Filter');
export const Grid = makeIcon(NAME_TO_CLASS.Grid, 'Grid');
export const Menu = makeIcon(NAME_TO_CLASS.Menu, 'Menu');
export const Share = makeIcon(NAME_TO_CLASS.Share, 'Share');
export const TrendCharts = makeIcon(NAME_TO_CLASS.TrendCharts, 'TrendCharts');

/** 兼容模板里残留的 `<el-icon>`（EP 写法）；尺寸走 style，class 由 Vue 2 落到根节点 */
const ElIcon = defineComponent({
  name: 'ElIcon',
  props: {
    size: { type: [Number, String], default: undefined },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'i',
        {
          class: ['el-icon', 'ku-el-icon'],
          style: props.size != null ? { fontSize: `${props.size}px` } : undefined,
        },
        slots.default ? slots.default() : [],
      );
  },
});

const ICON_COMPONENTS = {
  EditPen,
  Edit,
  Delete,
  Search,
  Close,
  Lock,
  Loading,
  Check,
  Minus,
  Plus,
  Refresh,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Sunny,
  SwitchButton,
  CircleCheck,
  Collection,
  Filter,
  Grid,
  Menu,
  Share,
  TrendCharts,
} as const;

/** HTML/SVG 保留标签名，禁止 Vue.component 全局注册 */
const RESERVED_GLOBAL_IDS = new Set(['Filter', 'Menu']);

export function registerElIcons() {
  Vue.component('ElIcon', ElIcon);
  // Element UI 注册名为 ElSubmenu；从 EP 迁来的模板仍写 el-sub-menu
  const ElSubmenu = Vue.component('ElSubmenu');
  if (ElSubmenu) {
    Vue.component('ElSubMenu', ElSubmenu);
  }

  Object.entries(ICON_COMPONENTS).forEach(([name, comp]) => {
    // Filter/Menu 与 SVG/HTML 保留标签冲突；业务侧用 import { Filter } 即可
    if (RESERVED_GLOBAL_IDS.has(name)) return;
    Vue.component(name, comp);
  });
}
