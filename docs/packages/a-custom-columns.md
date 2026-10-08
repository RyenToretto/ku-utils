# A Custom Columns 自定义列（Angular）

`@ku-utils/a-custom-columns` 是 Angular 22 + ng-zorro-antd 22 的自定义列组件库，交互与 Vue 3 `@ku-utils/custom-columns`、Vue 2 `@ku-utils/v2-custom-columns`、React `@ku-utils/r-custom-columns` 1:1。

以 **schema** 驱动列显隐、排序与 localStorage 持久化（含 `schemaVersion`）；standalone + signals + OnPush，零 zone.js 依赖。

## 安装

```bash
pnpm add @ku-utils/a-custom-columns
```

peer：`@angular/core|common|forms|cdk` ^22、`ng-zorro-antd` ^22、`@ant-design/icons-angular` ^22。

## 使用示例

```ts
import { Component } from '@angular/core';
import {
  createSchemaColumnConfig,
  KuDoTableHeader,
  KuSchemaColumnConfig,
  type ColumnSchema,
} from '@ku-utils/a-custom-columns';

const columnSchemas: ColumnSchema[] = [
  { prop: 'amount', label: '金额', group: '财务', renderType: 'float', isDefault: true },
  { prop: 'rate', label: '转化率', group: '财务', renderType: 'percent' },
];

@Component({
  selector: 'app-order-list',
  imports: [KuSchemaColumnConfig, KuDoTableHeader],
  template: `
    <div [kuSchemaColumnConfig]="columns">
      <ku-do-table-header [disabledColumnConfig]="false" />
      <!-- nz-table：遍历 columns.headerRows() / visibleLeafSchemas()，用 ku-schema-header / ku-schema-cell 渲染 -->
    </div>
  `,
})
export class OrderList {
  protected readonly columns = createSchemaColumnConfig({
    columnSchemas,
    storageKey: 'order_list_cols',
    schemaVersion: 1,
  });
}
```

完整 nz-table 模板见包 README；管理端样板见 `apps/ka-admin/src/modules/_example/customColumns`。

## 要点

| 能力       | Angular 写法                                                                   |
| ---------- | ------------------------------------------------------------------------------ |
| 配置下发   | `[kuSchemaColumnConfig]` 指令（等价 Vue provide / React Context）              |
| 单元格覆盖 | `<ng-template kuSchemaCellDef="prop" let-value let-row="row">`                 |
| 列头覆盖   | `<ng-template kuSchemaHeaderDef="prop" let-schema>`                            |
| 列属性     | `schema.zorroAttrs`（`nzLeft` / `nzRight` / `nzWidth` / `nzEllipsis` …）       |
| 固定列     | `fixed` 仅表示抽屉内不可取消；钉列用 `zorroAttrs.nzLeft / nzRight`             |
| 排序       | 受控 `[nzSortOrder]` + `(nzSortOrderChange)`，不设 `nzSortFn` 时需自行单列清空 |

## 组件

- `ku-do-table-header`：批量 / 控制区投影 +「自定义列」入口（悬停列出本地配置）
- `ku-do-config-column-dialog`：1000px 抽屉，搜索、分组导航、勾选、已选列拖拽排序、存到本地 / 读取本地
- `ku-do-read-column-config`：本地配置列表

## 构建

ng-packagr（APF，partial 编译）产出到 `dist/`；`publishConfig.directory=dist`。
