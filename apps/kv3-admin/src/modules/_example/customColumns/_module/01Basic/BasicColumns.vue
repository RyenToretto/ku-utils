<template>
  <div class="page-basic-columns">
    <PageHeader
      subtitle="最简接入：columnSchemas + visibleSchemas + formatSchemaCell；点击表头可前端排序。"
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
        :data="sortedTableData"
        border
        stripe
        @sort-change="handleSortChange"
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
          :sortable="schema.sortable ? 'custom' : false"
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
import { computed, ref } from 'vue';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import {
  BASIC_COLUMN_SCHEMAS,
  DEMO_CUSTOM_COLUMN_MESSAGES,
} from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const sortProp = ref('');
const sortOrder = ref<'ascending' | 'descending' | null>(null);

const sortedTableData = computed(() => {
  const list = [...tableData.value];
  if (!sortProp.value || !sortOrder.value) return list;
  const prop = sortProp.value;
  const factor = sortOrder.value === 'ascending' ? 1 : -1;
  return list.sort((a, b) => {
    const av = Number((a as Record<string, unknown>)[prop] ?? 0);
    const bv = Number((b as Record<string, unknown>)[prop] ?? 0);
    return (av - bv) * factor;
  });
});

function handleSortChange(payload: {
  prop: string | null;
  order: 'ascending' | 'descending' | null;
}) {
  sortProp.value = payload.prop || '';
  sortOrder.value = payload.order;
}

const maxHeight = useAdminTableMaxHeight('.page-basic-columns', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas: BASIC_COLUMN_SCHEMAS,
  storageKey: 'kv3-example-basic',
  schemaVersion: 1,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
});
</script>
