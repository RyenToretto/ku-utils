# @ku-utils/hooks-angular

> Angular 注入函数集合（与 `@ku-utils/hooks` / `@ku-utils/hooks-react` 对应的 Angular 侧能力），基于 signals，零 zone.js 依赖。

## 安装

```bash
pnpm add @ku-utils/hooks-angular
```

peer：`@angular/core` ^22；Node `^22.22.3 || ^24.15.0 || >=26`（Angular 22 要求）。

## 可用注入函数

| 函数                  | 对应 React / Vue   | 返回                                                                         |
| --------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `injectMaxHeight`     | `useMaxHeight`     | `{ maxHeight: Signal<number>, refresh() }`                                   |
| `injectVersionUpdate` | `useVersionUpdate` | `{ currentVersion, latestVersion, hasUpdate, checking }`（Signal）+ 两个方法 |

两者都必须在**注入上下文**调用（组件/服务字段初始化或构造函数），销毁时由 `DestroyRef` 自动清理监听与定时器。

## 使用

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

## 构建

ng-packagr（APF，partial 编译）产出到 `dist/`；`publishConfig.directory=dist`，workspace 内通过 `linkDirectory` 直接链接产物目录。

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
