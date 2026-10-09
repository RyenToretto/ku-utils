<template>
  <div class="page-slot-components">
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
          <template #default="{ row, column, $index }">
            <!-- ① 模板插槽 -->
            <span
              v-if="schema.prop === 'roi'"
              :class="row.roi >= 1.8 ? 'roi-high' : 'roi-normal'"
            >
              {{ formatSchemaCell(row[column.property], schema) }}
            </span>
            <!-- ② cellComponent -->
            <component
              :is="schema.cellComponent"
              v-else-if="schema.cellComponent"
              :row="row"
              :column="column"
              :index="$index"
              :schema="schema"
            />
            <!-- ③ formatSchemaCell -->
            <span v-else>{{ formatSchemaCell(row[column.property], schema) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </TableWrap>
  </div>
</template>

<script>
import { useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';
import { markRaw } from 'vue';

import AmountCell from './cells/AmountCell.vue';
import RatingCell from './cells/RatingCell.vue';

import { useAdminTableMaxHeight } from '@/composables/useAdminTableMaxHeight';
import { useCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/useCustomColumnsDemoData';

export default {
  name: 'SlotComponents',
  mixins: [useSchemaColumnConfig],
  setup() {
    const { tableLoading, tableData } = useCustomColumnsDemoData();
    const maxHeight = useAdminTableMaxHeight('.page-slot-components', 400);
    return { tableLoading, tableData, maxHeight };
  },
  data() {
    return {
      schemaStorageKey: 'kv2-example-slot-components',
      schemaVersion: 2,
      columnSchemas: [
        {
          prop: 'amount',
          label: '数量',
          minWidth: 120,
          align: 'right',
          isDefault: true,
          cellComponent: markRaw(AmountCell),
        },
        {
          prop: 'score',
          label: '评分',
          minWidth: 160,
          align: 'center',
          isDefault: true,
          cellComponent: markRaw(RatingCell),
        },
        {
          prop: 'roi',
          label: 'ROI',
          minWidth: 100,
          align: 'right',
          renderType: 'float',
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
      ],
      alwaysVisibleColumns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '名称' },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.roi-high {
  color: var(--ku-color-success);
  font-weight: 600;
}
.roi-normal {
  color: var(--ku-text-secondary);
}
</style>
