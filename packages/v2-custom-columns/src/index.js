/**
 * @ku-utils/v2-custom-columns
 *
 * Vue 2 自定义列组件库 — schema + v-for 驱动
 *
 * 使用方式：
 *   import { useSchemaColumnConfig, DoTableHeader } from '@ku-utils/v2-custom-columns'
 *   import '@ku-utils/v2-custom-columns/style'
 */

export { default as useSchemaColumnConfig } from './mixins/useSchemaColumnConfig.js';
export { default as ElementTableColumnAdapter } from './mixins/ElementTableColumnAdapter.js';
export { default as DoConfigColumnDialog } from './components/DoConfigColumnDialog.vue';
export { default as DoReadColumnConfig } from './components/DoReadColumnConfig.vue';
export { default as DoTableHeader } from './components/DoTableHeader.vue';
export { transferTF } from '@ku-utils/utils';

/**
 * Vue 插件安装函数
 * 全局注册所有组件：DoTableHeader、DoConfigColumnDialog、DoReadColumnConfig
 *
 * 用法：
 *   import Vue from 'vue'
 *   import KuUtilsV2CustomColumns from '@ku-utils/v2-custom-columns'
 *   import '@ku-utils/v2-custom-columns/style'
 *   Vue.use(KuUtilsV2CustomColumns)
 */
import DoConfigColumnDialog from './components/DoConfigColumnDialog.vue';
import DoReadColumnConfig from './components/DoReadColumnConfig.vue';
import DoTableHeader from './components/DoTableHeader.vue';

const components = [DoTableHeader, DoConfigColumnDialog, DoReadColumnConfig];

function install(Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
}

export default { install };
