---
name: utils
description: 使用 @ku-utils/utils 处理日期、字符串、存储、URL、校验、DOM 等通用场景。当用户需要处理上述类型数据、询问"怎么格式化日期/手机号脱敏/本地存储"等时使用。
---

# @ku-utils/utils Skill

零依赖纯函数工具库，覆盖前端常见的数据处理场景。

## 安装

```bash
npm install @ku-utils/utils
```

## 模块速查

| 模块     | 代表函数                                                                            | 说明                 |
| -------- | ----------------------------------------------------------------------------------- | -------------------- |
| string   | `camelCase` `kebabCase` `snakeCase` `truncate` `maskPhone` `maskEmail` `maskIdCard` | 字符串转换与脱敏     |
| date     | `formatDate` `formatTime` `getRelativeTime` `daysAgo` `isToday` `formatDuration`    | 日期格式化           |
| storage  | `local` `session`                                                                   | 带过期时间的存储封装 |
| url      | `parseQuery` `buildQuery` `getUrlParam`                                             | URL 处理             |
| validate | `isEmail` `isMobile` `isUrl` `isIdCard`                                             | 校验函数             |
| object   | `deepClone` `pick` `omit` `merge` `flattenObject`                                   | 对象操作             |
| array    | `groupBy` `unique` `chunk` `flatten` `intersection`                                 | 数组操作             |
| is       | `isString` `isNumber` `isArray` `isObject` `isEmpty`                                | 类型判断             |
| dom      | `addClass` `removeClass` `getStyle` `scrollTo`                                      | DOM 操作             |
| device   | `isMobile` `isIOS` `isAndroid` `isWechat`                                           | 设备检测             |
| number   | `formatNumber` `toFixed` `clamp` `random`                                           | 数字处理             |
| file     | `formatFileSize` `getFileExtension` `isImageFile`                                   | 文件工具             |
| uuid     | `uuid`                                                                              | UUID 生成            |

## 常用示例

### 日期处理

```ts
import {
  formatDate,
  formatTime,
  getRelativeTime,
  daysAgo,
  isToday,
  formatDuration,
} from '@ku-utils/utils';

// 格式化
formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'); // '2026-01-01 12:00:00'
formatDate('2026-01-01'); // '2026-01-01'（默认格式）
formatTime(1700000000000); // 时间戳 → '2023-11-15 06:13:20'

// 相对时间
getRelativeTime(Date.now() - 3600_000); // '1 小时前'
isToday(new Date()); // true
daysAgo(7); // 7天前的 Date

// 时长格式化
formatDuration(3661); // '1小时1分1秒'
```

### 字符串处理

```ts
import {
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  maskPhone,
  maskEmail,
  maskIdCard,
} from '@ku-utils/utils';

camelCase('user-name'); // 'userName'
kebabCase('userName'); // 'user-name'
snakeCase('userName'); // 'user_name'
truncate('超长文本内容', 6); // '超长文本内容...' (按字符数)
maskPhone('13812345678'); // '138****5678'
maskEmail('user@example.com'); // 'us***@example.com'
maskIdCard('110101199001011234'); // '1101**********1234'
```

### 本地存储（带过期）

```ts
import { local, session } from '@ku-utils/utils';

// 设置（支持过期时间，毫秒）
local.set('token', 'abc123', 24 * 3600_000); // 24小时后过期
local.set('config', { theme: 'dark' }); // 永不过期

// 读取（过期自动返回 null）
const token = local.get<string>('token'); // string | null
const config = local.get<{ theme: string }>('config');

// 删除 / 清空
local.remove('token');
local.clear();

// session 同理
session.set('step', 2);
session.get<number>('step'); // 2 | null
```

### 校验

```ts
import { isEmail, isMobile, isUrl, isIdCard, isNumber } from '@ku-utils/utils';

isEmail('user@do.com'); // true
isMobile('13812345678'); // true（中国手机号）
isUrl('https://ku-utils.com'); // true
isIdCard('110101199001011234'); // true（18位身份证）
isNumber('123.45'); // true
```

### 对象操作

```ts
import { deepClone, pick, omit, merge } from '@ku-utils/utils';

const clone = deepClone({ a: { b: 1 } }); // 深拷贝
pick({ a: 1, b: 2, c: 3 }, ['a', 'c']); // { a: 1, c: 3 }
omit({ a: 1, b: 2, c: 3 }, ['b']); // { a: 1, c: 3 }
merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }（深合并）
```

### 数组操作

```ts
import { groupBy, unique, chunk, flatten } from '@ku-utils/utils';

groupBy([{ type: 'a' }, { type: 'b' }, { type: 'a' }], 'type');
// => { a: [{type:'a'},{type:'a'}], b: [{type:'b'}] }

unique([1, 2, 2, 3]); // [1, 2, 3]
chunk([1, 2, 3, 4, 5], 2); // [[1,2],[3,4],[5]]
flatten([
  [1, 2],
  [3, [4, 5]],
]); // [1,2,3,4,5]
```

### 设备检测

```ts
import { isMobile, isIOS, isAndroid, isWechat } from '@ku-utils/utils';

if (isMobile()) {
  /* 移动端逻辑 */
}
if (isWechat()) {
  /* 微信内逻辑 */
}
```

## Vite auto-import 配置

```ts
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite';
import { kuUtilsUtilsImports } from '@ku-utils/utils/auto-import';

export default {
  plugins: [
    AutoImport({
      imports: [kuUtilsUtilsImports],
    }),
  ],
};
```

配置后，`formatDate`、`local`、`isEmail` 等函数无需 import 即可在 .ts/.vue 中直接使用。
