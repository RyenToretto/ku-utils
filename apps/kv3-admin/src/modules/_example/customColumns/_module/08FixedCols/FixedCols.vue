<template>
  <div class="page-fixed-cols">
    <PageHeader
      subtitle="身份列写在 schema 外（el-table fixed）；「数量」使用 schema.fixed，弹窗中不可取消勾选，并配合 alwaysVisibleColumns 提示。"
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
          width="70"
          fixed="left"
          align="center"
        />
        <el-table-column
          label="名称"
          prop="name"
          min-width="140"
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
          <template #default="{ row, column }">
            {{ formatSchemaCell(row[column.property], schema) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
          fixed="right"
          class-name="ops-column"
        >
          <template #default>
            <el-button
              plain
              size="small"
              type="primary"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { useSchemaColumnConfig } from '@ku-utils/custom-columns';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  SCHEMA_FIXED_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const maxHeight = useAdminTableMaxHeight('.page-fixed-cols', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: SCHEMA_FIXED_COLUMN_SCHEMAS,
  storageKey: 'kv3-example-fixed-cols',
  schemaVersion: 2,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  alwaysVisibleColumns: [
    { prop: 'id', label: 'ID' },
    { prop: 'name', label: '名称' },
  ],
});
</script>
