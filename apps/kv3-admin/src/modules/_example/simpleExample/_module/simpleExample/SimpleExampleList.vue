<template>
  <div class="page-simple-example-list">
    <PageHeader />

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
      </el-form>
      <template #ctl>
        <el-button
          :disabled="tableLoading"
          @click="handleReset"
        >
          重置
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
import { ref } from 'vue';

import DialogEditSimpleExample from './DialogEditSimpleExample.vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  requestBatchSimpleExample,
  requestDeleteSimpleExample,
  requestSimpleExampleList,
} from '@/modules/_example/simpleExample/_api';

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
  resetListFilters();
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
}
</style>
