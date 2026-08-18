<template>
  <div class="page-slot-components">
    <PageHeader
      subtitle="单元格三种写法对照：① 模板插槽（ROI 着色）② schema.cellComponent（数量/评分）③ formatSchemaCell 默认格式化（成本）。"
    />
    <TableWrap
      enable-do-header
      :disabled-column-config="false"
    >
      <el-table
        :key="tableRenderKey"
        v-loading="tableLoading"
        class="do-inner-scroller page-table hide-table-border"
        :max-height="maxHeight"
        :data="tableData"
        border
        stripe
      >
        <el-table-column
          label="ID"
          prop="id"
          width="60"
          fixed="left"
          align="center"
        />
        <el-table-column
          label="名称"
          prop="name"
          min-width="120"
          fixed="left"
        />
        <el-table-column
          v-for="schema in visibleSchemas"
          :key="schema.prop"
          :prop="schema.prop"
          :label="schema.label"
          :min-width="schema.minWidth || undefined"
          :align="schema.align || 'left'"
        >
          <template #default="{ row, column, $index }">
            <!-- ① 模板插槽 -->
            <span
              v-if="schema.prop === 'roi'"
              :class="row.roi >= 1.8 ? 'roi-high' : 'roi-normal'"
            >
              {{ formatSchemaCell(row[column.property], schema) }}
            </span>
            <!-- ② cellComponent -->
            <component
              :is="schema.cellComponent"
              v-else-if="schema.cellComponent"
              :row="row"
              :column="column"
              :index="$index"
              :schema="schema"
            />
            <!-- ③ formatSchemaCell -->
            <span v-else>{{ formatSchemaCell(row[column.property], schema) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { useSchemaColumnConfig, type ColumnSchema } from '@ku-utils/custom-columns';

import AmountCell from './cells/AmountCell.vue';
import RatingCell from './cells/RatingCell.vue';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const columnSchemas: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 120,
    align: 'right',
    isDefault: true,
    cellComponent: AmountCell,
  },
  {
    prop: 'score',
    label: '评分',
    minWidth: 160,
    align: 'center',
    isDefault: true,
    cellComponent: RatingCell,
  },
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
  {
    prop: 'cost',
    label: '成本',
    minWidth: 110,
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
];

const maxHeight = useAdminTableMaxHeight('.page-slot-components', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas,
  storageKey: 'kv3-example-slot-components',
  schemaVersion: 2,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
});
</script>

<style lang="scss" scoped>
.roi-high {
  color: #67c23a;
  font-weight: 600;
}
.roi-normal {
  color: #606266;
}
</style>
