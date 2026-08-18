<template>
  <div class="do-pagination">
    <el-pagination
      class="base-pagination"
      :aria-label="ariaLabel"
      v-bind="$attrs"
      :current-page="resolvedPageNum"
      :page-size="resolvedPageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="resolvedLayout"
      :background="background"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 全量列表仅展示「共 N 条」时用 total；默认 full 为完整分页 */
    mode?: 'full' | 'total';
    pageNum?: number;
    pageSize?: number;
    total: number;
    layout?: string;
    background?: boolean;
    pageSizes?: number[];
  }>(),
  {
    mode: 'full',
    pageNum: 1,
    pageSize: 20,
    layout: 'total, prev, pager, next, jumper, sizes',
    background: true,
    pageSizes: () => [10, 20, 30, 40, 50, 100, 500],
  },
);

const emit = defineEmits<{
  'update:pageNum': [val: number];
  'update:pageSize': [val: number];
}>();

const resolvedLayout = computed(() => (props.mode === 'total' ? 'total' : props.layout));
const resolvedPageNum = computed(() => props.pageNum ?? 1);
const resolvedPageSize = computed(() => props.pageSize ?? 20);
const ariaLabel = computed(() => (props.mode === 'total' ? '列表总数' : '分页导航'));

function handleCurrentChange(value: number) {
  if (props.mode === 'total') return;
  emit('update:pageNum', value);
}

function handleSizeChange(value: number) {
  if (props.mode === 'total') return;
  emit('update:pageSize', value);
}
</script>
