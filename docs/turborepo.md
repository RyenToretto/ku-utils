# Turborepo 使用指南

Turborepo 是由 Vercel 维护的高性能 Monorepo 构建系统，使用 Rust 编写。本项目（ku-utils）使用 Turborepo v2 进行任务编排、缓存和并行构建。

> 官方文档：https://turbo.build/repo/docs

---

## 一、核心概念

### 1.1 为什么使用 Turborepo

| 能力         | 说明                                        |
| ------------ | ------------------------------------------- |
| **任务编排** | 根据包之间的依赖关系自动确定构建顺序        |
| **并行执行** | 无依赖关系的任务并行执行，最大化 CPU 利用率 |
| **增量构建** | 基于文件哈希的缓存，未变化的包跳过构建      |
| **远程缓存** | 团队成员共享构建缓存，CI 不重复构建         |

### 1.2 任务图（Task Graph）

Turborepo 会根据 `turbo.json` 中的 `dependsOn` 构建一个有向无环图（DAG）：

```
@ku-utils/ui
    ├── depends on → @ku-utils/utils (^build)
    └── depends on → @ku-utils/hooks (^build)

@ku-utils/hooks
    └── depends on → @ku-utils/utils (^build)
```

当执行 `turbo run build` 时：

1. 先并行构建没有内部依赖的包（`utils`、`constants`、`types` 等）
2. 再构建依赖上述包的包（`hooks`、`directives` 等）
3. 最后构建顶层包（`ui`、`nuxt-module` 等）

## 二、项目配置详解

### 2.1 turbo.json

以下是本项目当前的 `turbo.json` 配置：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".output/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint:fix": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 2.2 字段说明

#### `dependsOn`

定义任务之间的依赖关系。

| 语法        | 含义                              | 示例                                             |
| ----------- | --------------------------------- | ------------------------------------------------ |
| `^build`    | 先构建**上游依赖包**的 build 任务 | `@ku-utils/ui` 会先等 `@ku-utils/utils` 构建完成 |
| `build`     | 先运行**当前包自身**的 build 任务 | `test` 先运行自己包的 `build`                    |
| `web#build` | 先运行**指定包**的 build 任务     | 依赖某个特定包的任务完成                         |

> `^` 前缀表示"拓扑依赖"——沿着 `package.json` 中 `dependencies` 的方向向上查找。

#### `outputs`

指定任务产物目录，用于缓存命中时恢复文件。

| 值                | 说明                            |
| ----------------- | ------------------------------- |
| `["dist/**"]`     | 缓存 dist 目录下所有文件        |
| `[".output/**"]`  | 缓存 Nuxt 的 .output 目录       |
| `["coverage/**"]` | 缓存测试覆盖率报告              |
| `[]`              | 无产物输出（lint 等检查类任务） |

#### `cache`

| 值             | 说明                                    |
| -------------- | --------------------------------------- |
| `true`（默认） | 启用缓存                                |
| `false`        | 禁用缓存（适用于 dev server、clean 等） |

#### `persistent`

| 值              | 说明                                              |
| --------------- | ------------------------------------------------- |
| `true`          | 任务为长期运行进程，不会自行结束（如 dev server） |
| `false`（默认） | 任务执行完毕后退出                                |

### 2.3 根 package.json 中的 scripts

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules",
    "release": "turbo run build --filter='./packages/*' && changeset publish"
  }
}
```

## 三、常用命令

### 3.1 构建

```bash
# 构建所有包
pnpm build
# 等价于
turbo run build

# 构建指定包
turbo run build --filter=@ku-utils/utils

# 构建多个指定包
turbo run build -F=@ku-utils/utils -F=@ku-utils/hooks

# 构建某个包及其所有依赖
turbo run build --filter=@ku-utils/ui...

# 只构建 packages/ 下的包（发布时常用）
turbo run build --filter='./packages/*'

# 只构建 tools/ 下的包
turbo run build --filter='./tools/*'
```

### 3.2 开发模式

```bash
# 同时启动所有包的 dev 任务
pnpm dev

# 只启动特定包的 dev
turbo run dev --filter=@ku-utils/ui

# 同时启动 UI 库和 playground 进行交互开发
turbo run dev --filter=@ku-utils/ui --filter=@ku-utils/playground-vue3
```

### 3.3 代码检查

```bash
# 全量 lint
pnpm lint

# 自动修复
pnpm lint:fix

# 只 lint 指定包
turbo run lint --filter=@ku-utils/utils

# 类型检查
pnpm typecheck
```

### 3.4 测试

```bash
# 运行所有测试
pnpm test

