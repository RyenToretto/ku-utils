<template>
  <el-table-column
    v-if="schema.children && schema.children.length"
    :label="schema.label"
    :align="schema.align || 'center'"
  >
    <SchemaColumn
      v-for="child in schema.children"
      :key="child.prop || child.label"
      :schema="child"
      :format-cell="formatCell"
    />
  </el-table-column>

  <el-table-column
    v-else
    :prop="schema.prop"
    :label="schema.label"
    :width="schema.width || undefined"
    :min-width="schema.minWidth || undefined"
    :align="schema.align || 'left'"
    :sortable="schema.sortable || false"
    :show-overflow-tooltip="schema.showOverflowTooltip"
    :render-header="schema.renderHeader || undefined"
    v-bind="schema.elAttrs || {}"
  >
    <template
      v-if="schema.headerTooltip"
      #header
    >
      <el-tooltip
        :content="schema.headerTooltip"
        placement="top"
      >
        <span class="schema-col-header-tip">{{ schema.label }}</span>
      </el-tooltip>
    </template>
    <template #default="{ row, column, $index }">
      <component
        :is="schema.cellComponent"
        v-if="schema.cellComponent"
        :row="row"
        :column="column"
        :index="$index"
        :schema="schema"
      />
      <span v-else>{{ resolveCell(row, column) }}</span>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import type { ColumnSchema } from '../types';

defineOptions({ name: 'SchemaColumn' });

const props = defineProps<{
  schema: ColumnSchema;
  formatCell?: (val: unknown, schema: ColumnSchema) => string;
}>();

function resolveCell(row: Record<string, unknown>, column: { property?: string }): string {
  const val = column.property ? row[column.property] : undefined;
  if (props.formatCell) return props.formatCell(val, props.schema);
  return val === null || val === undefined || val === '' ? '-' : String(val);
}
</script>

<style scoped>
.schema-col-header-tip {
  border-bottom: 1px dashed currentColor;
  cursor: help;
}
</style>
