<template>
  <section
    id="custom-columns"
    class="pg-section"
  >
    <h3>@ku-utils/custom-columns</h3>
    <p class="pg-hint">
      Element Plus 表格 +
      <code class="pg-code">useSchemaColumnConfig</code>
      +
      <code class="pg-code">DoTableHeader</code>
      。点「自定义列」可改可见列。
    </p>

    <DoTableHeader :disabled-column-config="false" />
    <el-table
      :key="tableRenderKey"
      :data="PLAYGROUND_TABLE_ROWS"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="70"
      />
      <el-table-column
        prop="name"
        label="名称"
        min-width="140"
      />
      <SchemaColumn
        v-for="schema in visibleSchemas"
        :key="schema.prop || schema.label"
        :schema="schema"
        :format-cell="formatSchemaCell"
      />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import { DoTableHeader, SchemaColumn, useSchemaColumnConfig } from '@ku-utils/custom-columns';
import { ElTable, ElTableColumn } from 'element-plus';

import {
  PLAYGROUND_COLUMN_MESSAGES,
  PLAYGROUND_COLUMN_SCHEMAS,
  PLAYGROUND_TABLE_ROWS,
} from './columnSchemas';

defineOptions({ name: 'CustomColumnsDemo' });

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: PLAYGROUND_COLUMN_SCHEMAS,
  storageKey: 'pg-vue3-basic-cols',
  schemaVersion: 1,
  messages: PLAYGROUND_COLUMN_MESSAGES,
  alwaysVisibleColumns: [
    { prop: 'id', label: 'ID' },
    { prop: 'name', label: '名称' },
  ],
});
</script>
