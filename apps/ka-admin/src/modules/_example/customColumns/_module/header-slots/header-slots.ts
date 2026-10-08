import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  createSchemaColumnConfig,
  KuSchemaColumnConfig,
  KuSchemaHeaderDef,
  type ColumnSchema,
} from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import { BadgeHeader } from '@/modules/_example/customColumns/_module/header-slots/badge-header';
import { TrendHeader } from '@/modules/_example/customColumns/_module/header-slots/trend-header';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';

const COLUMN_SCHEMAS: ColumnSchema[] = [
  {
    prop: 'amount',
    label: '数量',
    minWidth: 110,
    align: 'right',
    renderType: 'integer',
    headerTooltip: '投放量（headerTooltip）',
    isDefault: true,
  },
  {
    prop: 'score',
    label: '评分',
    minWidth: 120,
    align: 'right',
    renderType: 'integer',
    isDefault: true,
  },
  {
    prop: 'cost',
    label: '成本',
    minWidth: 110,
    align: 'right',
    renderType: 'float',
    isDefault: true,
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

/** 表头三种写法：schema.headerTooltip / 固定文案组件 / 吃 schema 的组件 */
@Component({
  selector: 'ka-header-slots',
  imports: [BadgeHeader, CustomColumnsTable, KuSchemaColumnConfig, KuSchemaHeaderDef, TrendHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-header-slots' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
    >
      <ng-template kuSchemaHeaderDef="score">
        <ka-trend-header label="评分" />
      </ng-template>
      <ng-template
        kuSchemaHeaderDef="cost"
        let-schema
      >
        <ka-badge-header [label]="schema.label" />
      </ng-template>
      <ng-template
        kuSchemaHeaderDef="roi"
        let-schema
      >
        <ka-trend-header [label]="schema.label" />
      </ng-template>
    </ka-custom-columns-table>
  `,
})
export default class HeaderSlots {
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: COLUMN_SCHEMAS,
    storageKey: 'ka-example-header-slots',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
