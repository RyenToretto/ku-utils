<template>
  <div
    class="page-simple-example-list"
    :class="{ 'fill-viewport': fillViewportLayout }"
  >
    <PageHeader
      :subtitle="pageDescription"
      :breadcrumbs="pageTitle ? [{ label: pageTitle }] : undefined"
    />

    <DoFilterPanel
      :line="resolvedFilterLine"
      :loading="tableLoading"
      @search="search(true)"
    >
      <el-form
        class="with-btn"
        inline
        :label-width="isFilterPanelDemo ? 'auto' : '80px'"
        @submit.prevent
      >
        <template v-if="isFilterPanelDemo">
          <el-form-item
            v-for="field in demoFields"
            :key="field.key"
            :label="`筛选项 ${field.key.slice(1)}`"
          >
            <el-input
              v-if="field.kind === 'input'"
              v-model="demoFilters[field.key]"
              clearable
              placeholder="不限"
              @keyup.enter="search(true)"
            />
            <el-select
              v-else-if="field.kind === 'select'"
              v-model="demoFilters[field.key]"
              clearable
              placeholder="不限"
            >
              <el-option
                label="不限"
                value=""
              />
              <el-option
                label="启用"
                value="1"
              />
              <el-option
                label="停用"
                value="0"
              />
            </el-select>
            <el-radio-group
              v-else
              v-model="demoFilters[field.key]"
              size="small"
              @change="search(true)"
            >
              <el-radio-button value="">不限</el-radio-button>
              <el-radio-button value="1">启用</el-radio-button>
              <el-radio-button value="0">停用</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="示例名称">
            <el-input
              v-model="listFilters.exampleName"
              clearable
              placeholder="不限"
              @keyup.enter="search(true)"
            />
          </el-form-item>

          <el-form-item label="任务类型">
            <el-radio-group
              v-model="listFilters.taskAction"
              size="small"
              @change="search(true)"
            >
              <el-radio-button value="">不限</el-radio-button>
              <el-radio-button
                v-for="eachType in $MAPS.example.simpleExample.exampleTaskAction.options"
                :key="eachType.value"
                :value="eachType.value"
              >
                {{ eachType.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            label="状态"
            label-width="52px"
          >
            <el-radio-group
              v-model="listFilters.status"
              size="small"
              @change="search(true)"
            >
              <el-radio-button value="">不限</el-radio-button>
              <el-radio-button
                v-for="eachType in $MAPS.example.simpleExample.exampleStatus.options"
                :key="eachType.value"
                :value="eachType.value"
              >
                {{ eachType.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </template>
      </el-form>
      <template
        v-if="resolvedButtonCount >= 2"
        #ctl
      >
        <el-button
          :disabled="tableLoading"
          @click="handleReset"
        >
          重置
        </el-button>
        <el-button
          v-if="resolvedButtonCount >= 3"
          plain
          :disabled="tableLoading"
          @click="onDemoExtra('export')"
        >
          导出
        </el-button>
        <el-button
          v-if="resolvedButtonCount >= 4"
          plain
          :disabled="tableLoading"
          @click="onDemoExtra('more')"
        >
          更多
        </el-button>
      </template>
    </DoFilterPanel>

    <TableWrap>
      <el-table
        v-loading="tableLoading"
        class="do-inner-scroller page-table hide-table-border"
        :data="tableData"
        :max-height="maxHeight"
        border
        stripe
      >
        <el-table-column
          label="示例名称"
          prop="exampleName"
          min-width="160"
          class-name="name-slot-cell"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <CellNameId
              :id="row.id"
              :name="row.exampleName"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="产品包名"
          prop="pkg"
          min-width="160"
        />
        <el-table-column
          label="任务类型"
          prop="taskAction"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ $MAPS.example.simpleExample.exampleTaskAction.getLabel(row.taskAction) }}
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
              :model-value="(row as ExampleRow).status"
              :active-value="1"
              :inactive-value="0"
              :active-label="$MAPS.example.simpleExample.exampleStatus.getLabel(1)"
              :inactive-label="$MAPS.example.simpleExample.exampleStatus.getLabel(0)"
              switchable
              :switching="isStatusSwitching((row as ExampleRow).id)"
              active-tips="确认启用该示例？"
              inactive-tips="确认停用该示例？"
              @switch="(next) => switchExampleStatus(row as ExampleRow, next)"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          prop="createTime"
          min-width="160"
        >
          <template #default="{ row }">
            <CellDateTime :value="(row as ExampleRow).createTime" />
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
              @click="openCreate"
            >
              新建示例
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
                @click="openEdit(row as ExampleRow)"
              />
              <el-button
                type="danger"
                plain
                size="small"
                :icon="Delete"
                title="删除"
                aria-label="删除"
                @click="removeRow(row as ExampleRow)"
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
          :page-sizes="[10, 20, 50]"
          @update:page-num="handlePageNumChange"
          @update:page-size="handlePageSizeChange"
        />
      </template>
    </TableWrap>

    <DialogEditSimpleExample
      ref="dialogEditRef"
      @success="search(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { Delete, EditPen } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { computed, reactive, ref, toRefs, watch } from 'vue';

import DialogEditSimpleExample from './DialogEditSimpleExample.vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  buildDoFilterPanelDemoFields,
  createDoFilterPanelDemoFilters,
} from '@/modules/_example/doFilterPanel/_utils/doFilterPanelDemo';
import {
  requestBatchSimpleExample,
  requestDeleteSimpleExample,
  requestSimpleExampleList,
} from '@/modules/_example/simpleExample/_api';

defineOptions({ name: 'SimpleExampleList' });

const props = withDefaults(
  defineProps<{
    /** 覆盖 PageHeader 标题（DoFilterPanel Demo 传入场景名） */
    pageTitle?: string;
    pageDescription?: string;
    /** 主搜索 + #ctl 附加按钮数；1=仅搜索 */
    filterButtonCount?: 1 | 2 | 3 | 4;
    /**
     * 筛选项个数。传入后进入 DoFilterPanel Demo 形态（生成演示字段）；
     * 不传则保持列表示例管理内置 3 项业务筛选。
     */
    filterFieldCount?: number;
    /** 折叠可见行数；Demo 未传时默认 1 */
    filterLine?: number;
    /**
     * 素材管理同形：页根 height:100% + 列 flex + 区内滚动。
     * 用于复现/验收「展开筛选压扁 table-wrap」。
     */
    fillViewportLayout?: boolean;
  }>(),
  {
    pageTitle: undefined,
    pageDescription: '',
    filterButtonCount: undefined,
    filterFieldCount: undefined,
    filterLine: undefined,
    fillViewportLayout: false,
  },
);

const { pageTitle, pageDescription, fillViewportLayout } = toRefs(props);

type ExampleRow = {
  id: number;
  exampleName: string;
  pkg: string;
  status: number;
  taskAction: string;
  createTime: string;
  [key: string]: unknown;
};

const maxHeight = useAdminTableMaxHeight('.page-simple-example-list', 400);
const dialogEditRef = ref<InstanceType<typeof DialogEditSimpleExample>>();
const statusSwitchingIds = ref<Record<string, boolean>>({});

const isFilterPanelDemo = computed(
  () => props.filterFieldCount != null && props.filterFieldCount > 0,
);
const resolvedButtonCount = computed(() => props.filterButtonCount ?? 2);
const resolvedFilterLine = computed(() => props.filterLine ?? 1);

const demoFields = computed(() =>
  isFilterPanelDemo.value ? buildDoFilterPanelDemoFields(props.filterFieldCount!) : [],
);
const demoFilters = reactive<Record<string, string>>({});

watch(
  () => props.filterFieldCount,
  (count) => {
    Object.keys(demoFilters).forEach((key) => {
      delete demoFilters[key];
    });
    if (count != null && count > 0) {
      Object.assign(demoFilters, createDoFilterPanelDemoFilters(count));
    }
  },
  { immediate: true },
);

const {
  listFilters,
  tableData,
  tableTotal,
  tableLoading,
  search,
  handlePageNumChange,
  handlePageSizeChange,
  resetListFilters,
} = useAdminTable<
  ExampleRow,
  { exampleName: string; taskAction: string | number; status: string | number }
>({
  defaultFilters: {
    exampleName: '',
    taskAction: '',
    status: '',
  },
  defaultPageSize: 10,
  fetcher: (query) =>
    requestSimpleExampleList(query) as Promise<{ data: { lists: ExampleRow[]; total: number } }>,
});

function handleReset() {
  if (isFilterPanelDemo.value) {
    const blank = createDoFilterPanelDemoFilters(props.filterFieldCount!);
    Object.keys(demoFilters).forEach((key) => {
      demoFilters[key] = blank[key] ?? '';
    });
    search(true);
    return;
  }
  resetListFilters();
}

function onDemoExtra(kind: 'export' | 'more') {
  const label = kind === 'export' ? '导出' : '更多';
  ElMessage.success(`已触发「${label}」（Demo）`);
}

function openCreate() {
  dialogEditRef.value?.open();
}

function openEdit(row: ExampleRow) {
  dialogEditRef.value?.open(row);
}

async function removeRow(row: ExampleRow) {
  await ElMessageBox.confirm(`确认删除「${row.exampleName}」？`, '提示', { type: 'warning' });
  await requestDeleteSimpleExample({ id: row.id });
  ElMessage.success('删除成功');
  search(false);
}

function isStatusSwitching(id: string | number) {
  return !!statusSwitchingIds.value[String(id)];
}

async function switchExampleStatus(row: ExampleRow, nextStatus: string | number | boolean) {
  const key = String(row.id);
  statusSwitchingIds.value = { ...statusSwitchingIds.value, [key]: true };
  try {
    await requestBatchSimpleExample([row.id], Number(nextStatus));
    row.status = Number(nextStatus);
    ElMessage.success(Number(nextStatus) === 1 ? '已启用' : '已停用');
  } finally {
    const nextMap = { ...statusSwitchingIds.value };
    delete nextMap[key];
    statusSwitchingIds.value = nextMap;
  }
}
</script>

<style lang="scss" scoped>
.page-simple-example-list {
  box-sizing: border-box;

  /* 对齐素材管理：定高列 flex + 区内滚动；展开筛选项时依赖 TableWrap flex-shrink:0 防压扁 */
  &.fill-viewport {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow-y: auto;

    :deep(.page-header),
    :deep(.do-filter-panel) {
      flex-shrink: 0;
    }

    :deep(.table-wrap) {
      flex-shrink: 0;
    }
  }
}
</style>
