<template>
  <div class="page-version-columns">
    <PageHeader
      subtitle="相对基础 schema：删除「评分」、将转化率字段 prop 从 rate 改为 cvtRate，并递增 schemaVersion=2，使旧 localStorage 配置失效。"
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
        :data="versionTableData"
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
            {{ formatSchemaCell(row[column.property], schema) }}
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { useSchemaColumnConfig } from '@ku-utils/custom-columns';
import { computed } from 'vue';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  VERSION_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const versionTableData = computed(() =>
  tableData.value.map((row) => ({
    ...row,
    cvtRate: row.rate,
  })),
);

const maxHeight = useAdminTableMaxHeight('.page-version-columns', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: VERSION_COLUMN_SCHEMAS,
  storageKey: 'kv3-example-version',
  schemaVersion: 2,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
});
</script>
