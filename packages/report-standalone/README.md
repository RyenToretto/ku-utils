# @ku-utils/report-standalone

`@ku-utils/report` 的独立离线版本，已将 `@ku-utils/report` 和
`@ku-utils/utils` 的运行时代码及类型声明全部内联。

适用于需要通过单个 tarball 离线交付、不想安装 `@ku-utils/report` 依赖树的项目。

## 安装

将 tarball 放入消费方项目，例如 `vendor/ku-utils/`：

```bash
pnpm add ./vendor/ku-utils/ku-utils-report-standalone-1.2.14.tgz
```

也可以在 `package.json` 中声明：

```json
{
  "dependencies": {
    "@ku-utils/report-standalone": "file:./vendor/ku-utils/ku-utils-report-standalone-1.2.14.tgz"
  }
}
```

## 使用

API 与 `@ku-utils/report` 保持一致，只需替换包名：

```ts
import { createXhReport } from '@ku-utils/report-standalone';
```

消费方不需要安装 `@ku-utils/report` 或 `@ku-utils/utils`。

## 构建与打包

```bash
pnpm pack:report-standalone
```

产物输出到根目录
`tarballs/ku-utils-report-standalone-<version>.tgz`。
