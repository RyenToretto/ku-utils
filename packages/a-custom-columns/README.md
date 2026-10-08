# @ku-utils/a-custom-columns

Angular 22 + ng-zorro-antd 22 自定义列组件库，对应 Vue 3 `@ku-utils/custom-columns` / React `@ku-utils/r-custom-columns`。

基于 **schema** 驱动表格列显隐、排序与 localStorage 持久化（含 `schemaVersion`）；signals + OnPush + standalone，零 zone.js 依赖。

## 安装

```bash
pnpm add @ku-utils/a-custom-columns
```

Peer：`@angular/core|common|forms|cdk` ^22、`ng-zorro-antd` ^22、`@ant-design/icons-angular` ^22；Node `^22.22.3 || ^24.15.0 || >=26`。

样式随组件自动注入（`ViewEncapsulation.None`），无需额外 import；如需全局预载可在 `angular.json` 的 `styles` 加 `node_modules/@ku-utils/a-custom-columns/style.css`。

## 快速上手

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  createSchemaColumnConfig,
  KuDoTableHeader,
  KuSchemaCell,
  KuSchemaCellDef,
  KuSchemaColumnConfig,
  KuSchemaHeader,
  type ColumnSchema,
} from '@ku-utils/a-custom-columns';
import { NzTableModule } from 'ng-zorro-antd/table';

const columnSchemas: ColumnSchema[] = [
  { prop: 'amount', label: '金额', group: '财务', renderType: 'float', isDefault: true },
  { prop: 'rate', label: '转化率', group: '财务', renderType: 'percent' },
];

@Component({
  selector: 'app-order-list',
  imports: [
    NzTableModule,
    KuSchemaColumnConfig,
    KuDoTableHeader,
    KuSchemaCell,
    KuSchemaHeader,
    KuSchemaCellDef,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [kuSchemaColumnConfig]="columns">
      <ku-do-table-header [disabledColumnConfig]="false">
        <button
          kuTableBatch
          nz-button
        >
          批量操作
        </button>
      </ku-do-table-header>

      <nz-table
        #t
        [nzData]="rows"
        [nzShowPagination]="false"
      >
        <thead>
          @for (hr of columns.headerRows(); track $index) {
            <tr>
              @for (cell of hr; track cell.key) {
                <th
                  [attr.colspan]="cell.colspan > 1 ? cell.colspan : null"
                  [attr.rowspan]="cell.rowspan > 1 ? cell.rowspan : null"
                >
                  <ku-schema-header [schema]="cell.schema" />
                </th>
              }
            </tr>
          }
        </thead>
        <tbody>
          @for (row of t.data; track row.id; let i = $index) {
            <tr>
              @for (s of columns.visibleLeafSchemas(); track s.prop) {
                <td [nzAlign]="s.align ?? 'left'">
                  <ku-schema-cell
                    [schema]="s"
                    [row]="row"
                    [index]="i"
                  />
                </td>
              }
            </tr>
          }
        </tbody>
      </nz-table>

      <ng-template
        kuSchemaCellDef="rate"
        let-text="text"
      >
        <b>{{ text }}</b>
      </ng-template>
    </div>
  `,
})
export class OrderList {
  protected readonly columns = createSchemaColumnConfig({
    columnSchemas,
    storageKey: 'order_list_cols',
    schemaVersion: 1,
  });
  protected readonly rows = [];
}
```

## API 摘要

### `createSchemaColumnConfig(options)` → `SchemaColumnConfig`

在组件字段初始化处创建，经 `[kuSchemaColumnConfig]` 指令下发（等价 React `SchemaColumnConfigContext.Provider`）：

| 成员                                                                                                         | 说明                                             |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| `visibleSchemas()`                                                                                           | 当前可见列（已过滤/排序，保留嵌套）              |
| `visibleLeafSchemas()` / `headerRows()`                                                                      | 叶子列（td）/ 多行表头（th，含 colspan/rowspan） |
| `tableColumns()` / `tableRenderKey()`                                                                        | 抽屉元数据 / 可见列 prop 串                      |
| `formatSchemaCell(value, schema)`                                                                            | `float` / `percent` / `integer` 格式化           |
| `readCacheConfig` / `getDefaultConfig` / `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 存储辅助                                         |

### 渲染

nz-table 是模板驱动（无 columns 数组），列渲染交给 `ku-schema-header`（th 内）与 `ku-schema-cell`（td 内）：

- `<ng-template kuSchemaCellDef="prop" let-value let-row="row" let-text="text">` — 按 prop 覆盖单元格（等价 Vue 插槽 / React `cellRender`）
- `<ng-template kuSchemaHeaderDef="prop" let-schema>` — 按 prop 覆盖列头
- `schema.zorroAttrs`（`nzLeft` / `nzRight` / `nzWidth` / `nzEllipsis` / `nzBreakWord`）由页面绑定到 `th` / `td`
- `fixed` 只表示「抽屉中不可取消勾选」，钉列用 `zorroAttrs.nzLeft / nzRight`

### 组件

交互与 Vue / React 包 1:1：

- **`ku-do-table-header`** — 左 `[kuTableBatch]`、右 `[kuTableControl]` 投影 +「自定义列」（`disabledColumnConfig` 默认 `true` 即隐藏）；悬停列出本地配置，选中即应用，「自定义配置」打开配置抽屉
- **`ku-do-config-column-dialog`** — 1000px 抽屉：搜索、左侧分组导航（滚动联动）、中间分组勾选（全选/反选）、右侧已选列（固定区 + CDK 拖拽排序）、存到本地 / 读取本地 / 取消 / 完成；`showConfigColumnDialog(config?)` 打开
- **`ku-do-read-column-config`** — 本地配置列表（悬停非系统配置可删除）

提示文案走 `NzMessageService`（跟随主题与暗色）。

## 构建

ng-packagr（APF，partial 编译）产出到 `dist/`；`publishConfig.directory=dist`，workspace 内通过 `linkDirectory` 直接链接产物目录。
