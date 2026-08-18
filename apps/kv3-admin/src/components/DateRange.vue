<template>
  <el-date-picker
    ref="refDateRange"
    class="date-range"
    v-bind="$attrs"
    :type="resolvedType"
    :size="($attrs.size as any) || 'default'"
    :shortcuts="($attrs.shortcuts as any[]) || shortcuts"
    :disabled-date="($attrs.disabledDate as any) || disabledDate"
    :format="resolvedFormat"
    :value-format="resolvedValueFormat"
    :clearable="resolvedClearable"
    :range-separator="($attrs.rangeSeparator as string) || '至'"
    :start-placeholder="($attrs.startPlaceholder as string) || '开始日期'"
    :end-placeholder="($attrs.endPlaceholder as string) || '结束日期'"
  />
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** `daterange` 默认到日；列表创建时间等用 `datetimerange` */
    type?: 'daterange' | 'datetimerange';
    format?: string;
    valueFormat?: string;
    clearable?: boolean;
  }>(),
  {
    type: 'daterange',
    format: undefined,
    valueFormat: undefined,
    clearable: true,
  },
);

const attrs = useAttrs();
const refDateRange = ref<{ focus: () => void } | null>(null);

const resolvedType = computed(() => props.type || 'daterange');
const isDateTime = computed(() => resolvedType.value === 'datetimerange');
const resolvedFormat = computed(
  () => props.format || (isDateTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'),
);
const resolvedValueFormat = computed(
  () => props.valueFormat || (isDateTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'),
);
/** 筛选区默认可清空；仅接口要求必填时传 `:clearable="false"` */
const resolvedClearable = computed(() => {
  if (typeof attrs.clearable === 'boolean') return attrs.clearable;
  return props.clearable;
});

const toggleMenu = () => {
  refDateRange.value?.focus();
};

defineExpose({ toggleMenu });

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const shortcuts = [
  {
    text: '今天',
    value: () => {
      const d = today();
      return [d, d];
    },
  },
  {
    text: '昨天',
    value: () => {
      const d = today();
      d.setDate(d.getDate() - 1);
      return [d, d];
    },
  },
  {
    text: '近7天',
    value: () => {
      const end = today();
      const start = today();
      start.setDate(start.getDate() - 6);
      return [start, end];
    },
  },
  {
    text: '近30天',
    value: () => {
      const end = today();
      const start = today();
      start.setDate(start.getDate() - 29);
      return [start, end];
    },
  },
  {
    text: '本周',
    value: () => {
      const end = today();
      const start = today();
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      return [start, end];
    },
  },
  {
    text: '本月',
    value: () => {
      const end = today();
      const start = today();
      start.setDate(1);
      return [start, end];
    },
  },
];

const disabledDate = (time: Date) => time.getTime() > Date.now();
</script>
