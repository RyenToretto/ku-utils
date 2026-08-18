# @ku-utils/landing-report-standalone

`@ku-utils/landing-report` 的独立离线版本，已将
`@ku-utils/landing-report`、`@ku-utils/report` 和
`@ku-utils/utils` 的运行时代码及类型声明全部内联。

适用于需要通过单个 tarball 离线交付的项目。

## 安装

将 tarball 放入消费方项目，例如 `vendor/ku-utils/`：

```bash
pnpm add ./vendor/ku-utils/ku-utils-landing-report-standalone-1.1.21.tgz
```

也可以在 `package.json` 中声明：

```json
{
  "dependencies": {
    "@ku-utils/landing-report-standalone": "file:./vendor/ku-utils/ku-utils-landing-report-standalone-1.1.21.tgz"
  }
}
```

## 使用

API 与 `@ku-utils/landing-report` 保持一致，只需替换包名：

```ts
import { createLandingReport, LandingTracker } from '@ku-utils/landing-report-standalone';
```

消费方不需要安装 `@ku-utils/landing-report`、`@ku-utils/report` 或
`@ku-utils/utils`。

## 构建与打包

```bash
pnpm pack:landing-report-standalone
```

产物输出到根目录
`tarballs/ku-utils-landing-report-standalone-<version>.tgz`。
