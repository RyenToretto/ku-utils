<template>
  <div class="page-el-attrs-columns">
    <PageHeader
      subtitle="通过 schema.elAttrs 透传 Element Plus TableColumn 属性（如 show-overflow-tooltip）。"
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
          v-bind="schema.elAttrs || {}"
        >
          <template #default="{ row, column }">
            {{ formatSchemaCell(row[column.property], schema) }}
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { useSchemaColumnConfig, type ColumnSchema } from '@ku-utils/custom-columns';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const columnSchemas: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 100,
    align: 'right',
    renderType: 'integer',
    isDefault: true,
    elAttrs: { 'show-overflow-tooltip': true },
  },
  {
    prop: 'cost',
    label: '成本（超长提示）',
    minWidth: 140,
    align: 'right',
    renderType: 'float',
    isDefault: true,
    elAttrs: { 'show-overflow-tooltip': true },
  },
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
];

const maxHeight = useAdminTableMaxHeight('.page-el-attrs-columns', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas,
  storageKey: 'kv3-example-el-attrs',
  schemaVersion: 1,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
});
</script>
