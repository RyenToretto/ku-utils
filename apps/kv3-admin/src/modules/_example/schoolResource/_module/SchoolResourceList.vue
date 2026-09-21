<template>
  <div
    class="page-school-resource"
    :class="{ 'in-dialog': inDialog }"
  >
    <PageHeader v-if="!enableSelector" />

    <DoFilterPanel
      :line="1"
      :loading="tableLoading"
      @search="search(true)"
    >
      <el-form
        class="with-btn"
        inline
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="学校名称">
          <el-input
            v-model="listFilters.schoolName"
            clearable
            placeholder="不限"
            @keyup.enter="search(true)"
          />
        </el-form-item>

        <el-form-item
          label="状态"
          label-width="52px"
        >
          <el-radio-group
            v-model="listFilters.status"
            size="small"
            :disabled="statusFilterLocked"
            @change="search(true)"
          >
            <el-radio-button value="">不限</el-radio-button>
            <el-radio-button
              v-for="eachStatus in $MAPS.example.schoolResource.schoolStatus.options"
              :key="eachStatus.value"
              :value="eachStatus.value"
            >
              {{ eachStatus.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template
        v-if="!statusFilterLocked"
        #ctl
      >
        <el-button
          :disabled="tableLoading"
          @click="handleReset"
        >
          重置
        </el-button>
      </template>
    </DoFilterPanel>

    <TableWrap
      :class="{ 'drawer-pick-table-wrap': inDialog }"
      :enable-do-header="!enableSelector"
    >
      <template
        v-if="!enableSelector"
        #batch
      >
        <div class="batch-control">
          <span>批量操作：</span>
          <el-button
            class="ml-5"
            type="success"
            size="small"
            plain
            :disabled="!selectRows.length"
            :loading="batchEnableLoading"
            @click="toBatchSwitch(SCHOOL_STATUS_ENABLED)"
          >
            批量启用
          </el-button>
          <el-button
            class="ml-5"
            type="warning"
            size="small"
            plain
            :disabled="!selectRows.length"
            :loading="batchDisableLoading"
            @click="toBatchSwitch(SCHOOL_STATUS_DISABLED)"
          >
            批量停用
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        class="do-inner-scroller page-table hide-table-border"
        :class="{ 'school-resource-pick-table': inDialog }"
        :data="tableData"
        :max-height="tableMaxHeight"
        :highlight-current-row="enableSelector && !isMultiple"
        border
        stripe
        @row-click="onRowClick"
      >
        <el-table-column
          fixed="left"
          width="55"
          align="center"
        >
          <template #header>
            <div
              v-if="isMultiple"
              class="do-select-cell batch-select-box"
              :class="[statusOfSelect, { active: statusOfSelect !== 'none-selected' }]"
              @click.stop="toggleBatchSelect"
            >
              <el-icon v-if="statusOfSelect === 'all-selected'"><Check /></el-icon>
              <el-icon v-if="statusOfSelect === 'half-selected'"><Minus /></el-icon>
            </div>
          </template>
          <template #default="{ row }">
            <div
              class="do-select-cell"
              :class="{
                active: isRowSelected(row as SchoolResourceRow),
                single: !isMultiple,
                transparent: isRowTransparent(row as SchoolResourceRow),
              }"
              @click.stop="chooseRow(row as SchoolResourceRow)"
            >
              <el-icon><Check /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="学校名称"
          prop="schoolName"
          min-width="160"
          class-name="name-slot-cell"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <CellNameId
              :id="row.id"
              :name="row.schoolName"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          prop="status"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <CellState
              :model-value="row.status"
              :active-value="SCHOOL_STATUS_ENABLED"
              :inactive-value="SCHOOL_STATUS_DISABLED"
              :active-label="
                $MAPS.example.schoolResource.schoolStatus.getLabel(SCHOOL_STATUS_ENABLED)
              "
              :inactive-label="
                $MAPS.example.schoolResource.schoolStatus.getLabel(SCHOOL_STATUS_DISABLED)
              "
              switchable
              :switching="isStatusSwitching(row.id)"
              active-tips="确认启用该学校？"
              inactive-tips="确认停用该学校？"
              @switch="(next) => switchSchoolStatus(row as SchoolResourceRow, next)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          prop="remark"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          label="创建时间"
          prop="createTime"
          min-width="160"
        >
          <template #default="{ row }">
            <CellDateTime :value="row.createTime" />
          </template>
        </el-table-column>

        <el-table-column
          width="140"
          fixed="right"
          class-name="ops-column"
        >
          <template #header>
            <el-button
              type="primary"
              size="small"
              @click.stop="openCreate"
            >
              新建学校
            </el-button>
          </template>
          <template #default="{ row }">
            <div class="line-actions">
              <el-button
                type="primary"
                plain
                size="small"
                :icon="EditPen"
                title="编辑"
                aria-label="编辑"
                @click.stop="openEdit(row as SchoolResourceRow)"
              />
              <el-button
                type="danger"
                plain
                size="small"
                :icon="Delete"
                title="删除"
                aria-label="删除"
                @click.stop="removeRow(row as SchoolResourceRow)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #ft>
        <BasePagination
          :page-num="listFilters.pageNum"
          :page-size="listFilters.pageSize"
          :total="tableTotal"
          :page-sizes="pageSizeOptions"
          @update:page-num="handlePageNumChange"
          @update:page-size="handlePageSizeChange"
        />
      </template>
    </TableWrap>

    <DialogEditSchoolResource
      ref="dialogEditRef"
      @success="search(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { Check, Delete, EditPen, Minus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, ref, toRef, watch } from 'vue';

import DialogEditSchoolResource from './DialogEditSchoolResource.vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useDrawerPickListMaxHeight } from '@/composables/useDrawerPickListMaxHeight';
import { useRowSelector } from '@/composables/useRowSelector';
import {
  requestBatchSwitchSchoolResource,
  requestDeleteSchoolResource,
  requestSchoolResourceList,
  type SchoolResourceRow,
} from '@/modules/_example/schoolResource/_api';
import {
  SCHOOL_STATUS_DISABLED,
  SCHOOL_STATUS_ENABLED,
} from '@/modules/_example/schoolResource/_map/schoolStatus';

const props = withDefaults(
  defineProps<{
    enableSelector?: boolean;
    isMultiple?: boolean;
    inDialog?: boolean;
    enableCache?: boolean;
    lineKey?: string;
    checkedIds?: Array<string | number>;
    lockEnabledStatus?: boolean;
    /** 选择器内默认分页大小（多选跨页演示建议 5） */
    defaultPageSize?: number;
  }>(),
  {
    enableSelector: false,
    isMultiple: true,
    inDialog: false,
    enableCache: false,
    lineKey: 'id',
    checkedIds: () => [],
    lockEnabledStatus: false,
    defaultPageSize: 10,
  },
);

const emit = defineEmits<{
  change: [value: SchoolResourceRow | SchoolResourceRow[] | undefined];
  'refresh-start': [];
  loaded: [];
}>();

const pageMaxHeight = useAdminTableMaxHeight('.page-school-resource', 400);
const { maxHeight: drawerTableMaxHeight } = useDrawerPickListMaxHeight(
  'school-resource-pick-table',
);
const tableMaxHeight = computed(() =>
  props.inDialog ? drawerTableMaxHeight.value : pageMaxHeight.value,
);

const dialogEditRef = ref<InstanceType<typeof DialogEditSchoolResource>>();
const batchEnableLoading = ref(false);
const batchDisableLoading = ref(false);
const statusSwitchingIds = ref<Record<string, boolean>>({});

const statusFilterLocked = computed(() => props.enableSelector && props.lockEnabledStatus);
const pageSizeOptions = computed(() =>
  props.inDialog && props.defaultPageSize === 5 ? [5, 10, 20] : [10, 20, 50],
);

const selectionApi = {
  syncPageFromCache: () => {},
};

const {
  listFilters,
  tableData,
  tableTotal,
  tableLoading,
  search,
  handlePageNumChange,
  handlePageSizeChange,
  resetListFilters,
} = useAdminTable<SchoolResourceRow, { schoolName: string; status: string | number }>({
  defaultFilters: {
    schoolName: '',
    status: statusFilterLocked.value ? SCHOOL_STATUS_ENABLED : '',
  },
  defaultPageSize: props.defaultPageSize,
  fetcher: (query) =>
    requestSchoolResourceList(query) as Promise<{
      data: { lists: SchoolResourceRow[]; total: number };
    }>,
  transformQuery(query) {
    if (statusFilterLocked.value) {
      query.status = SCHOOL_STATUS_ENABLED;
    }
    return query;
  },
  onBeforeSearch() {
    if (props.enableSelector) emit('refresh-start');
  },
  onAfterSearch() {
    if (props.enableCache) selectionApi.syncPageFromCache();
    if (props.enableSelector) emit('loaded');
  },
});

const enableSelectorRef = toRef(props, 'enableSelector');
const isMultipleRef = toRef(props, 'isMultiple');
const enableCacheRef = toRef(props, 'enableCache');
const checkedIdsRef = toRef(props, 'checkedIds');

const {
  selectRows,
  statusOfSelect,
  isRowSelected,
  isRowTransparent,
  chooseRow,
  toggleBatchSelect,
  setChecked,
  clearSelection,
  syncPageFromCache,
} = useRowSelector<SchoolResourceRow>({
  tableData,
  lineKey: props.lineKey as 'id',
  isMultiple: isMultipleRef,
  enableCache: enableCacheRef,
  enableSelector: enableSelectorRef,
  checkedIds: checkedIdsRef,
  onChange: (value) => emit('change', value),
});

selectionApi.syncPageFromCache = syncPageFromCache;

function handleReset() {
  resetListFilters({
    schoolName: '',
    status: statusFilterLocked.value ? SCHOOL_STATUS_ENABLED : '',
  });
}

function onRowClick(row: SchoolResourceRow) {
  if (!props.enableSelector) return;
  chooseRow(row);
}

function openCreate() {
  dialogEditRef.value?.open();
}

function openEdit(row: SchoolResourceRow) {
  dialogEditRef.value?.open(row);
}

async function removeRow(row: SchoolResourceRow) {
  await ElMessageBox.confirm(`确认删除「${row.schoolName}」？`, '提示', { type: 'warning' });
  await requestDeleteSchoolResource({ id: row.id });
  ElMessage.success('删除成功');
  search(false);
}

async function toBatchSwitch(status: number) {
  const ids = selectRows.value.map((row) => row.id);
  if (!ids.length) return;
  const actionLabel = status === SCHOOL_STATUS_ENABLED ? '启用' : '停用';
  await ElMessageBox.confirm(`确定${actionLabel}所选的 ${ids.length} 所学校？`, '提示', {
    type: 'warning',
  });
  const loadingRef = status === SCHOOL_STATUS_ENABLED ? batchEnableLoading : batchDisableLoading;
  loadingRef.value = true;
  try {
    await requestBatchSwitchSchoolResource(ids, status);
    ElMessage.success(`${actionLabel}成功`);
    clearSelection();
    search(false);
  } finally {
    loadingRef.value = false;
  }
}

function isStatusSwitching(id: string | number) {
  return !!statusSwitchingIds.value[String(id)];
}

async function switchSchoolStatus(row: SchoolResourceRow, nextStatus: string | number | boolean) {
  const key = String(row.id);
  statusSwitchingIds.value = { ...statusSwitchingIds.value, [key]: true };
  try {
    await requestBatchSwitchSchoolResource([row.id], Number(nextStatus));
    row.status = Number(nextStatus);
    ElMessage.success(nextStatus === SCHOOL_STATUS_ENABLED ? '已启用' : '已停用');
  } finally {
    const nextMap = { ...statusSwitchingIds.value };
    delete nextMap[key];
    statusSwitchingIds.value = nextMap;
  }
}

watch(
  () => props.lockEnabledStatus,
  (locked) => {
    if (props.enableSelector && locked) {
      listFilters.status = SCHOOL_STATUS_ENABLED;
    }
  },
  { immediate: true },
);

defineExpose({ setChecked, clearSelection, search });
</script>

<style lang="scss" scoped>
.page-school-resource {
  box-sizing: border-box;

  &.in-dialog {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    overflow: hidden;
  }
}

.batch-control {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--ku-text-secondary, #909399);
}

.ml-5 {
  margin-left: 5px;
}
</style>
