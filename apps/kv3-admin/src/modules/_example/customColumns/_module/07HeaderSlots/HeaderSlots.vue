<template>
  <div class="page-header-slots">
    <PageHeader
      subtitle="表头三种写法：① headerTooltip ② renderHeader（VNode）③ 模板 #header。本页前两列走 SchemaColumn，后两列用模板插槽对照。"
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
        <SchemaColumn
          v-for="schema in schemaColumnList"
          :key="schema.prop"
          :schema="schema"
          :format-cell="formatSchemaCell"
        />
        <el-table-column
          v-for="schema in templateHeaderSchemas"
          :key="schema.prop"
          :prop="schema.prop"
          :min-width="schema.minWidth || undefined"
          :align="schema.align || 'left'"
        >
          <template #header>
            <BadgeHeader
              v-if="schema.prop === 'cost'"
              :label="schema.label"
            />
            <TrendHeader
              v-else-if="schema.prop === 'roi'"
              :label="schema.label"
            />
            <span v-else>{{ schema.label }}</span>
          </template>
          <template #default="{ row, column }">
            {{ formatSchemaCell(row[column.property], schema) }}
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script setup lang="ts">
import { SchemaColumn, useSchemaColumnConfig, type ColumnSchema } from '@ku-utils/custom-columns';
import { computed, h } from 'vue';

import BadgeHeader from './headers/BadgeHeader.vue';
import TrendHeader from './headers/TrendHeader.vue';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

const { tableLoading, tableData } = useCustomColumnsDemoData();

const columnSchemas: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 110,
    align: 'right',
    renderType: 'integer',
    headerTooltip: '投放量（headerTooltip）',
    isDefault: true,
  },
  {
    prop: 'score',
    label: '评分',
    minWidth: 120,
    align: 'right',
    renderType: 'integer',
    renderHeader: () => h(TrendHeader, { label: '评分' }),
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
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
];

const maxHeight = useAdminTableMaxHeight('.page-header-slots', 400);

const { visibleSchemas, tableRenderKey, formatSchemaCell } = useSchemaColumnConfig({
  columnSchemas,
  storageKey: 'kv3-example-header-slots',
  schemaVersion: 2,
  messages: DEMO_CUSTOM_COLUMN_MESSAGES,
});

const schemaColumnList = computed(() =>
  visibleSchemas.value.filter((s) => s.prop === 'amount' || s.prop === 'score'),
);
const templateHeaderSchemas = computed(() =>
  visibleSchemas.value.filter((s) => s.prop === 'cost' || s.prop === 'roi'),
);
</script>
