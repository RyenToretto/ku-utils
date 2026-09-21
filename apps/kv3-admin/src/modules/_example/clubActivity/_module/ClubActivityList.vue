<template>
  <div class="page-club-activity">
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
        <el-form-item label="社团名称">
          <el-input
            v-model="listFilters.clubName"
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
              v-for="eachStatus in $MAPS.example.clubActivity.clubStatus.options"
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

    <TableWrap enable-do-header>
      <template #batch>
        <div class="batch-control">
          <div
            class="batch-select-control"
            :class="{ 'is-active': statusOfSelect !== 'none-selected' }"
            role="checkbox"
            :aria-checked="
              statusOfSelect === 'all-selected'
                ? 'true'
                : statusOfSelect === 'half-selected'
                  ? 'mixed'
                  : 'false'
            "
            tabindex="0"
            @click="toggleBatchSelect"
            @keydown.enter.prevent="toggleBatchSelect"
            @keydown.space.prevent="toggleBatchSelect"
          >
            <div
              class="do-select-cell batch-select-box"
              :class="[statusOfSelect, { active: statusOfSelect !== 'none-selected' }]"
            >
              <el-icon v-if="statusOfSelect === 'all-selected'"><Check /></el-icon>
              <el-icon v-if="statusOfSelect === 'half-selected'"><Minus /></el-icon>
            </div>
            <span class="batch-select-label">全选本页</span>
          </div>
          <span>批量操作：</span>
          <el-button
            type="success"
            size="small"
            plain
            :disabled="!selectRows.length"
            :loading="batchEnableLoading"
            @click="toBatchSwitch(CLUB_STATUS_ENABLED)"
          >
            批量启用
          </el-button>
          <el-button
            type="warning"
            size="small"
            plain
            :disabled="!selectRows.length"
            :loading="batchDisableLoading"
            @click="toBatchSwitch(CLUB_STATUS_DISABLED)"
          >
            批量停用
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        class="do-inner-scroller page-table hide-table-border"
        :data="tableData"
        :max-height="maxHeight"
        border
        stripe
      >
        <el-table-column
          fixed="left"
          width="55"
          align="center"
        >
          <template #default="{ row }">
            <div
              class="do-select-cell"
              :class="{ active: isRowSelected(row as ClubActivityRow) }"
              @click.stop="chooseRow(row as ClubActivityRow)"
            >
              <el-icon><Check /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="社团名称"
          prop="clubName"
          min-width="140"
          class-name="name-slot-cell"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <CellNameId
              :id="row.id"
              :name="row.clubName"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="参与学校"
          min-width="220"
        >
          <template #default="{ row }">
            <template v-if="row.schools?.length">
              <el-tag
                v-for="school in row.schools"
                :key="school.id"
                class="school-chip"
                size="small"
                type="info"
              >
                {{ school.schoolName }}
              </el-tag>
            </template>
            <span v-else>—</span>
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
              :active-value="CLUB_STATUS_ENABLED"
              :inactive-value="CLUB_STATUS_DISABLED"
              :active-label="$MAPS.example.clubActivity.clubStatus.getLabel(CLUB_STATUS_ENABLED)"
              :inactive-label="$MAPS.example.clubActivity.clubStatus.getLabel(CLUB_STATUS_DISABLED)"
              switchable
              :switching="isStatusSwitching(row.id)"
              active-tips="确认启用该社团？"
              inactive-tips="确认停用该社团？"
              @switch="(next) => switchClubStatus(row as ClubActivityRow, next)"
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
              新建社团
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
                @click.stop="openEdit(row as ClubActivityRow)"
              />
              <el-button
                type="danger"
                plain
                size="small"
                :icon="Delete"
                title="删除"
                aria-label="删除"
                @click.stop="removeRow(row as ClubActivityRow)"
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

    <DialogEditClubActivity
      ref="dialogEditRef"
      @success="search(false)"
    />
  </div>
</template>

<script setup lang="ts">
import { Check, Delete, EditPen, Minus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';

import DialogEditClubActivity from './DialogEditClubActivity.vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useRowSelector } from '@/composables/useRowSelector';
import {
  requestBatchSwitchClubActivity,
  requestClubActivityList,
  requestDeleteClubActivity,
  type ClubActivityRow,
} from '@/modules/_example/clubActivity/_api';
import {
  CLUB_STATUS_DISABLED,
  CLUB_STATUS_ENABLED,
} from '@/modules/_example/clubActivity/_map/clubStatus';

const maxHeight = useAdminTableMaxHeight('.page-club-activity', 400);
const dialogEditRef = ref<InstanceType<typeof DialogEditClubActivity>>();
const batchEnableLoading = ref(false);
const batchDisableLoading = ref(false);
const statusSwitchingIds = ref<Record<string, boolean>>({});

const selectionApi = {
  clearSelection: () => {},
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
} = useAdminTable<ClubActivityRow, { clubName: string; status: string | number }>({
  defaultFilters: {
    clubName: '',
    status: '',
  },
  defaultPageSize: 10,
  fetcher: (query) =>
    requestClubActivityList(query) as Promise<{
      data: { lists: ClubActivityRow[]; total: number };
    }>,
  onAfterSearch() {
    selectionApi.clearSelection();
  },
});

const { selectRows, statusOfSelect, isRowSelected, chooseRow, toggleBatchSelect, clearSelection } =
  useRowSelector<ClubActivityRow>({
    tableData,
    lineKey: 'id',
    isMultiple: true,
    enableCache: false,
    enableSelector: false,
  });

selectionApi.clearSelection = clearSelection;

function handleReset() {
  resetListFilters();
}

function openCreate() {
  dialogEditRef.value?.open();
}

function openEdit(row: ClubActivityRow) {
  dialogEditRef.value?.open(row);
}

async function removeRow(row: ClubActivityRow) {
  await ElMessageBox.confirm(`确认删除「${row.clubName}」？`, '提示', { type: 'warning' });
  await requestDeleteClubActivity({ id: row.id });
  ElMessage.success('删除成功');
  search(false);
}

async function toBatchSwitch(status: number) {
  const ids = selectRows.value.map((row) => row.id);
  if (!ids.length) return;
  const actionLabel = status === CLUB_STATUS_ENABLED ? '启用' : '停用';
  await ElMessageBox.confirm(`确定${actionLabel}所选的 ${ids.length} 个社团？`, '提示', {
    type: 'warning',
  });
  const loadingRef = status === CLUB_STATUS_ENABLED ? batchEnableLoading : batchDisableLoading;
  loadingRef.value = true;
  try {
    await requestBatchSwitchClubActivity(ids, status);
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

async function switchClubStatus(row: ClubActivityRow, nextStatus: string | number | boolean) {
  const key = String(row.id);
  statusSwitchingIds.value = { ...statusSwitchingIds.value, [key]: true };
  try {
    await requestBatchSwitchClubActivity([row.id], Number(nextStatus));
    row.status = Number(nextStatus);
    ElMessage.success(nextStatus === CLUB_STATUS_ENABLED ? '已启用' : '已停用');
  } finally {
    const nextMap = { ...statusSwitchingIds.value };
    delete nextMap[key];
    statusSwitchingIds.value = nextMap;
  }
}
</script>

<style lang="scss" scoped>
.page-club-activity {
  box-sizing: border-box;
}

.batch-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--ku-text-secondary, #909399);
}

.school-chip {
  margin: 0 4px 4px 0;
}
</style>
