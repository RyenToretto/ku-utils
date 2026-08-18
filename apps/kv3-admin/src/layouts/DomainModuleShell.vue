<template>
  <main class="domain-module-shell">
    <aside class="domain-module-aside">
      <div class="domain-module-aside-body">
        <SideMenu :data="menus" />
      </div>
    </aside>
    <div
      class="domain-module-main"
      :class="{ 'use-full-view': route.meta.useFullView }"
    >
      <RouterView />
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import SideMenu from '@/layouts/sideMenu/index.vue';
import type { SideMenuNode } from '@/layouts/sideMenu/SideMenuItem.vue';

const props = defineProps<{
  menus: SideMenuNode[];
  /** 顶栏 Tab 根 path，如 /asset；用于进入域根时跳到首个叶子 */
  moduleRootPath: string;
}>();

const route = useRoute();
const router = useRouter();

/** menus 为扁平叶子列表（顶栏已展示域名，侧栏不再套一级分组） */
function firstLeafPath(node: string | SideMenuNode | undefined): string | undefined {
  if (!node) return undefined;
  if (typeof node === 'string') return node;
  if (node.children?.length) return firstLeafPath(node.children[0]);
  return node.path;
}

function triggerMenu() {
  if (!route.meta.isHeaderTab) return;
  const leaf = firstLeafPath(props.menus[0]);
  if (leaf && route.path === props.moduleRootPath) {
    router.replace(leaf).catch(console.error);
  }
}

watch(
  () => route.fullPath,
  () => triggerMenu(),
);

onMounted(() => triggerMenu());
</script>

<style lang="scss" scoped>
.domain-module-shell {
  display: flex;
  height: 100%;
  overflow: hidden;
  background: var(--bg-sidebar);
}

.domain-module-aside {
  width: var(--layout-aside-width, 220px);
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
}

.domain-module-aside-body {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 0;
}

.domain-module-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 0 20px 20px;
  background: var(--bg-page-gradient);
  background-attachment: local;
}

.domain-module-main.use-full-view {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
</style>
