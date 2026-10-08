import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  createSchemaColumnConfig,
  KuSchemaCellDef,
  KuSchemaColumnConfig,
} from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import {
  BASIC_COLUMN_SCHEMAS,
  DEMO_CUSTOM_COLUMN_MESSAGES,
} from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';
import { roiClass } from '@/modules/_example/customColumns/_utils/roi-class';

/** 本页只演示插槽，不接排序（schema 自带 sortable 不生效） */
@Component({
  selector: 'ka-slots-columns',
  imports: [CustomColumnsTable, KuSchemaCellDef, KuSchemaColumnConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-slots-columns' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
      [sortable]="false"
    >
      <ng-template
        kuSchemaCellDef="roi"
        let-row="row"
        let-text="text"
      >
        <span [class]="roiClass(row)">{{ text }}</span>
      </ng-template>
    </ka-custom-columns-table>
  `,
})
export default class SlotsColumns {
  protected readonly roiClass = roiClass;
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: BASIC_COLUMN_SCHEMAS,
    storageKey: 'ka-example-slots',
    schemaVersion: 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
