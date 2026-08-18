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

---

详细文档请参考 [ku-utils 文档站](../../docs/)
