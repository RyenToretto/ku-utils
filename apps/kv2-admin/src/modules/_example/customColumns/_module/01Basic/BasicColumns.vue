<template>
  <div class="page-basic-columns">
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

<script>
import { useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { BASIC_COLUMN_SCHEMAS } from '@/modules/_example/customColumns/_utils/demoSchemas';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default {
  name: 'BasicColumns',
  mixins: [useSchemaColumnConfig],
  setup() {
    const { tableLoading, tableData } = useCustomColumnsDemoData();
    const maxHeight = useAdminTableMaxHeight('.page-basic-columns', 400);
    return { tableLoading, tableData, maxHeight };
  },
  data() {
    return {
      schemaStorageKey: 'kv2-example-basic',
      schemaVersion: 1,
      columnSchemas: BASIC_COLUMN_SCHEMAS,
      alwaysVisibleColumns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '名称' },
      ],
      sortProp: '',
      sortOrder: null,
    };
  },
  computed: {
    sortedTableData() {
      const list = [...this.tableData];
      if (!this.sortProp || !this.sortOrder) return list;
      const prop = this.sortProp;
      const factor = this.sortOrder === 'ascending' ? 1 : -1;
      return list.sort((a, b) => (Number(a[prop] ?? 0) - Number(b[prop] ?? 0)) * factor);
    },
  },
  methods: {
    handleSortChange({ prop, order }) {
      this.sortProp = prop || '';
      this.sortOrder = order;
    },
  },
};
</script>
