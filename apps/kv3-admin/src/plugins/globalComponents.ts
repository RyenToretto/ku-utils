/**
 * 列表 / 表单基建组件全局注册。
 * 模板直接使用，业务页禁止再 `import … from '@/components/<下列>'`。
 * Header / 外观 / 预览弹层 / 品牌标仍局部引入。
 */
import type { App, Plugin } from 'vue';

import BasePagination from '@/components/BasePagination.vue';
import CellApp from '@/components/CellApp.vue';
import CellDateTime from '@/components/CellDateTime.vue';
import CellNameId from '@/components/CellNameId.vue';
import CellState from '@/components/CellState.vue';
import DateRange from '@/components/DateRange.vue';
import DoFilterPanel from '@/components/DoFilterPanel.vue';
import DoFormSection from '@/components/DoFormSection.vue';
import DoNamePattern from '@/components/DoNamePattern.vue';
import DoNumberSetter from '@/components/DoNumberSetter.vue';
import DoSelector from '@/components/DoSelector.vue';
import DoSorter from '@/components/DoSorter.vue';
import DoTxtSetter from '@/components/DoTxtSetter.vue';
import DoWordsTag from '@/components/DoWordsTag.vue';
import PageHeader from '@/components/PageHeader.vue';
import TableWrap from '@/components/TableWrap.vue';

const GLOBAL_BASE_COMPONENTS = {
  BasePagination,
  CellApp,
  CellDateTime,
  CellNameId,
  CellState,
  DateRange,
  DoFilterPanel,
  DoFormSection,
  DoNamePattern,
  DoNumberSetter,
  DoSelector,
  DoSorter,
  DoTxtSetter,
  DoWordsTag,
  PageHeader,
  TableWrap,
} as const;

export type GlobalBaseComponentName = keyof typeof GLOBAL_BASE_COMPONENTS;

export const GLOBAL_BASE_COMPONENT_NAMES = Object.keys(
  GLOBAL_BASE_COMPONENTS,
) as GlobalBaseComponentName[];

const globalComponents: Plugin = {
  install(app: App) {
    Object.entries(GLOBAL_BASE_COMPONENTS).forEach(([name, comp]) => {
      app.component(name, comp);
    });
  },
};

export default globalComponents;
