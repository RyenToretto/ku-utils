<template>
  <main class="main-container">
    <aside class="base-aside">
      <div class="base-aside-body">
        <SideMenu :data="menus" />
      </div>
    </aside>
    <div
      class="main-container-inner"
      :class="{ 'use-full-view': route.meta.useFullView }"
    >
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import { Collection, Grid, Menu, Share } from '@element-plus/icons-vue';
import { markRaw, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SideMenu from '@/layouts/sideMenu/index.vue';
import type { SideMenuNode } from '@/layouts/sideMenu/SideMenuItem.vue';

const route = useRoute();
const router = useRouter();

const menus = ref<SideMenuNode[]>([
  {
    path: '/example/simple',
    title: '示例管理',
    icon: markRaw(Collection),
    children: [
      '/example/simple/list',
      '/example/school/list',
      '/example/clazz/list',
      '/example/club/list',
    ],
  },
  {
    path: '/example/ui-kit',
    title: '基础组件',
    icon: markRaw(Grid),
    children: ['/example/ui-kit/panel', '/example/ui-kit/cells'],
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

function firstLeafPath(node: string | SideMenuNode | undefined): string | undefined {
  if (!node) return undefined;
  if (typeof node === 'string') return node;
  if (node.children?.length) return firstLeafPath(node.children[0]);
  return node.path;
}

function triggerMenu() {
  if (route.meta.isHeaderTab) {
    const leaf = firstLeafPath(menus.value[0]);
    if (leaf && route.path === '/example') {
      router.replace(leaf).catch(console.error);
    }
  }
}

watch(
  () => route.fullPath,
  () => triggerMenu(),
);

onMounted(() => triggerMenu());
</script>

<style lang="scss" scoped>
.main-container {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--bg-sidebar);
}

.base-aside {
  width: var(--layout-aside-width, 220px);
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
}

.base-aside-body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 0;
}

.main-container-inner {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 0 20px 20px;
  background: var(--bg-page-gradient);
  background-attachment: local;
}

.use-full-view {
  padding: 0;
}
</style>
