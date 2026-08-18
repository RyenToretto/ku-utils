<template>
  <span
    v-if="variant === 'inline'"
    class="cell-datetime-inline"
  >
    {{ inlineText }}
  </span>
  <div
    v-else-if="layout === 'with-actor'"
    ref="actorRootRef"
    class="cell-datetime cell-datetime-with-actor"
    :class="{ 'is-align-left': actorAlign === 'left' }"
  >
    <div class="cell-datetime-with-actor-body">
      <div class="name">{{ hasValue ? compactLine : placeholder }}</div>
      <div class="id">{{ actorLine }}</div>
    </div>
  </div>
  <template v-else-if="hasValue">
    <div
      v-if="layout === 'compact'"
      class="name"
    >
      {{ compactLine }}
    </div>
    <div
      v-else-if="dateOnly"
      class="name"
    >
      {{ dateLine }}
    </div>
    <template v-else>
      <div class="name">{{ dateLine }}</div>
      <div class="id">{{ timeLine }}</div>
    </template>
  </template>
  <div
    v-else
    class="name"
  >
    {{ placeholder }}
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { formatDateTime, parseDateTimeParts, type DateTimeInput } from '@/utils/dateTime';

type CellAlign = 'left' | 'right' | 'center';

const props = withDefaults(
  defineProps<{
    value: DateTimeInput;
    /** 操作人 / 创建人等；配合 layout=with-actor */
    actor?: string | null;
    /**
     * with-actor 水平对齐；默认右。
     * 仅 `left` 居左；`right` / `center` / 未传且列非 left → 居右。
     * 未传时跟表格列 `align`（td.is-left / is-right / is-center）。
     */
    align?: CellAlign;
    placeholder?: string;
    layout?: 'stacked' | 'compact' | 'with-actor';
    dateOnly?: boolean;
    variant?: 'cell' | 'inline';
  }>(),
  {
    actor: undefined,
    align: undefined,
    placeholder: '—',
    layout: 'stacked',
    dateOnly: false,
    variant: 'cell',
  },
);

const actorRootRef = ref<HTMLElement | null>(null);
/** 从列 td class 推断；仅 left 为 left，其余为 right */
const columnActorAlign = ref<'left' | 'right'>('right');

const resolveAlignToken = (token: CellAlign | undefined): 'left' | 'right' =>
  token === 'left' ? 'left' : 'right';

const syncColumnAlign = () => {
  const td = actorRootRef.value?.closest('td');
  if (!td) {
    columnActorAlign.value = 'right';
    return;
  }
  // 仅显式左对齐列居左；center / right / 无 is-* 一律居右
  columnActorAlign.value = td.classList.contains('is-left') ? 'left' : 'right';
};

const actorAlign = computed(() => {
  if (props.align != null) return resolveAlignToken(props.align);
  return columnActorAlign.value;
});

onMounted(() => {
  void nextTick(() => syncColumnAlign());
});

watch(
  () => props.layout,
  (layout) => {
    if (layout === 'with-actor') void nextTick(() => syncColumnAlign());
  },
);

const parts = computed(() => parseDateTimeParts(props.value));

const hasValue = computed(() => parts.value != null);

const dateLine = computed(() => parts.value?.date ?? props.placeholder);
const timeLine = computed(() => parts.value?.time ?? '');
const compactLine = computed(() => parts.value?.compact ?? props.placeholder);

const actorLine = computed(() => {
  const text = props.actor == null ? '' : String(props.actor).trim();
  return text || props.placeholder;
});

const inlineText = computed(() => {
  if (props.value == null || props.value === '') return props.placeholder;
  const formatted = formatDateTime(props.value);
  return formatted === '-' ? props.placeholder : formatted;
});
</script>

<style lang="scss" scoped>
/* 外层撑满单元格控制左右；内层按时间宽度收缩，人名贴时间块右下 */
.cell-datetime-with-actor {
  display: block;
  width: 100%;
  text-align: right;

  &.is-align-left {
    text-align: left;
  }
}

.cell-datetime-with-actor-body {
  display: inline-block;
  max-width: 100%;
  vertical-align: top;
  text-align: left;

  .name,
  .id {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name {
    line-height: 16px;
    padding-bottom: 2px;
  }

  .id {
    font-size: 12px;
    line-height: 16px;
    color: var(--ku-text-secondary);
    text-align: right;
  }
}
</style>
