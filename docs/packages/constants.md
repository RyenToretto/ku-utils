# Constants 常量

`@ku-utils/constants` 集中维护常用正则，避免各项目复制粘贴。

## 安装

```bash
pnpm add @ku-utils/constants
```

## 使用示例

```typescript
import { REGEX } from '@ku-utils/constants';

const ok = REGEX.PHONE.test('13800138000');
```

## 导出概要

- `REGEX`：`PHONE`、`EMAIL`、`URL`、`ID_CARD`、`CHINESE`、`INTEGER`、`POSITIVE_INTEGER`、`DECIMAL`、`IP_V4`、`PASSWORD_STRONG`
