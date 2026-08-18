# @ku-utils/v2-custom-columns

## 1.0.10

### Patch Changes

- fix(v2-custom-columns): 删除当前激活配置时自动回退到默认配置，修复表格进入全显模式的 bug

## 1.0.9

### Patch Changes

- fix(v2-custom-columns): DoTableHeader 补回 show-custom-config-button，恢复「自定义配置」入口

## 1.0.8

### Minor Changes

- feat(v2-custom-columns): 配置列表 hover 显示编辑/删除 icon，支持 rename 覆盖保存
  - `DoReadColumnConfig`：非系统配置项 hover 时新增 `el-icon-edit` 按钮，emit `edit` 事件；`el-icon-close` 删除按钮样式调整（蓝/红色 hover 反馈）
  - `DoTableHeader`：移除 `disabled-delete` / `show-custom-config-button`，监听 `edit` 事件调用 `showConfigColumnDialogWithRename`
  - `DoConfigColumnDialog`：新增 `showConfigColumnDialogWithRename(config)` 方法，打开抽屉后自动展开命名 popper 并预填当前 label；`doSaveToLocal` 支持同名覆盖（调用 `updateConfigInLocal`）
  - `useSchemaColumnConfig`：新增 `updateConfigInLocal(oldLabel, newLabel, columns)` 方法，支持原地 rename 和 columns 更新

## 1.0.5

### Patch Changes

- fix(v2-custom-columns): vite build 设置 target: 'es2015'，消除 CJS 产物中的 `??` / `?.` 等 ES2020+ 语法，修复 webpack 4 项目（Vue CLI 4）的解析报错

## 1.0.4

### Patch Changes

- fix(v2-custom-columns): 修正 ElementTableColumnAdapter export 为 PascalCase 命名规范

## 1.0.3

### Patch Changes

- fix(v2-custom-columns): postinstall 补充 CI 环境跳过守卫

## 1.0.2

### Patch Changes

- refactor(v2-custom-columns): transferTF 迁移至 @ku-utils/utils，新增 Cursor rules/skills 自动安装

  ### @ku-utils/v2-custom-columns
  - `transferTF` 从包内 `src/utils/helpers.js` 迁移至 `@ku-utils/utils`，通过 `workspace:*` 引用
  - 新增 `rules/`：`custom-columns-pattern.mdc`（接入规范）
  - 新增 `skills/custom-columns/SKILL.md`：完整接入 Skill，涵盖 schema 定义/模板/版本管理/FAQ
  - 新增 `scripts/postinstall.cjs`：业务项目 `npm install` 时自动将 rules/skills 复制到 `.cursor/` 目录

  ### @ku-utils/utils
  - `string.ts` 新增 `transferTF(str)`：驼峰转匈牙利命名（大写字母前加 `_` 并转小写）

## 0.2.0

### Minor Changes

- feat(v2-custom-columns): 初始版本 — Vue 2 自定义列核心能力沉淀

  从 xuanhu-ai 项目提取并解耦：
  - `useSchemaColumnConfig` mixin：schema + v-for 驱动，支持 localStorage 持久化、多套配置、版本失效
  - `ElementTableColumnAdapter`：Element UI Table 内部 store 访问适配器
  - `DoConfigColumnDialog`：三栏式自定义列配置弹窗（搜索 / 分组勾选 / 拖拽排序）
  - `DoReadColumnConfig`：配置读取选择器
  - `DoTableHeader`：表格头部容器，集成自定义列入口

  抽象解耦：移除项目特有 `$utils.transferTF`（内联实现）、`$store.dispatch`（改为可选 `onDialogClose` hook）

## 0.1.0

### Minor Changes

- 初始版本：从 xuanhu-ai 项目提取并解耦自定义列核心实现
  - `useSchemaColumnConfig` mixin：schema + v-for 驱动的列配置核心，支持 localStorage 持久化、多套配置、版本失效机制
  - `ElementTableColumnAdapter`：Element UI Table 内部 store 访问适配器，防御 removeColumn Bug
  - `DoConfigColumnDialog`：三栏式自定义列配置弹窗（左分组导航 / 中指标勾选 / 右已选列拖拽排序）
  - `DoReadColumnConfig`：localStorage 配置读取选择器
  - `DoTableHeader`：表格头部容器，集成自定义列入口按钮和弹窗
