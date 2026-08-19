<template>
  <section
    id="custom-columns"
    class="pg-section"
  >
    <h3>@ku-utils/v2-custom-columns</h3>
    <p class="pg-hint">
      Element UI 表格 + mixin
      <code class="pg-code">useSchemaColumnConfig</code>
      +
      <code class="pg-code">DoTableHeader</code>
      。点「自定义列」可改可见列。
    </p>

    <do-table-header :disabled-column-config="false" />
    <el-table
      :key="tableRenderKey"
      :data="tableData"
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
      <el-table-column
        v-for="schema in visibleSchemas"
        :key="schema.prop"
        :prop="schema.prop"
        :label="schema.label"
        :min-width="schema.minWidth"
        :align="schema.align || 'left'"
      >
        <template #default="{ row }">
          {{ formatSchemaCell(row[schema.prop], schema) }}
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script>
import { formatPercent, formatThousands } from '@ku-utils/utils';
import { DoTableHeader, useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';

export default {
  name: 'CustomColumnsDemo',
  components: { DoTableHeader },
  filters: {
    integer(val) {
      const n = Number(val);
      if (Number.isNaN(n)) return val;
      return formatThousands(String(Math.round(n))) || String(val);
    },
    float(val, digits = 2, noZero = true) {
      const n = Number(val);
      if (Number.isNaN(n)) return val;
      if (noZero && n === 0) return '-';
      return formatThousands(n.toFixed(digits)) || String(val);
    },
    percent(val, digits = 1, noZero = true) {
      const n = Number(val);
      if (Number.isNaN(n)) return val;
      if (noZero && n === 0) return '-';
      return formatPercent(n, digits);
    },
  },
  mixins: [useSchemaColumnConfig],
  data() {
    return {
      schemaStorageKey: 'pg-vue2-basic-cols',
      schemaVersion: 1,
      alwaysVisibleColumns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '名称' },
      ],
      columnSchemas: [
        {
          prop: 'amount',
          label: '数量',
          minWidth: 100,
          align: 'right',
          renderType: 'integer',
          group: '数值',
          isDefault: true,
        },
        {
          prop: 'cost',
          label: '成本',
          minWidth: 110,
          align: 'right',
          renderType: 'float',
          renderArgs: [2, true],
          group: '金额',
          isDefault: true,
        },
        {
          prop: 'rate',
          label: '转化率',
          minWidth: 100,
          align: 'right',
          renderType: 'percent',
          renderArgs: [1, true],
          group: '金额',
          isDefault: true,
        },
      ],
      tableData: [
        { id: 1, name: 'Campaign A', amount: 1280, cost: 320.5, rate: 0.126 },
        { id: 2, name: 'Campaign B', amount: 860, cost: 118, rate: 0.084 },
        { id: 3, name: 'Campaign C', amount: 0, cost: 56.2, rate: 0.031 },
      ],
    };
  },
};
</script>
