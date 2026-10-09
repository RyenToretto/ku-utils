<template>
  <el-table-column
    v-if="schema.children && schema.children.length"
    :label="schema.label"
    :align="schema.align || 'center'"
  >
    <schema-column
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
    v-bind="schema.elAttrs || {}"
  >
    <template
      v-if="schema.renderHeader"
      #header="scope"
    >
      <header-render
        :render="schema.renderHeader"
        :scope="scope"
      />
    </template>
    <template
      v-else-if="schema.headerTooltip"
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

<script>
/** 递归渲染 schema（含 children 嵌套表头）；与 @ku-utils/custom-columns 的 SchemaColumn 同 props */
export default {
  name: 'SchemaColumn',
  components: {
    /** el-table-column 的 render-header 会触发 Element 弃用告警，改走 #header 插槽，入参同 (h, { column, $index }) */
    HeaderRender: {
      functional: true,
      props: {
        render: { type: Function, required: true },
        scope: { type: Object, required: true },
      },
      render(h, ctx) {
        return ctx.props.render(h, ctx.props.scope);
      },
    },
  },
  props: {
    schema: {
      type: Object,
      required: true,
    },
    formatCell: {
      type: Function,
      default: null,
    },
  },
  methods: {
    resolveCell(row, column) {
      const val = column.property ? row[column.property] : undefined;
      if (this.formatCell) return this.formatCell(val, this.schema);
      return val === null || val === undefined || val === '' ? '-' : String(val);
    },
  },
};
</script>

<style lang="less" scoped>
.schema-col-header-tip {
  border-bottom: 1px dashed currentColor;
  cursor: help;
}
</style>
