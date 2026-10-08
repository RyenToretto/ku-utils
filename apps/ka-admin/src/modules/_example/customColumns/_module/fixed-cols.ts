import { ChangeDetectionStrategy, Component } from '@angular/core';
import { createSchemaColumnConfig, KuSchemaColumnConfig } from '@ku-utils/a-custom-columns';
import { NzButtonModule } from 'ng-zorro-antd/button';

import {
  CustomColumnsOpsDef,
  CustomColumnsTable,
} from '@/modules/_example/customColumns/_module/custom-columns-table';
import {
  DEMO_CUSTOM_COLUMN_MESSAGES,
  SCHEMA_FIXED_COLUMN_SCHEMAS,
} from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';

/** schema.fixed 只表示抽屉内不可取消勾选；ID / 名称走 alwaysVisibleColumns */
@Component({
  selector: 'ka-fixed-cols',
  imports: [CustomColumnsOpsDef, CustomColumnsTable, KuSchemaColumnConfig, NzButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-fixed-cols' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
      [idWidth]="70"
      [nameMinWidth]="140"
    >
      <ng-template kaCustomColumnsOps>
        <button
          nz-button
          class="btn-plain-primary"
          nzSize="small"
        >
          详情
        </button>
      </ng-template>
    </ka-custom-columns-table>
  `,
})
export default class FixedCols {
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: SCHEMA_FIXED_COLUMN_SCHEMAS,
    storageKey: 'ka-example-fixed-cols',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
    alwaysVisibleColumns: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: '名称' },
    ],
  });
}
