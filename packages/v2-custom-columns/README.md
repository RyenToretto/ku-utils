# @ku-utils/v2-custom-columns

> Vue 2 自定义列组件库 — schema + v-for 驱动，支持多套配置持久化、拖拽排序、分组导航。

## 安装

```bash
pnpm add @ku-utils/v2-custom-columns
```

## 核心概念

- **ColumnSchema**：描述列的结构（label、key、visible、width、cellComponent 等）
- **useSchemaColumnConfig**：mixin，负责加载/保存多套列配置、与后端持久化同步
- **模板写法**：扁平列表或嵌套分组，通过 `v-for` 驱动渲染

## 使用

```js
// 定义 schema
export const userTableColumnSchemas = [
  { key: 'name', label: '姓名', visible: true, width: 120 },
  { key: 'email', label: '邮箱', visible: true },
];
```

```vue
<template>
  <CustomColumnConfig
    :schemas="schemas"
    @change="onSchemaChange"
  />
</template>

<script>
import { useSchemaColumnConfig } from '@ku-utils/v2-custom-columns';
import { userTableColumnSchemas } from './userTableColumnSchemas';

export default {
  mixins: [useSchemaColumnConfig('user-table', userTableColumnSchemas)],
};
</script>
```

## AI Skill

安装后自动同步至 `.cursor/skills/v2-custom-columns/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/v2-custom-columns 为 Vue 2 table 页面实现自定义列能力。当用户要给一个新页面接入自定义列、新增/修改列 schema、迁移旧 tableControl 页面时使用。

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
