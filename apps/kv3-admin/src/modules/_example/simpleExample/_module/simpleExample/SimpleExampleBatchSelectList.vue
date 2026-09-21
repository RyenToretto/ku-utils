<template>
  <div class="page-simple-example-batch-select">
    <PageHeader
      subtitle="演示全选框放在 TableWrap #batch（表外）时的友好交互；金标仍是表头选择列，本页专门验收表外形态。"
    />

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

    <TableWrap enable-do-header>
      <!-- 有意放在 #batch：表外全选；用 .batch-select-control 保证热区与文案，避免孤零零 14px 方块 -->
      <template #batch>
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
          <span
            v-if="selectRows.length"
            class="batch-select-count"
          >
            已选 {{ selectRows.length }}
          </span>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        class="do-inner-scroller page-table hide-table-border"
        :data="tableData"
        :max-height="maxHeight"
        border
        stripe
        @row-click="onRowClick"
      >
        <el-table-column
          fixed="left"
          width="55"
          align="center"
        >
          <template #default="{ row }">
            <div
              class="do-select-cell"
              :class="{ active: isRowSelected(row as ExampleRow) }"
              @click.stop="chooseRow(row as ExampleRow)"
            >
              <el-icon><Check /></el-icon>
            </div>
          </template>
        </el-table-column>

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
import { Check, Minus } from '@element-plus/icons-vue';

import { useAdminTable } from '@/composables/useAdminTable';
import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useRowSelector } from '@/composables/useRowSelector';
import { requestSimpleExampleList } from '@/modules/_example/simpleExample/_api';

defineOptions({ name: 'SimpleExampleBatchSelectList' });

type ExampleRow = {
  id: number;
  exampleName: string;
  pkg: string;
  status: number;
  taskAction: string;
  createTime: string;
  [key: string]: unknown;
};

const maxHeight = useAdminTableMaxHeight('.page-simple-example-batch-select', 400);

const {
  listFilters,
  tableData,
  tableTotal,
  tableLoading,
  search,
  handlePageNumChange,
  handlePageSizeChange,
  resetListFilters,
} = useAdminTable<ExampleRow, { exampleName: string; status: string | number }>({
  defaultFilters: {
    exampleName: '',
    status: '',
  },
  fetcher: (query) =>
    requestSimpleExampleList(query) as Promise<{
      data: { lists: ExampleRow[]; total: number };
    }>,
});

const { selectRows, statusOfSelect, isRowSelected, chooseRow, toggleBatchSelect } =
  useRowSelector<ExampleRow>({
    tableData,
    lineKey: 'id',
    isMultiple: true,
    enableSelector: true,
  });

function handleReset() {
  resetListFilters({
    exampleName: '',
    status: '',
  });
}

function onRowClick(row: ExampleRow) {
  chooseRow(row);
}
</script>
