/**
 * 为 @ku-utils/custom-columns 等库内 resolveComponent('el-*') 提供全局组件。
 * unplugin-vue-components 只对业务 SFC 做本地按需引入，不会注册到 app.component。
 */
import { EditPen, Delete, Search, Close, Lock, Loading } from '@element-plus/icons-vue';
import {
  ElAvatar,
  ElButton,
  ElCheckbox,
  ElDrawer,
  ElIcon,
  ElInput,
  ElPopover,
  ElTableColumn,
  ElTooltip,
} from 'element-plus';
import type { App, Plugin } from 'vue';

import 'element-plus/es/components/avatar/style/css';
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/checkbox/style/css';
import 'element-plus/es/components/drawer/style/css';
import 'element-plus/es/components/icon/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/popover/style/css';
import 'element-plus/es/components/table-column/style/css';
import 'element-plus/es/components/tooltip/style/css';

const elementPlusBridge: Plugin = {
  install(app: App) {
    const components = [
      ElAvatar,
      ElButton,
      ElCheckbox,
      ElDrawer,
      ElIcon,
      ElInput,
      ElPopover,
      ElTableColumn,
      ElTooltip,
    ];
    components.forEach((comp) => {
      app.component(comp.name!, comp);
    });

    const icons = { EditPen, Delete, Search, Close, Lock, Loading };
    Object.entries(icons).forEach(([name, comp]) => {
      app.component(name, comp);
    });
  },
};

export default elementPlusBridge;
