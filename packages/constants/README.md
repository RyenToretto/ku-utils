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

## AI Skill

安装后自动同步至 `.cursor/skills/constants/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/constants 中的 HTTP 状态码、分页默认值、文件限制、存储 Key、正则等共享常量。当需要引用 HTTP 状态码、分页配置、文件类型/大小限制时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
