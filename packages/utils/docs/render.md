# Render 展示格式化

`@ku-utils/utils` 提供一组展示层常用 formatter，用来替代 Vue 2 项目里的 `filter` 管道写法。

Vue 3 项目建议显式导入函数，在模板或列渲染函数中直接调用：

```vue
<script setup lang="ts">
import { emptyReplace, formatDate, formatInteger } from '@ku-utils/utils';
</script>

<template>
  <span>{{ emptyReplace(formatInteger(row.requestCount)) }}</span>
  <span>{{ formatDate(row.createdAt) }}</span>
</template>
```

## 空值兜底

### `emptyReplace(value, replaceText = '-')`

将空字符串、`null`、`undefined` 显示为兜底文案。

```ts
emptyReplace(null); // '-'
emptyReplace('', 'N/A'); // 'N/A'
emptyReplace(0); // '0'
```

## 数字展示

### `formatInteger(value, separator = true)`

整数展示，默认带千分位，适合请求数、成功数、延迟等整数列。

```ts
formatInteger(1234567); // '1,234,567'
formatInteger(1234.5); // '1,235'
formatInteger(1234, false); // '1234'
```

### `formatFloat(value, decimals = 2, separator = true)`

小数展示，默认保留 2 位并带千分位。

```ts
formatFloat(1234.5); // '1,234.50'
formatFloat(1234.567, 1); // '1,234.6'
```

### `formatMoney(value, options?)`

金额/数值展示，不附加货币符号。

```ts
formatMoney(1234.5); // '1234.50'
formatMoney(1234.5, { decimals: 1, separator: true }); // '1,234.5'
```

### `formatAmountByUnit(value, options?)`

按单位缩放后展示，适合“分转元”“万分之一元转元”“原值转万”等场景。

```ts
formatAmountByUnit(12345, { unitValue: 100, decimals: 2 }); // '123.45'
formatAmountByUnit(945128, { unitValue: 10000, suffix: '万' }); // '94.51万'
```

### `formatPercentValue(value, options?)`

百分比数值展示。输入按比例值处理，例如 `0.1234` 表示 `12.34%`。

```ts
formatPercentValue(0.1234); // '12.34'
formatPercentValue(0.1234, { showSign: true }); // '12.34%'
formatPercentValue(0.123456789, { decimals: 'auto' }); // '12.345679'
```

> `formatPercent(value, decimals)` 已存在，始终返回带 `%` 的字符串；需要控制是否显示 `%` 时使用 `formatPercentValue`。

### `formatThousands(value)`

千分位展示，保留原始小数位。

```ts
formatThousands(1234567.89); // '1,234,567.89'
```

### `formatCompactNumber(value, options?)`

超过阈值后按指定单位缩写，适合 token、用量等大数值。

```ts
formatCompactNumber(252000); // '0.25M'
formatCompactNumber(252000, { unit: '百万' }); // '0.25百万'
formatCompactNumber(12345, { unitValue: 10000, unit: '万', decimals: 1 }); // '1.2万'
```

### `formatUnitNumber(value, options?)`

按 `K/M/B` 单位缩写，适合图表短标签。

```ts
formatUnitNumber(1234); // '1K+'
formatUnitNumber(1200000, { showPlus: false, decimals: 1 }); // '1.2M'
```

### `multiplyNumber(value, options?)`

先乘以系数，再做小数和千分位格式化。

```ts
multiplyNumber(12.345, { factor: 100, decimals: 1, separator: true }); // '1,234.5'
```

## 日期与时间

### `formatDate(value, format = 'YYYY-MM-DD HH:mm:ss')`

常规日期格式化，支持 `Date`、日期字符串、10/13 位时间戳。

```ts
formatDate(1717200000000); // '2024-06-01 08:00:00'
formatDate(1717200000000, 'YYYY-MM-DD'); // '2024-06-01'
```

### `formatPlainDate(value, options?)`

无分隔符日期字符串格式化，适合旧报表字段。

```ts
formatPlainDate('202401'); // '2024-01'
formatPlainDate('20240115'); // '2024-01-15'
formatPlainDate('2024011512'); // '2024-01-15 12:00:00'
```

### `dateToWeek(value)` / `weekToDateRange(value)` / `formatWeekLabel(value)`

ISO 周格式转换，输入/输出周格式为 `YYYYWW`。

```ts
dateToWeek('2024-01-04'); // '202401'
weekToDateRange('202401'); // ['2024-01-01', '2024-01-07']
formatWeekLabel('202401'); // '2024第1周'
```

### `formatSeconds(value)` / `formatMilliseconds(value)` / `formatMicroseconds(value)`

秒、毫秒、微秒转时长字符串。

```ts
formatSeconds(3660); // '01:01:00'
formatMilliseconds(61000); // '01:01'
formatMicroseconds(3660000000); // '01:01:00'
```

## 枚举与文本

### `mapKeyToValue(code, map, fallback?)`

普通对象枚举映射，未命中时返回 `fallback` 或原 code。

```ts
const statusMap = {
  success: 'Success',
  failed: 'Failed',
};

mapKeyToValue('success', statusMap); // 'Success'
mapKeyToValue('unknown', statusMap); // 'unknown'
mapKeyToValue('unknown', statusMap, '-'); // '-'
```

### `matchMap(code, data)` / `matchObjProperty(code, sourceKey, targetKey, data)`

分别用于元组数组和对象数组映射。

```ts
matchMap('A', [['A', 'Alpha']]); // 'Alpha'
matchObjProperty(1, 'id', 'name', [{ id: 1, name: 'Admin' }]); // 'Admin'
```

### `stripHtml(value, options?)`

移除 HTML 标签，并可按字符数截断。

```ts
stripHtml('<p>Hello <strong>world</strong></p>'); // 'Hello world'
stripHtml('<p>Hello world</p>', { maxLength: 5 }); // 'Hello...'
```

## Vue 2 filter 迁移对照

| Vue 2 filter                     | 推荐函数             |
| -------------------------------- | -------------------- |
| `emptyReplace`                   | `emptyReplace`       |
| `date` / `dateFormat`            | `formatDate`         |
| `strToDate`                      | `formatPlainDate`    |
| `dateToWeek`                     | `dateToWeek`         |
| `weekToDateRange`                | `weekToDateRange`    |
| `labelWeekStr`                   | `formatWeekLabel`    |
| `thousandSeparator`              | `formatThousands`    |
| `integer`                        | `formatInteger`      |
| `float`                          | `formatFloat`        |
| `money`                          | `formatMoney`        |
| `fenMoney` / `liMoney` / `toWan` | `formatAmountByUnit` |
| `percent`                        | `formatPercentValue` |
| `multipleBy`                     | `multiplyNumber`     |
| `htmlToStr`                      | `stripHtml`          |
| `secondsToHMS`                   | `formatSeconds`      |
| `msToHMS`                        | `formatMilliseconds` |
| `usToHMS`                        | `formatMicroseconds` |
| `unitNumber`                     | `formatUnitNumber`   |
| `fileSize`                       | `formatFileSize`     |

业务枚举类 `labelXxx` 不建议沉淀到公共库。业务侧保留枚举 map，只复用 `mapKeyToValue` / `matchObjProperty` 这类通用映射函数。
