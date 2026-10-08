import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createSchemaColumnConfig, KuSchemaColumnConfig } from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import {
  BASIC_COLUMN_SCHEMAS,
  DEMO_CUSTOM_COLUMN_MESSAGES,
} from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';

@Component({
  selector: 'ka-basic-columns',
  imports: [CustomColumnsTable, KuSchemaColumnConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-custom-columns-basic' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
    />
  `,
})
export default class BasicColumns {
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: BASIC_COLUMN_SCHEMAS,
    storageKey: 'ka-example-basic',
    schemaVersion: 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
