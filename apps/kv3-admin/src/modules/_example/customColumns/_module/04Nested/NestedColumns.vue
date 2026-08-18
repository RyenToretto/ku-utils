<template>
  <div class="page-nested-columns">
    <PageHeader subtitle="嵌套表头：使用 SchemaColumn 递归渲染 children。" />
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
        <SchemaColumn
          v-for="schema in visibleSchemas"
          :key="schema.prop || schema.label"
          :schema="schema"
          :format-cell="formatSchemaCell"
        />
      </el-table>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { SchemaColumn, useSchemaColumnConfig } from '@ku-utils/custom-columns';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  NESTED_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const maxHeight = useAdminTableMaxHeight('.page-nested-columns', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: NESTED_COLUMN_SCHEMAS,
  storageKey: 'kv3-example-nested',
  schemaVersion: 1,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
});
</script>
