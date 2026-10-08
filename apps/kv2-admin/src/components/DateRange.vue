<template>
  <el-date-picker
    ref="refDateRange"
    class="date-range"
    v-bind="$attrs"
    :type="resolvedType"
    :size="resolvedSize"
    :picker-options="pickerOptions"
    :format="resolvedFormat"
    :value-format="resolvedValueFormat"
    :clearable="resolvedClearable"
    :align="resolvedAlign"
    :range-separator="rangeSeparator"
    :start-placeholder="startPlaceholder"
    :end-placeholder="endPlaceholder"
  />
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';

/**
 * Element UI 日期范围：走 picker-options（非 EP 的 shortcuts / disabled-date 直传）。
 * 格式 token 为 EU 的 yyyy（非 dayjs 的 YYYY）。
 */
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
  () => props.format || (isDateTime.value ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'),
);
const resolvedValueFormat = computed(
  () => props.valueFormat || (isDateTime.value ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'),
);
const resolvedClearable = computed(() => {
  if (typeof attrs.clearable === 'boolean') return attrs.clearable;
  return props.clearable;
});
const resolvedSize = computed(() => {
  const size = attrs.size;
  if (size === 'default' || size == null || size === '') return undefined;
  return size as string;
});
/** EP 弹层默认 placement=bottom（居中），EU 默认 align=left */
const resolvedAlign = computed(() => (typeof attrs.align === 'string' ? attrs.align : 'center'));
const rangeSeparator = computed(() =>
  typeof attrs.rangeSeparator === 'string' ? attrs.rangeSeparator : '至',
);
const startPlaceholder = computed(() =>
  typeof attrs.startPlaceholder === 'string' ? attrs.startPlaceholder : '开始日期',
);
const endPlaceholder = computed(() =>
  typeof attrs.endPlaceholder === 'string' ? attrs.endPlaceholder : '结束日期',
);

type EuPicker = { $emit: (event: 'pick', value: Date[]) => void };

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function pickRange(picker: EuPicker, start: Date, end: Date) {
  picker.$emit('pick', [start, end]);
}

const defaultShortcuts = [
  {
    text: '今天',
    onClick(picker: EuPicker) {
      const d = today();
      pickRange(picker, d, d);
    },
  },
  {
    text: '昨天',
    onClick(picker: EuPicker) {
      const d = today();
      d.setDate(d.getDate() - 1);
      pickRange(picker, d, d);
    },
  },
  {
    text: '近7天',
    onClick(picker: EuPicker) {
      const end = today();
      const start = today();
      start.setDate(start.getDate() - 6);
      pickRange(picker, start, end);
    },
  },
  {
    text: '近30天',
    onClick(picker: EuPicker) {
      const end = today();
      const start = today();
      start.setDate(start.getDate() - 29);
      pickRange(picker, start, end);
    },
  },
  {
    text: '本周',
    onClick(picker: EuPicker) {
      const end = today();
      const start = today();
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      pickRange(picker, start, end);
    },
  },
  {
    text: '本月',
    onClick(picker: EuPicker) {
      const end = today();
      const start = today();
      start.setDate(1);
      pickRange(picker, start, end);
    },
  },
];

const disabledDate = (time: Date) => time.getTime() > Date.now();

const pickerOptions = computed(() => {
  const fromAttrs =
    attrs.pickerOptions && typeof attrs.pickerOptions === 'object'
      ? (attrs.pickerOptions as Record<string, unknown>)
      : {};
  return {
    firstDayOfWeek: 1,
    shortcuts: (fromAttrs.shortcuts as typeof defaultShortcuts) || defaultShortcuts,
    disabledDate:
      (fromAttrs.disabledDate as ((time: Date) => boolean) | undefined) ||
      (typeof attrs.disabledDate === 'function'
        ? (attrs.disabledDate as (time: Date) => boolean)
        : disabledDate),
    ...fromAttrs,
  };
});

const toggleMenu = () => {
  refDateRange.value?.focus();
};

defineExpose({ toggleMenu });
</script>
