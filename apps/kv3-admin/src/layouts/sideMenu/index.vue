<template>
  <el-menu
    :default-active="activePath"
    class="side-menu"
    router
  >
    <SideMenuItem
      v-for="(item, index) in menuList"
      :key="index"
      :item="item"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import SideMenuItem, { type SideMenuNode } from './SideMenuItem.vue';

const props = defineProps<{
  data: SideMenuNode[];
}>();

const route = useRoute();

const menuList = computed(() => props.data || []);
const activePath = computed(() => (route.meta.activePath as string) || route.path);

defineExpose({
  useOversea(navList: SideMenuNode[]) {
    return navList;
  },
});
</script>

<style lang="scss" scoped>
.side-menu {
  border-right: none;
  background: transparent;
  width: 100%;
  padding: 4px 0;
}
</style>
