<template>
  <div class="page-clazz-manage">
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
        <el-form-item label="班级名称">
          <el-input
            v-model="listFilters.clazzName"
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
            @change="search(true)"
          >
            <el-radio-button value="">不限</el-radio-button>
            <el-radio-button
              v-for="eachStatus in $MAPS.example.clazzManage.clazzStatus.options"
              :key="eachStatus.value"
              :value="eachStatus.value"
            >
              {{ eachStatus.label }}
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
          label="班级名称"
          prop="clazzName"
          min-width="160"
          class-name="name-slot-cell"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <CellNameId
              :id="row.id"
              :name="row.clazzName"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="所属学校"
          prop="schoolName"
          min-width="160"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span>{{ row.schoolName || '—' }}</span>
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
              :active-value="CLAZZ_STATUS_ENABLED"
              :inactive-value="CLAZZ_STATUS_DISABLED"
              :active-label="$MAPS.example.clazzManage.clazzStatus.getLabel(CLAZZ_STATUS_ENABLED)"
              :inactive-label="
                $MAPS.example.clazzManage.clazzStatus.getLabel(CLAZZ_STATUS_DISABLED)
              "
            />
          </template>
        </el-table-column>
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
              @click="openCreate"
            >
              新建班级
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
                @click="openEdit(row as ClazzManageRow)"
              />
              <el-button
                type="danger"
                plain
                size="small"
                :icon="Delete"
                title="删除"
                aria-label="删除"
                @click="removeRow(row as ClazzManageRow)"
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

    <DialogEditClazzManage
      ref="dialogEditRef"
      @success="search(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { Delete, EditPen } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';

import DialogEditClazzManage from './DialogEditClazzManage.vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  requestClazzManageList,
  requestDeleteClazzManage,
  type ClazzManageRow,
} from '@/modules/_example/clazzManage/_api';
import {
  CLAZZ_STATUS_DISABLED,
  CLAZZ_STATUS_ENABLED,
} from '@/modules/_example/clazzManage/_map/clazzStatus';

const maxHeight = useAdminTableMaxHeight('.page-clazz-manage', 400);
const dialogEditRef = ref<InstanceType<typeof DialogEditClazzManage>>();

const {
  listFilters,
  tableData,
  tableTotal,
  tableLoading,
  search,
  handlePageNumChange,
  handlePageSizeChange,
  resetListFilters,
} = useAdminTable<ClazzManageRow, { clazzName: string; status: string | number }>({
  defaultFilters: {
    clazzName: '',
    status: '',
  },
  defaultPageSize: 10,
  fetcher: (query) =>
    requestClazzManageList(query) as Promise<{ data: { lists: ClazzManageRow[]; total: number } }>,
});

function handleReset() {
  resetListFilters();
}

function openCreate() {
  dialogEditRef.value?.open();
}

function openEdit(row: ClazzManageRow) {
  dialogEditRef.value?.open(row);
}

async function removeRow(row: ClazzManageRow) {
  await ElMessageBox.confirm(`确认删除「${row.clazzName}」？`, '提示', { type: 'warning' });
  await requestDeleteClazzManage({ id: row.id });
  ElMessage.success('删除成功');
  search(false);
}
</script>

<style lang="scss" scoped>
.page-clazz-manage {
  box-sizing: border-box;
}
</style>
