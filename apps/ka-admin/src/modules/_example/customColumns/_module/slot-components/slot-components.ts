import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  createSchemaColumnConfig,
  KuSchemaCellDef,
  KuSchemaColumnConfig,
  type ColumnSchema,
} from '@ku-utils/a-custom-columns';

import { CustomColumnsTable } from '@/modules/_example/customColumns/_module/custom-columns-table';
import { AmountCell } from '@/modules/_example/customColumns/_module/slot-components/amount-cell';
import { RatingCell } from '@/modules/_example/customColumns/_module/slot-components/rating-cell';
import { DEMO_CUSTOM_COLUMN_MESSAGES } from '@/modules/_example/customColumns/_utils/demo-schemas';
import { injectCustomColumnsDemoData } from '@/modules/_example/customColumns/_utils/inject-custom-columns-demo-data';
import { roiClass } from '@/modules/_example/customColumns/_utils/roi-class';

const COLUMN_SCHEMAS: ColumnSchema[] = [
  { prop: 'amount', label: '数量', minWidth: 120, align: 'right', isDefault: true },
  { prop: 'score', label: '评分', minWidth: 160, align: 'center', isDefault: true },
  {
    prop: 'roi',
    label: 'ROI',
    minWidth: 100,
    align: 'right',
    renderType: 'float',
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
];

/** 单元格三种写法：独立组件（带 prop 入参）/ 独立组件（只吃 row）/ 内联模板 */
@Component({
  selector: 'ka-slot-components',
  imports: [AmountCell, CustomColumnsTable, KuSchemaCellDef, KuSchemaColumnConfig, RatingCell],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-slot-components' },
  template: `
    <ka-custom-columns-table
      [kuSchemaColumnConfig]="config"
      [rows]="data.tableData()"
      [loading]="data.tableLoading()"
    >
      <ng-template
        kuSchemaCellDef="amount"
        let-row="row"
        let-schema="schema"
      >
        <ka-amount-cell
          [row]="row"
          [prop]="schema.prop ?? 'amount'"
        />
      </ng-template>
      <ng-template
        kuSchemaCellDef="score"
        let-row="row"
      >
        <ka-rating-cell [row]="row" />
      </ng-template>
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
export default class SlotComponents {
  protected readonly roiClass = roiClass;
  protected readonly data = injectCustomColumnsDemoData();
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: COLUMN_SCHEMAS,
    storageKey: 'ka-example-slot-components',
    schemaVersion: 2,
    messages: DEMO_CUSTOM_COLUMN_MESSAGES,
  });
}
