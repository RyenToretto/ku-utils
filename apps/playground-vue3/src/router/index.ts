import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
  ],
});

export default router;
