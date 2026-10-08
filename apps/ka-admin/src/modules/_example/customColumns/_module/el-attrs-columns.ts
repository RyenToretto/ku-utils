import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  createSchemaColumnConfig,
  KuSchemaColumnConfig,
  type ColumnSchema,
} from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';

/** zorroAttrs 透传到 td（等价 kv3 elAttrs / kr antdAttrs） */
const COLUMN_SCHEMAS: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 100,
    align: 'right',
    renderType: 'integer',
    isDefault: true,
    showOverflowTooltip: true,
    zorroAttrs: { nzEllipsis: true },
  },
  {
    prop: 'cost',
    label: '成本（超长提示）',
    minWidth: 140,
    align: 'right',
    renderType: 'float',
    isDefault: true,
    showOverflowTooltip: true,
    zorroAttrs: { nzEllipsis: true },
  },
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    renderType: 'float',
    isDefault: true,
  },
];

@Component({
  selector: 'ka-el-attrs-columns',
  imports: [CustomColumnsTable, KuSchemaColumnConfig],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-el-attrs-columns' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
    />
  `,
})
export default class ElAttrsColumns {
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: COLUMN_SCHEMAS,
    storageKey: 'ka-example-el-attrs',
    schemaVersion: 1,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
