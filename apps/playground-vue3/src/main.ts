import 'element-plus/dist/index.css';
import '@ku-utils/skin';
import '@ku-utils/ui/style';
import '@ku-utils/custom-columns/style';
import './styles/playground.css';

import { installDirectives } from '@ku-utils/directives';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import './i18n';
import router from './router';

if (typeof localStorage !== 'undefined') {
  localStorage.setItem('ku_utils_user_permissions', JSON.stringify(['pg:ok']));
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ElementPlus, { locale: zhCn });
installDirectives(app);
app.mount('#app');
