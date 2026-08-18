# Constants 常量

`@ku-utils/constants` 集中维护枚举、分页默认值、文件限制与常用正则，避免各项目复制粘贴。

## 安装

```bash
pnpm add @ku-utils/constants
```

## 使用示例

```typescript
import { HttpStatus, PAGINATION, REGEX } from '@ku-utils/constants';

if (res.status === HttpStatus.OK) {
  console.log(PAGINATION.DEFAULT_PAGE_SIZE);
}
const ok = REGEX.PHONE.test('13800138000');
```

## 导出概要

### `regex`

- `REGEX`：`PHONE`、`EMAIL`、`URL`、`ID_CARD`、`CHINESE`、`INTEGER`、`POSITIVE_INTEGER`、`DECIMAL`、`IP_V4`、`PASSWORD_STRONG`

### `http`

- `HttpStatus`、`ContentType`、`RequestMethod`

### `common`

- `StorageKey`：`TOKEN`、`REFRESH_TOKEN`、`USER_INFO`、`LANGUAGE`、`THEME`
- `PAGINATION`：`DEFAULT_PAGE`、`DEFAULT_PAGE_SIZE`、`PAGE_SIZES`
- `FILE_SIZE_LIMIT`：`IMAGE`、`DOCUMENT`、`VIDEO`、`AVATAR`
- `FILE_ACCEPT`：`IMAGE`、`DOCUMENT`、`VIDEO`、`AUDIO`、`EXCEL`
