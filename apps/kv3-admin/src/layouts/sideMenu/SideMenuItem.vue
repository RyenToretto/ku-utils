<template>
  <el-sub-menu
    v-if="hasChildren"
    :index="item.path"
  >
    <template #title>
      <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
      <span>{{ item.title }}</span>
    </template>
    <template
      v-for="(child, idx) in childPaths"
      :key="menuChildKey(child, idx)"
    >
      <SideMenuItem
        v-if="isBranchNode(child)"
        :item="child"
      />
      <el-menu-item
        v-else
        :index="leafPath(child)"
        :data-path="leafPath(child)"
      >
        {{ leafTitle(child) }}
      </el-menu-item>
    </template>
  </el-sub-menu>
  <el-menu-item
    v-else
    :index="item.path"
    :data-path="item.path"
  >
    <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
    <span>{{ item.title }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useRouter } from 'vue-router';

export type SideMenuNode = {
  path: string;
  title: string;
  icon?: Component;
  children?: Array<string | SideMenuNode>;
};

defineOptions({ name: 'SideMenuItem' });

const props = defineProps<{
  item: SideMenuNode;
}>();

const router = useRouter();

const hasChildren = computed(() => !!(props.item.children && props.item.children.length));
const childPaths = computed(() => props.item.children || []);

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

function menuChildKey(child: string | SideMenuNode, idx: number): string {
  return `${leafPath(child)}-${idx}`;
}
</script>
