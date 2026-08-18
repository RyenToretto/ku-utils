import type { App } from 'vue';

import DoConfigColumnDialog from './components/DoConfigColumnDialog.vue';
import DoReadColumnConfig from './components/DoReadColumnConfig.vue';
import DoTableHeader from './components/DoTableHeader.vue';
import SchemaColumn from './components/SchemaColumn.vue';

export { useSchemaColumnConfig, CRUD_INJECTION_KEY } from './composables/useSchemaColumnConfig';
export { DoTableHeader, DoConfigColumnDialog, DoReadColumnConfig, SchemaColumn };

export type {
  ColumnSchema,
  ColumnRenderType,
  ColumnConfig,
  TableStorage,
  TableColumnMeta,
  AlwaysVisibleColumn,
  CustomColumnMessages,
  SchemaColumnConfigOptions,
  CrudContext,
} from './types';

const components = [DoTableHeader, DoConfigColumnDialog, DoReadColumnConfig, SchemaColumn];

export function install(app: App): void {
  components.forEach((component) => {
    app.component(component.name || (component as { __name?: string }).__name || '', component);
  });
}
