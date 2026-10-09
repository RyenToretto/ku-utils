<template>
  <el-submenu
    v-if="hasChildren"
    :index="item.path"
  >
    <template #title>
      <i
        v-if="item.icon"
        class="side-menu-icon"
      >
        <component :is="item.icon" />
      </i>
      <span>{{ item.title }}</span>
    </template>
    <SideMenuItem
      v-for="child in branchChildren"
      :key="'b-' + child.path"
      :item="child"
    />
    <el-menu-item
      v-for="leaf in leafChildren"
      :key="'l-' + leaf.path"
      :index="leaf.path"
      :data-path="leaf.path"
    >
      {{ leaf.title }}
    </el-menu-item>
  </el-submenu>
  <el-menu-item
    v-else
    :index="item.path"
    :data-path="item.path"
  >
    <i
      v-if="item.icon"
      class="side-menu-icon"
    >
      <component :is="item.icon" />
    </i>
    <span>{{ item.title }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useRouter } from 'vue-router/composables';

export type SideMenuNode = {
  path: string;
  title: string;
  icon?: Component;
  children?: Array<string | SideMenuNode>;
};

type SideMenuLeaf = { path: string; title: string };

const props = defineProps<{
  item: SideMenuNode;
}>();

const router = useRouter();

const hasChildren = computed(() => !!(props.item.children && props.item.children.length));

function isBranchNode(child: string | SideMenuNode): child is SideMenuNode {
  return typeof child !== 'string' && !!(child.children && child.children.length);
}

function leafPath(child: string | SideMenuNode): string {
  return typeof child === 'string' ? child : child.path;
}

function leafTitle(child: string | SideMenuNode): string {
  if (typeof child !== 'string') return child.title;
  const matched = router.getRoutes().find((r) => r.path === child);
  return (matched?.meta?.title as string) || child;
}

const branchChildren = computed(() => (props.item.children || []).filter(isBranchNode));

const leafChildren = computed((): SideMenuLeaf[] =>
  (props.item.children || [])
    .filter((child) => !isBranchNode(child))
    .map((child) => ({
      path: leafPath(child),
      title: leafTitle(child),
    })),
);
</script>

<style lang="scss" scoped>
.side-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  font-size: 18px;
  font-style: normal;
  vertical-align: middle;

  > * {
    width: 1em;
    height: 1em;
  }
}
</style>