# 运行指定包的测试
turbo run test --filter=@ku-utils/utils
```

### 3.5 清理

```bash
# 清理所有包的 dist 目录
pnpm clean
```

## 四、--filter 过滤语法

`--filter`（简写 `-F`）是 Turborepo 最强大的功能之一，支持多种过滤模式。

### 4.1 按包名过滤

```bash
# 精确匹配包名
turbo run build --filter=@ku-utils/utils

# 多个包
turbo run build -F=@ku-utils/utils -F=@ku-utils/hooks -F=@ku-utils/ui
```

### 4.2 按目录过滤

```bash
# 某个目录下的所有包
turbo run build --filter='./packages/*'

# 只构建 tools 目录
turbo run build --filter='./tools/*'

# 指定子目录
turbo run build --filter=./packages/ui
```

### 4.3 按依赖关系过滤

```bash
# 构建 @ku-utils/ui 及其所有上游依赖包
turbo run build --filter=@ku-utils/ui...

# 构建所有依赖 @ku-utils/utils 的包（下游包）
turbo run build --filter=...@ku-utils/utils
```

### 4.4 排除过滤

```bash
# 构建除 docs 之外的所有包
turbo run build --filter='./packages/*' --filter=!@ku-utils/docs

# 排除多个包
turbo run lint --filter=!@ku-utils/ui-vue2 --filter=!@ku-utils/playground-vue2
```

### 4.5 组合过滤

```bash
# 构建 packages/ 下所有包，但排除 ui-vue2
turbo run build --filter='./packages/*' --filter=!@ku-utils/ui-vue2
```

### 4.6 直接指定包+任务（v2.2.4+）

```bash
# 无需 --filter，直接指定 包名#任务
turbo run @ku-utils/utils#build

# 多个包+任务组合
turbo run @ku-utils/utils#build @ku-utils/hooks#lint
```

## 五、缓存机制

### 5.1 本地缓存

Turborepo 默认将构建产物缓存在 `node_modules/.cache/turbo` 目录。

当以下条件全部未变化时，任务会命中缓存（显示 `cache hit`），跳过执行并直接恢复 `outputs`：

- 源码文件内容（基于哈希）
- `package.json` 中的依赖
- `turbo.json` 任务配置
- 环境变量（如果在 `env` 中声明）
- 上游依赖包的构建产物

```bash
# 正常构建
turbo run build
# 输出示例：
# @ku-utils/utils:build: cache hit, replaying logs...
# @ku-utils/hooks:build: cache hit, replaying logs...
# @ku-utils/ui:build: cache miss, executing...
```

### 5.2 强制忽略缓存

```bash
# 忽略缓存，强制重新构建
turbo run build --force

# 清理缓存后再构建
pnpm clean && pnpm build
```

### 5.3 环境变量与缓存

如果构建依赖环境变量，必须在 `turbo.json` 中声明，否则环境变量变化不会导致缓存失效。

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["API_URL", "NODE_ENV"]
    }
  }
}
```

### 5.4 全局依赖

影响所有任务缓存的文件或环境变量，在 `globalDependencies` 和 `globalEnv` 中配置：

```json
{
  "globalDependencies": ["tsconfig.json", ".env"],
  "globalEnv": ["CI", "NODE_ENV"],
  "tasks": {}
}
```

### 5.5 远程缓存（Remote Caching）

团队成员和 CI 共享构建缓存，避免重复构建。

#### 使用 Vercel 远程缓存

```bash
# 登录 Vercel（一次性）
npx turbo login

# 链接项目
npx turbo link

# 之后的 turbo run 自动使用远程缓存
turbo run build
```

#### 自托管远程缓存

如果不使用 Vercel，可以自建远程缓存服务器：

```json
// turbo.json
{
  "remoteCache": {
    "signature": true
  }
}
```

> 本项目暂未启用远程缓存。如需启用，可参考 [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) 文档。

## 六、高级配置

### 6.1 inputs 精确控制缓存键

默认情况下，包内所有文件变化都会导致缓存失效。通过 `inputs` 可以缩小监控范围：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "package.json", "tsconfig.json"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "inputs": ["src/**", "eslint.config.js"],
      "outputs": []
    }
  }
}
```

这样修改 `README.md` 不会导致 build 缓存失效。

### 6.2 包级覆盖配置

在子包中创建 `turbo.json` 可覆盖根配置：

```json
// packages/ui/turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["dist/**", "dist/style.css"]
    }
  }
}
```

`"extends": ["//"]` 表示继承根 `turbo.json`，然后局部覆盖。

### 6.3 Watch 模式

持续监听文件变化并重新执行任务：

```bash
turbo watch build
turbo watch build --filter=@ku-utils/utils
```

适合开发时自动重新构建库文件，配合 playground 使用。

### 6.4 Dry Run

查看任务执行计划而不实际执行：

```bash
# 文本格式
turbo run build --dry

