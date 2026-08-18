<template>
  <div class="page-ui-kit-panel">
    <PageHeader
      subtitle="DoFilterPanel（折叠筛选）+ TableWrap（#control / #ft）+ BasePagination + DateRange + DoSelector。"
    />

    <DoFilterPanel
      :line="1"
      :loading="tableLoading"
      @search="search(true)"
    >
      <el-form
        inline
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="日期">
          <DateRange
            v-model="listFilters.dateRange"
            clearable
            style="width: 240px"
            @change="search(true)"
          />
        </el-form-item>
        <el-form-item label="关键字">
          <DoTxtSetter
            inline
            :init-value="listFilters.keyword"
            @ok="onKeywordOk"
          >
            <span class="line-txt">{{ listFilters.keyword || '点击编辑关键字' }}</span>
          </DoTxtSetter>
        </el-form-item>
        <el-form-item label="状态">
          <DoSelector
            v-model="listFilters.status"
            clearable
            style="width: 140px"
            :options="statusOptions"
            @change="search(true)"
          >
            <template #option="{ option }">
              <el-option
                :label="String(option.label)"
                :value="toOptionValue(option.value)"
              />
            </template>
          </DoSelector>
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

    <TableWrap
      enable-do-header
      :disabled-column-config="true"
    >
      <template #control>
        <el-button
          type="primary"
          @click="ElMessage.success('演示：新建')"
        >
          新建
        </el-button>
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
          prop="id"
          label="ID"
          width="70"
          align="center"
        />
        <el-table-column
          prop="name"
          label="名称"
          min-width="140"
        />
        <el-table-column
          prop="status"
          label="状态"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <CellState
              :model-value="row.status"
              switchable
              :switching="row.switching"
              @switch="(val) => onToggleStatus(row as DemoRow, val)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          min-width="160"
        >
          <template #default="{ row }">
            <CellDateTime :value="(row as DemoRow).createdAt" />
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="数量"
          width="140"
          align="right"
        >
          <template #default="{ row }">
            <DoNumberSetter
              :num="(row as DemoRow).amount"
              :new-value="(row as DemoRow).amount"
              :changing="(row as DemoRow).amountChanging"
              @ok="(val) => onAmountOk(row as DemoRow, val)"
            >
              {{ (row as DemoRow).amount }}
            </DoNumberSetter>
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
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref } from 'vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';

interface DemoRow {
  id: number;
  name: string;
  status: number;
  createdAt: string;
  amount: number;
  switching?: boolean;
  amountChanging?: boolean;
  [key: string]: unknown;
}

const maxHeight = useAdminTableMaxHeight('.page-ui-kit-panel', 400);

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

function toOptionValue(value: unknown): string | number | boolean {
  return value as string | number | boolean;
}

const allRows = ref<DemoRow[]>([
  {
    id: 1,
    name: '春日投放计划',
    status: 1,
    createdAt: '2026-03-01 09:12:33',
    amount: 1200,
  },
  {
    id: 2,
    name: '品牌曝光任务',
    status: 0,
    createdAt: '2026-03-05 14:22:01',
    amount: 860,
  },
  {
    id: 3,
    name: '拉新激励活动',
    status: 1,
    createdAt: '2026-03-12 18:40:55',
    amount: 2300,
  },
  {
    id: 4,
    name: '周末冲刺预算',
    status: 1,
    createdAt: '2026-04-02 08:05:12',
    amount: 540,
  },
  {
    id: 5,
    name: '召回短信批次',
    status: 0,
    createdAt: '2026-04-18 11:33:47',
    amount: 980,
  },
  {
    id: 6,
    name: '素材 A/B 测试',
    status: 1,
    createdAt: '2026-05-01 16:20:00',
    amount: 150,
  },
  {
    id: 7,
    name: '渠道联调样例',
    status: 1,
    createdAt: '2026-05-20 10:01:19',
    amount: 3200,
  },
  {
    id: 8,
    name: '停用归档任务',
    status: 0,
    createdAt: '2026-06-03 21:15:44',
    amount: 70,
  },
  {
    id: 9,
    name: '节日大促排期',
    status: 1,
    createdAt: '2026-06-18 09:40:00',
    amount: 4500,
  },
  {
    id: 10,
    name: '冷启动观察组',
    status: 0,
    createdAt: '2026-07-02 15:08:26',
    amount: 260,
  },
]);

const {
  listFilters,
  tableData,
  tableTotal,
  tableLoading,
  search,
  handlePageNumChange,
  handlePageSizeChange,
  resetListFilters,
} = useAdminTable<DemoRow, { keyword: string; status: string | number; dateRange: string[] }>({
  defaultFilters: {
    keyword: '',
    status: '',
    dateRange: [],
  },
  defaultPageSize: 10,
  fetcher: async (query) => {
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    const keyword = String(query.keyword || '');
    const status = query.status;
    const dateRange = (query.dateRange as string[]) || [];
    const filtered = allRows.value.filter((row) => {
      if (keyword && !row.name.includes(keyword)) return false;
      if (status !== '' && status !== null && status !== undefined) {
        if (row.status !== Number(status)) return false;
      }
      if (dateRange.length === 2) {
        const [start, end] = dateRange;
        const day = row.createdAt.slice(0, 10);
        if (day < start || day > end) return false;
      }
      return true;
    });
    const pageNum = Number(query.pageNum) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const start = (pageNum - 1) * pageSize;
    return {
      data: {
        lists: filtered.slice(start, start + pageSize),
        total: filtered.length,
      },
    };
  },
});

function handleReset() {
  resetListFilters({
    keyword: '',
    status: '',
    dateRange: [],
  });
}

function onKeywordOk(value: string | undefined) {
  listFilters.keyword = value ?? '';
  search(true);
}

function onToggleStatus(row: DemoRow, value: string | number | boolean) {
  row.switching = true;
  window.setTimeout(() => {
    row.status = Number(value);
    row.switching = false;
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}：${row.name}`);
  }, 400);
}

function onAmountOk(row: DemoRow, value: number | undefined) {
  if (value == null) return;
  row.amountChanging = true;
  window.setTimeout(() => {
    row.amount = value;
    row.amountChanging = false;
    ElMessage.success(`数量已更新为 ${value}`);
  }, 350);
}
</script>

<style lang="scss" scoped>
.line-txt {
  color: #918364;
}
</style>
