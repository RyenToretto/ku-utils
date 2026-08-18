# @ku-utils/constants

> 枚举、常量与正则表达式集合。

## 安装

```bash
pnpm add @ku-utils/constants
```

## 包含内容

`HttpStatus` · `ContentType` · `PAGINATION` · `REGEX` 等

## 使用

```ts
import { HttpStatus, REGEX } from '@ku-utils/constants';

if (status === HttpStatus.OK) {
  /* ... */
}
REGEX.email.test('a@b.com'); // true
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
