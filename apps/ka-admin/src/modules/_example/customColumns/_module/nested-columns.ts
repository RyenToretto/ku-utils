import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createSchemaColumnConfig, KuSchemaColumnConfig } from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  NESTED_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';

@Component({
  selector: 'ka-nested-columns',
  imports: [CustomColumnsTable, KuSchemaColumnConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-custom-columns-nested' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
    />
  `,
})
export default class NestedColumns {
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: NESTED_COLUMN_SCHEMAS,
    storageKey: 'ka-example-nested',
    schemaVersion: 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
