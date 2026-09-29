<template>
  <div class="page-slots-columns">
    <PageHeader subtitle="插槽列 Demo" />
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
          :key="schema.prop || schema.label"
          :prop="schema.prop"
          :label="schema.label"
          :min-width="schema.minWidth || undefined"
          :align="schema.align || 'left'"
        >
          <template #default="{ row }">
            {{ formatSchemaCell(row[schema.prop], schema) }}
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script>
import { useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { SLOTS_COLUMN_SCHEMAS } from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default {
  name: 'SlotsColumns',
  mixins: [useSchemaColumnConfig],
  setup() {
    const { tableLoading, tableData } = useCustomColumnsDemoData();
    const maxHeight = useAdminTableMaxHeight('.page-slots-columns', 400);
    return { tableLoading, tableData, maxHeight };
  },
  data() {
    return {
      schemaStorageKey: 'kv2-example-slots',
      schemaVersion: 1,
      columnSchemas: SLOTS_COLUMN_SCHEMAS,
      alwaysVisibleColumns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '名称' },
      ],
    };
  },
};
</script>
