import '@ku-utils/skin';
import { install as installUI } from '@ku-utils/ui-vue2';
import '@ku-utils/ui-vue2/style';
import '@ku-utils/v2-custom-columns/style';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';

import App from './App.vue';
import router from './router';
import store from './store';
import './styles/playground.css';

Vue.use(ElementUI);
Vue.use(installUI);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
