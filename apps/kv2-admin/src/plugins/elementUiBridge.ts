/**
 * Element UI 全局安装（替代 kv3 的 elementPlusBridge）。
 * v2-custom-columns 通过 resolveComponent('el-*') 消费全局组件。
 */
import ElementUI from 'element-ui';
import locale from 'element-ui/lib/locale/lang/zh-CN';
import type { PluginObject } from 'vue';
import Vue from 'vue';

import 'element-ui/lib/theme-chalk/index.css';

/**
 * 不设全局 size，与 kv3 `el-config-provider`（无 size）对齐：
 * 筛选主按钮 / radio 用默认尺寸；表格操作等显式 size="small"。
 */
const elementUiBridge: PluginObject<undefined> = {
  install(app) {
    app.use(ElementUI, { locale });
  },
};

/** 独立安装入口（main 里也可直接 Vue.use） */
export function installElementUi() {
  Vue.use(ElementUI, { locale });
}

export default elementUiBridge;
