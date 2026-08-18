import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/report-demo',
    name: 'ReportDemo',
    component: () => import('../views/ReportDemo.vue'),
  },
];

export default new VueRouter({
  mode: 'history',
  routes,
});
