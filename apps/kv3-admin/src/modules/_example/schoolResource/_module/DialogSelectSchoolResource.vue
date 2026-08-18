<template>
  <div class="dialog-select-school-resource">
    <el-drawer
      v-model="dialogVisible"
      class="drawer-model-selector"
      size="960px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      destroy-on-close
      @closed="resetSchoolSelect"
    >
      <template #header>
        <span class="el-drawer__title">选择学校</span>
      </template>

      <section
        v-loading="rendering"
        class="do-drawer__view"
      >
        <SchoolResourceList
          v-if="visibleTable"
          ref="schoolListRef"
          :checked-ids="checkedIds"
          :is-multiple="isMultiple"
          :enable-selector="true"
          :in-dialog="true"
          :enable-cache="isMultiple"
          :lock-enabled-status="lockEnabledStatus"
          :default-page-size="defaultPageSize"
          @loaded="onListLoaded"
          @change="handleChosen"
        />
      </section>

      <template #footer>
        <div class="do-drawer__foot_btn">
          <span
            v-if="isMultiple"
            class="selected-count"
          >
            已选 {{ selectorModel.length }} 所
          </span>
          <el-button @click="cancelSchoolSelect">取 消</el-button>
          <el-button
            type="primary"
            @click="confirmSchoolSelect"
          >
            确 定
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

import SchoolResourceList from './SchoolResourceList.vue';

import type { SchoolResourceRow } from '@/modules/_example/schoolResource/_api';

const props = withDefaults(
  defineProps<{
    multiple?: boolean;
    valueKey?: string;
    lockEnabledStatus?: boolean;
    /** 多选时默认 5，便于跨页演示 */
    defaultPageSize?: number;
  }>(),
  {
    multiple: false,
    valueKey: 'id',
    lockEnabledStatus: true,
    defaultPageSize: undefined,
  },
);

const emit = defineEmits<{
  change: [value: SchoolResourceRow | SchoolResourceRow[] | undefined];
}>();

const dialogVisible = ref(false);
const selectorModel = ref<SchoolResourceRow[]>([]);
const rendering = ref(true);
const visibleTable = ref(false);
const schoolListRef = ref<InstanceType<typeof SchoolResourceList>>();

const isMultiple = computed(() => !!props.multiple);
const defaultPageSize = computed(() => {
  if (props.defaultPageSize != null) return props.defaultPageSize;
  return isMultiple.value ? 5 : 10;
});
const checkedIds = computed(() =>
  selectorModel.value.map(
    (row) => row[props.valueKey as keyof SchoolResourceRow] as string | number,
  ),
);

function normalizeEmit(
  origin: SchoolResourceRow | SchoolResourceRow[] | undefined,
): SchoolResourceRow | SchoolResourceRow[] | undefined {
  if (isMultiple.value) {
    if (Array.isArray(origin)) return origin;
    return origin ? [origin] : [];
  }
  if (Array.isArray(origin)) return origin[0];
  return origin || undefined;
}

function handleChosen(evt: SchoolResourceRow | SchoolResourceRow[] | undefined) {
  const nextList = Array.isArray(evt) ? [...evt] : evt ? [evt] : [];
  selectorModel.value = isMultiple.value ? nextList : nextList.slice(0, 1);
}

function onListLoaded() {
  nextTick(() => {
    // silent：只恢复列表勾选，不回写 change，避免翻页冲掉已选
    schoolListRef.value?.setChecked(checkedIds.value, selectorModel.value, true);
    rendering.value = false;
  });
}

function confirmSchoolSelect() {
  emit('change', normalizeEmit(selectorModel.value));
  dialogVisible.value = false;
}

function cancelSchoolSelect() {
  dialogVisible.value = false;
}

function resetSchoolSelect() {
  nextTick(() => {
    rendering.value = true;
    visibleTable.value = false;
    selectorModel.value = [];
  });
}

function show(ids: Array<string | number> = [], checkedRows: SchoolResourceRow[] = []) {
  rendering.value = true;
  if (checkedRows.length) {
    selectorModel.value = checkedRows.map((row) => ({ ...row }));
  } else if (ids.length) {
    selectorModel.value = ids.map(
      (id) => ({ [props.valueKey]: id }) as unknown as SchoolResourceRow,
    );
  } else {
    selectorModel.value = [];
  }
  dialogVisible.value = true;
  visibleTable.value = true;
}

defineExpose({ show });
</script>

<style lang="scss" scoped>
.dialog-select-school-resource {
  display: contents;
}

.do-drawer__foot_btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.selected-count {
  margin-right: auto;
  font-size: 13px;
  color: var(--text-secondary, #909399);
}
</style>