# JSON 格式（适合脚本解析）
turbo run build --dry=json
```

输出示例：

```
Tasks to Run
 • @ku-utils/types#build
 • @ku-utils/constants#build
 • @ku-utils/utils#build
 • @ku-utils/hooks#build
 • @ku-utils/directives#build
 • @ku-utils/ui#build
 ...
```

### 6.5 图形可视化

生成任务依赖图：

```bash
# 在浏览器中打开交互式依赖图
turbo run build --graph

# 导出为 SVG 文件
turbo run build --graph=graph.svg

# 导出为 DOT 格式
turbo run build --graph=graph.dot
```

### 6.6 并行度控制

```bash
# 限制最大并行任务数
turbo run build --concurrency=4

# 使用 CPU 核数的 50%
turbo run build --concurrency=50%

# 完全串行（调试用）
turbo run build --concurrency=1
```

### 6.7 日志级别

```bash
# 详细输出
turbo run build --verbosity=2

# 精简输出（只显示错误）
turbo run build --output-logs=errors-only

# 只显示新任务的日志（缓存命中不输出）
turbo run build --output-logs=new-only

# 完全不显示任务日志（只显示摘要）
turbo run build --output-logs=none
```

## 七、本项目各任务执行流程

### 7.1 pnpm build

```
                    ┌─ @ku-utils/types ────────────┐
                    ├─ @ku-utils/constants ─────────┤
  第 1 层（无依赖） ├─ @ku-utils/utils ─────────────┤  并行
                    ├─ @ku-utils/i18n ──────────────┤
                    ├─ @ku-utils/prettier-config ───┤
                    ├─ @ku-utils/tsconfig ──────────┤
                    └─ @ku-utils/stylelint-config ──┘
                                │
                    ┌─ @ku-utils/hooks ─────────────┐
  第 2 层           ├─ @ku-utils/directives ────────┤  并行
                    └─ @ku-utils/eslint-config ─────┘
                                │
  第 3 层           ┌─ @ku-utils/ui ────────────────┐  并行
                    └─ @ku-utils/ui-vue2 ───────────┘
                                │
  第 4 层           ── @ku-utils/nuxt-module ────────
                                │
  第 5 层           ┌─ @ku-utils/cli ───────────────┐  并行
                    └─ @ku-utils/create-app ────────┘
```

### 7.2 pnpm release

```bash
turbo run build --filter='./packages/*' && changeset publish
```

1. 只构建 `packages/` 目录下的包（跳过 `tools/`、`apps/`）
2. 构建成功后，通过 Changesets 发布到 npmjs.org

## 八、常见问题

### Q: 为什么 dev 任务设置 `"cache": false`？

dev 是一个长期运行的开发服务器，每次运行都需要启动最新状态，缓存没有意义。`"persistent": true` 告诉 Turborepo 这个任务不会自行结束，不要等它完成再执行其他任务。

### Q: 为什么 lint 要 `dependsOn: ["^build"]`？

部分 ESLint 规则（如 `import-x` 插件）需要解析依赖包的类型声明文件，这些文件在 `dist/` 目录中。如果上游包未构建，lint 可能会报 "module not found" 错误。

### Q: 缓存命中但构建产物有问题怎么办？

```bash
# 强制忽略缓存重新构建
turbo run build --force

# 或者清理缓存后重新构建
pnpm clean && pnpm install && pnpm build
```

### Q: 如何查看哪些包会被某个 filter 选中？

```bash
turbo run build --filter='./packages/*' --dry
```

### Q: 构建很慢，如何排查？

```bash
# 查看每个任务的耗时
turbo run build --summarize

# 生成依赖图，检查是否存在不必要的依赖
turbo run build --graph
```

### Q: 为什么 test 用 `dependsOn: ["build"]` 而不是 `["^build"]`？

- `"build"`（不带 `^`）：先运行当前包自身的 build，然后再跑 test
- `"^build"`：先运行上游依赖包的 build

test 需要当前包自身先构建完成（某些测试可能导入编译产物），所以使用无 `^` 的写法。

## 九、参考链接

| 资源                | 链接                                                       |
| ------------------- | ---------------------------------------------------------- |
| Turborepo 官方文档  | https://turbo.build/repo/docs                              |
| turbo.json 配置参考 | https://turbo.build/repo/docs/reference/configuration      |
| --filter 语法参考   | https://turbo.build/repo/docs/reference/run#--filter       |
| 缓存详解            | https://turbo.build/repo/docs/core-concepts/caching        |
| 远程缓存            | https://turbo.build/repo/docs/core-concepts/remote-caching |
| GitHub 仓库         | https://github.com/vercel/turborepo                        |
