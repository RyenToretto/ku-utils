<template>
  <div class="page-slots-columns">
    <PageHeader subtitle="自定义 cell 插槽：对 ROI 使用颜色强调。" />
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
          <template #default="{ row, column }">
            <span
              v-if="schema.prop === 'roi'"
              :class="row.roi >= 1.8 ? 'roi-high' : 'roi-normal'"
            >
              {{ formatSchemaCell(row[column.property], schema) }}
            </span>
            <template v-else>
              {{ formatSchemaCell(row[column.property], schema) }}
            </template>
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
  BASIC_COLUMN_SCHEMAS,
  DEMO_CUSTOM_COLUMN_MESSAGES,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const maxHeight = useAdminTableMaxHeight('.page-slots-columns', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: BASIC_COLUMN_SCHEMAS,
  storageKey: 'kv3-example-slots',
  schemaVersion: 1,
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
