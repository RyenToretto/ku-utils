<template>
  <DomainModuleShell
    :menus="menus"
    module-root-path="/example"
  />
</template>

<script setup lang="ts">
import { Collection, Filter, Grid, Menu, Share } from '@element-plus/icons-vue';
import { markRaw, ref } from 'vue';

import DomainModuleShell from '@/layouts/DomainModuleShell.vue';
import type { SideMenuNode } from '@/layouts/sideMenu/SideMenuItem.vue';

const menus = ref<SideMenuNode[]>([
  {
    path: '/example/simple',
    title: '示例管理',
    icon: markRaw(Collection),
    children: [
      '/example/simple/list',
      '/example/simple/batch-select',
      '/example/school/list',
      '/example/clazz/list',
      '/example/club/list',
    ],
  },
  {
    path: '/example/ui-kit',
    title: '基础组件',
    icon: markRaw(Grid),
    children: [
      '/example/ui-kit/panel',
      '/example/ui-kit/cells',
      '/example/ui-kit/max-height',
      '/example/ui-kit/name-pattern',
      '/example/ui-kit/selector',
      '/example/ui-kit/words-tag',
      '/example/ui-kit/preview-video',
      '/example/ui-kit/schedule-week',
    ],
  },
  {
    path: '/example/do-filter-panel',
    title: '筛选面板',
    icon: markRaw(Filter),
    children: [
      '/example/do-filter-panel/buttons-1',
      '/example/do-filter-panel/buttons-2',
      '/example/do-filter-panel/buttons-3',
      '/example/do-filter-panel/buttons-4',
      '/example/do-filter-panel/rows-1',
      '/example/do-filter-panel/rows-2',
      '/example/do-filter-panel/rows-3',
      '/example/do-filter-panel/rows-50',
      '/example/do-filter-panel/layout-fold',
    ],
  },
  {
    path: '/example/custom-columns',
    title: '自定义列',
    icon: markRaw(Menu),
    children: [
      '/example/custom-columns/basic',
      '/example/custom-columns/el-attrs',
      '/example/custom-columns/slots',
      '/example/custom-columns/nested',
      '/example/custom-columns/version',
      '/example/custom-columns/slot-components',
      '/example/custom-columns/header-slots',
      '/example/custom-columns/fixed-cols',
    ],
  },
  {
    path: '/example/nest-menus',
    title: '多级导航示例',
    icon: markRaw(Share),
    children: [
      {
        path: '/example/nest-menus/a',
        title: '二级 · 业务 A',
        children: [
          {
            path: '/example/nest-menus/a1',
            title: '三级 · 场景 A1',
            children: ['/example/nest-menus/a1/page-alpha', '/example/nest-menus/a1/page-beta'],
          },
          {
            path: '/example/nest-menus/a2',
            title: '三级 · 场景 A2',
            children: ['/example/nest-menus/a2/page-gamma'],
          },
        ],
      },
      {
        path: '/example/nest-menus/b',
        title: '二级 · 业务 B',
        children: [
          {
            path: '/example/nest-menus/b1',
            title: '三级 · 场景 B1',
            children: ['/example/nest-menus/b1/page-delta'],
          },
        ],
      },
    ],
  },
]);
</script>
