---
name: custom-columns
description: Angular 自定义列接入指南（@ku-utils/a-custom-columns）。当需要为 ng-zorro 表格页面增加「自定义列」能力（schema 驱动列、列配置持久化、配置抽屉拖拽排序、分组导航、嵌套表头）时使用。
---

# Angular 自定义列接入 Skill

`@ku-utils/a-custom-columns` 是 Angular 22 + ng-zorro-antd 22 的自定义列方案，与 Vue 3 `@ku-utils/custom-columns`、React `@ku-utils/r-custom-columns` 交互 1:1：`createSchemaColumnConfig` 产出 signals 状态，经 `[kuSchemaColumnConfig]` 指令下发；`ku-do-table-header`（悬停列出本地配置、内含 1000px 配置抽屉）、`ku-schema-cell`、`ku-schema-header` 从注入树读取；配置持久化到 localStorage。

## Step 0：确认依赖

消费项目已安装 `@ku-utils/a-custom-columns`（peer：`@angular/core|common|forms|cdk` ^22、`ng-zorro-antd` ^22、`@ant-design/icons-angular` ^22）。样式随组件注入；如需预载，在 `angular.json` `styles` 加 `node_modules/@ku-utils/a-custom-columns/style.css`。

workspace 内 dev-server 须把包排除出预打包：`serve.options.prebundle.exclude: ['@ku-utils/a-custom-columns']`，改包后 `pnpm --filter @ku-utils/a-custom-columns build` 并重启 dev。

## Step 1：定义列 schema

```ts
import type { ColumnSchema } from '@ku-utils/a-custom-columns';

export const USER_COLUMN_SCHEMAS: ColumnSchema[] = [
  { prop: 'nickname', label: '昵称', group: '基础信息', minWidth: 120 },
  {
    prop: 'balance',
    label: '余额',
    group: '账务',
    align: 'right',
    renderType: 'float',
    renderArgs: [2, true],
  },
  { prop: 'requestCount', label: '请求数', group: '统计', renderType: 'integer', isDefault: true },
];
```

- `prop`：叶子列必填，全局唯一稳定；`label` / `group`（默认「未分组」）
- `renderType` / `renderArgs`：内置格式化（text / integer / float / percent）
- `headerTooltip`：列头提示；`showOverflowTooltip` + `zorroAttrs.nzEllipsis`：超长省略
- `zorroAttrs`：`nzLeft` / `nzRight` / `nzEllipsis` / `nzBreakWord` / `nzWidth`，由页面绑到 `th` / `td`
- `isDefault`：无缓存时默认显示；`children`：嵌套表头
- `fixed`：抽屉中不可取消勾选（不决定钉列）

## Step 2：页面

```ts
@Component({
  imports: [
    KuSchemaCell,
    KuSchemaCellDef,
    KuSchemaColumnConfig,
    KuSchemaHeader,
    NzTableModule,
    TableWrap,
  ],
  template: `
    <div [kuSchemaColumnConfig]="config">
      <ka-table-wrap
        [enableDoHeader]="true"
        [disabledColumnConfig]="false"
      >
        <nz-table
          #t
          [nzData]="rows()"
          [nzWidthConfig]="columns.widthConfig()"
          ...
        >
          <thead>
            @for (headerRow of config.headerRows(); track $index) {
              <tr>
                @for (cell of headerRow; track cell.key) {
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
                @for (schema of config.visibleLeafSchemas(); track schema.prop) {
                  <td [nzAlign]="schema.align ?? null">
                    <ku-schema-cell
                      [schema]="schema"
                      [row]="row"
                      [index]="i"
                    />
                  </td>
                }
              </tr>
            }
          </tbody>
        </nz-table>
      </ka-table-wrap>

      <ng-template
        kuSchemaCellDef="balance"
        let-text="text"
      >
        <b>{{ text }}</b>
      </ng-template>
    </div>
  `,
})
export class UserList {
  protected readonly config = createSchemaColumnConfig({
    columnSchemas: USER_COLUMN_SCHEMAS,
    storageKey: 'admin_users_col',
    schemaVersion: 1,
  });
}
```

多页共用表格结构时，参照 `customColumns/_module/custom-columns-table.ts`：在**页面模板**里 `<ka-custom-columns-table [kuSchemaColumnConfig]="config">`，表格组件 `inject(KuSchemaColumnConfig)` 取配置，页面内容里的 `kuSchemaCellDef` 照常生效。

## API 速查

| 成员                                                                | 说明                                  |
| ------------------------------------------------------------------- | ------------------------------------- |
| `visibleSchemas()` / `visibleLeafSchemas()` / `headerRows()`        | 可见列（保留嵌套）/ 叶子列 / 多行表头 |
| `tableColumns()` / `tableRenderKey()`                               | 抽屉元数据 / 可见列 prop 串           |
| `formatSchemaCell(value, schema)`                                   | 单元格格式化                          |
| `applyColumnConfig` / `saveConfigToLocal` / `removeConfigFromLocal` | 配置增删改                            |
| `readCacheConfig` / `getDefaultConfig`                              | 配置读取                              |

options：`{ columnSchemas, storageKey?, schemaVersion?, alwaysVisibleColumns?, maxConfigCount?, maxSelectCount?, messages? }`

## FAQ

- **自定义列按钮不显示**：`ka-table-wrap` 需 `[enableDoHeader]="true"` + `[disabledColumnConfig]="false"`，且在 `[kuSchemaColumnConfig]` 子树内
- **`kuSchemaCellDef` 不生效**：模板必须写在挂 `[kuSchemaColumnConfig]` 的元素**内容**里（不是表格组件自己的视图）
- **排序**：`th` 用 `[nzShowSort]` + 受控 `[nzSortOrder]` / `(nzSortOrderChange)`，数据在页面 `computed` 里排；`NzTableSortOrder` 含 `string`，需收窄到 `'ascend' | 'descend'`
- **配置互相覆盖**：`storageKey` 全局唯一；字段重命名/删除递增 `schemaVersion`
