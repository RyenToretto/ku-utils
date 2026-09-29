<template>
  <div
    v-if="showShell"
    class="do-pagination"
  >
    <el-button
      v-if="enableRefresh"
      class="do-pagination-refresh"
      :icon="Refresh"
      :loading="refreshLoading"
      aria-label="刷新"
      title="刷新"
      @click="handleRefresh"
    />
    <el-pagination
      v-if="showPager"
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
import { Refresh } from '@element-plus/icons-vue';
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
    /** 最左侧刷新；默认关，由页面 `@refresh` 接业务重拉 */
    enableRefresh?: boolean;
    refreshLoading?: boolean;
  }>(),
  {
    mode: 'full',
    pageNum: 1,
    pageSize: 20,
    layout: 'total, prev, pager, next, jumper, sizes',
    background: true,
    pageSizes: () => [10, 20, 30, 40, 50, 100, 500],
    enableRefresh: false,
    refreshLoading: false,
  },
);

const emit = defineEmits<{
  'update:pageNum': [val: number];
  'update:pageSize': [val: number];
  'page-change': [page: number];
  'size-change': [size: number];
  refresh: [];
}>();

const resolvedLayout = computed(() => (props.mode === 'total' ? 'total' : props.layout));
const resolvedPageNum = computed(() => props.pageNum ?? 1);
const resolvedPageSize = computed(() => props.pageSize ?? 20);
const ariaLabel = computed(() => (props.mode === 'total' ? '列表总数' : '分页导航'));
const showShell = computed(() => props.total > 0 || props.mode === 'total' || props.enableRefresh);
const showPager = computed(() => props.total > 0 || props.mode === 'total');

function handleCurrentChange(value: number) {
  if (props.mode === 'total') return;
  emit('page-change', value);
  emit('update:pageNum', value);
}

function handleSizeChange(value: number) {
  if (props.mode === 'total') return;
  emit('size-change', value);
  emit('update:pageSize', value);
}

function handleRefresh() {
  emit('refresh');
}
</script>

<style lang="scss" scoped>
.do-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.do-pagination-refresh {
  flex-shrink: 0;
}
</style>
