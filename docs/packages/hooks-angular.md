# Hooks Angular 注入函数

`@ku-utils/hooks-angular` 是 `@ku-utils/hooks`（Vue）/ `@ku-utils/hooks-react` 的 Angular 侧对应实现，基于 signals，零 zone.js 依赖。

## 安装

```bash
pnpm add @ku-utils/hooks-angular
```

peer：`@angular/core` ^22；Node `^22.22.3 || ^24.15.0 || >=26`（Angular 22 要求）。

## 使用示例

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectMaxHeight, injectVersionUpdate } from '@ku-utils/hooks-angular';

@Component({
  selector: 'ka-demo-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-table [nzScroll]="{ y: maxHeight() + 'px' }" />
  `,
})
export class DemoList {
  protected readonly maxHeight = injectMaxHeight({
    targetSelector: '.table-wrap .ant-table',
  }).maxHeight;

  protected readonly version = injectVersionUpdate({
    fetchVersion: () => fetch('/data/version.json').then((r) => r.json()),
  });
}
```

## 导出清单

| 名称                  | 对应 Vue / React   | 说明                                                        |
| --------------------- | ------------------ | ----------------------------------------------------------- |
| `injectMaxHeight`     | `useMaxHeight`     | 按视口剩余空间计算表格最大高度（`Signal<number>`）          |
| `injectVersionUpdate` | `useVersionUpdate` | 轮询 `version.json` 提示新版本（`hasUpdate` 等均为 Signal） |

两者都必须在**注入上下文**调用（字段初始化或构造函数），销毁时由 `DestroyRef` 自动清理监听与定时器。

## 构建

ng-packagr（APF，partial 编译）产出到 `dist/`；`publishConfig.directory=dist`。
