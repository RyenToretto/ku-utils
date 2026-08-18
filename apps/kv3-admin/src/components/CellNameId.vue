<template>
  <div
    class="cell-name-id"
    :class="{ 'is-clickable': wholeCellClickable }"
    role="presentation"
    @click="onCellClick"
  >
    <div
      class="name"
      :class="{ 'is-clickable': nameLineClickable }"
      @click="onNameClick"
    >
      {{ displayName }}
    </div>
    <div
      v-if="hasId"
      class="id"
      :class="{ 'is-clickable': idLineClickable }"
      @click="onIdClick"
    >
      ID: {{ idText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name?: string | number | null;
    id?: string | number | null;
    placeholder?: string;
    /** 整格可点（名称与 ID 同行跳转）；由页面 @click 处理 */
    clickable?: boolean;
    /** 仅名称行可点；与 idClickable 优先于 clickable */
    nameClickable?: boolean;
    /** 仅 ID 行可点；与 nameClickable 优先于 clickable */
    idClickable?: boolean;
  }>(),
  {
    name: null,
    id: null,
    placeholder: '—',
    clickable: false,
    nameClickable: false,
    idClickable: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
  'name-click': [event: MouseEvent];
  'id-click': [event: MouseEvent];
}>();

const useSplitClick = computed(() => props.nameClickable || props.idClickable);

const wholeCellClickable = computed(() => !useSplitClick.value && props.clickable);

const nameLineClickable = computed(() => useSplitClick.value && props.nameClickable);

const idLineClickable = computed(() => useSplitClick.value && props.idClickable);

const displayName = computed(() => {
  const raw = props.name;
  if (raw == null || String(raw).trim() === '') return props.placeholder;
  return String(raw);
});

const hasId = computed(() => props.id != null && String(props.id).trim() !== '');

const idText = computed(() => (hasId.value ? String(props.id) : ''));

function onCellClick(event: MouseEvent) {
  if (!wholeCellClickable.value) return;
  emit('click', event);
}

function onNameClick(event: MouseEvent) {
  if (!nameLineClickable.value) return;
  event.stopPropagation();
  emit('name-click', event);
}

function onIdClick(event: MouseEvent) {
  if (!idLineClickable.value) return;
  event.stopPropagation();
  emit('id-click', event);
}
</script>

<style lang="scss" scoped>
.cell-name-id {
  min-width: 0;
  max-width: 100%;

  .name,
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

  .id {
    font-size: 12px;
    line-height: 16px;
    color: var(--ku-text-secondary);
  }

  &.is-clickable {
    cursor: pointer;

    .name {
      color: var(--el-color-primary);
    }

    .id {
      color: var(--el-color-primary-light-3);
    }

    &:hover {
      .name,
      .id {
        color: var(--el-color-primary);
        text-decoration: underline;
      }
    }
  }

  .name.is-clickable,
  .id.is-clickable {
    cursor: pointer;
    color: var(--el-color-primary);

    &:hover {
      color: var(--el-color-primary);
      text-decoration: underline;
    }
  }

  .id.is-clickable {
    color: var(--el-color-primary-light-3);

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
