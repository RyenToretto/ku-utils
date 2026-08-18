<template>
  <div class="cell-app">
    <div class="name">
      {{ displayName }}
    </div>
    <div class="pkg">
      {{ displayPkg }}
    </div>
    <div
      v-if="hasId"
      class="id"
    >
      ID: {{ idText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 应用名称 */
    name?: string | number | null;
    /** 应用包名 */
    pkg?: string | number | null;
    /** 应用 ID；无值时不渲染第三行 */
    id?: string | number | null;
    placeholder?: string;
  }>(),
  {
    name: null,
    pkg: null,
    id: null,
    placeholder: '—',
  },
);

function displayOrPlaceholder(raw: string | number | null | undefined) {
  if (raw == null || String(raw).trim() === '') return props.placeholder;
  return String(raw);
}

const displayName = computed(() => displayOrPlaceholder(props.name));

const displayPkg = computed(() => displayOrPlaceholder(props.pkg));

const hasId = computed(() => props.id != null && String(props.id).trim() !== '');

const idText = computed(() => (hasId.value ? String(props.id) : ''));
</script>

<style lang="scss" scoped>
.cell-app {
  min-width: 0;
  max-width: 100%;

  .name,
  .pkg,
  .id {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name {
    line-height: 16px;
    padding-bottom: 2px;
    color: var(--el-text-color-primary);
  }

  .pkg,
  .id {
    font-size: 12px;
    line-height: 16px;
    color: var(--text-secondary);
  }
}
</style>
