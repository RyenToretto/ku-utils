import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { createSchemaColumnConfig, KuSchemaColumnConfig } from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  VERSION_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';

/** schemaVersion=2：相对 basic 删除 score、rate 重命名为 cvtRate，旧缓存自动失效 */
@Component({
  selector: 'ka-version-columns',
  imports: [CustomColumnsTable, KuSchemaColumnConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-custom-columns-version' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="rows()"
      [loading]="data.tableLoading()"
    />
  `,
})
export default class VersionColumns {
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly rows = computed(() =>
    this.data.tableData().map((row) => ({ ...row, cvtRate: row.rate })),
  );
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: VERSION_COLUMN_SCHEMAS,
    storageKey: 'ka-example-version',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
