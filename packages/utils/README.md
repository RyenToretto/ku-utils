# @ku-utils/utils

> 纯函数工具库（零框架依赖），涵盖日期、数字、字符串、存储等常用模块。

## 安装

```bash
pnpm add @ku-utils/utils
```

## 模块

`date` · `number` · `string` · `storage` · `url` · `function` · `file` · `is`

## 使用

```ts
import { formatCurrency, clamp } from '@ku-utils/utils';

formatCurrency(1234.5); // '1,234.50'
clamp(15, 0, 10); // 10
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

## AI Skill

安装后自动同步至 `.cursor/skills/utils/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/utils 处理日期、字符串、存储、URL、校验、DOM 等通用场景。当需要处理上述类型数据时使用。

同时会在消费项目缺少 `docs/render.md` 时自动写入展示格式化说明文档，便于迁移 Vue 2 filter 和表格渲染 formatter。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
