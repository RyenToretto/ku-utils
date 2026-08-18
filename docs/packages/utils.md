# Utils 工具函数

`@ku-utils/utils` 为零框架依赖的纯函数工具库，适用于任意 TS/JS 项目。

## 安装

```bash
pnpm add @ku-utils/utils
```

## 使用示例

```typescript
import { debounce, formatDate, parseQuery } from '@ku-utils/utils';

const onResize = debounce(() => console.log('resize'), 300);
console.log(formatDate(new Date()));
console.log(parseQuery('?a=1&b=2'));
```

## 导出清单

### 日期 `date`

- `formatDate`、`isToday`、`daysAgo`、`timeAgo`

### 数字 `number`

- `formatThousands`、`formatCurrency`、`formatPercent`、`clamp`、`randomInt`

### 字符串 `string`

- `camelCase`、`kebabCase`、`snakeCase`、`capitalize`
- `maskPhone`、`maskEmail`、`maskIdCard`、`truncate`

### 存储 `storage`

- `local`、`session`：带可选过期时间的 `set` / `get` / `remove` / `clear` 封装

### URL `url`

- `parseQuery`、`buildQuery`、`joinUrl`

### 函数 `function`

- `debounce`、`throttle`、`deepClone`、`sleep`、`retry`

### 文件 `file`

- `downloadBlob`、`downloadUrl`、`formatFileSize`、`getFileExtension`、`isImageFile`

### 类型判断 `is`

- `isClient`、`isServer`
- `isString`、`isNumber`、`isBoolean`、`isObject`、`isArray`、`isFunction`、`isNullish`、`isEmpty`
- `isPhone`、`isEmail`、`isUrl`、`isIdCard`
