---
name: constants
description: 使用 @ku-utils/constants 中的 HTTP 状态码、分页默认值、文件限制、存储 Key、正则等共享常量。当需要引用 HTTP 状态码、分页配置、文件类型/大小限制时使用。
---

# @ku-utils/constants Skill

跨项目共享的常量、枚举和正则。

## 安装

```bash
npm install @ku-utils/constants
```

## 常量速查

### HTTP 相关

```ts
import { HttpStatus, ContentType, RequestMethod } from '@ku-utils/constants';

// HttpStatus 枚举
HttpStatus.OK; // 200
HttpStatus.CREATED; // 201
HttpStatus.NO_CONTENT; // 204
HttpStatus.BAD_REQUEST; // 400
HttpStatus.UNAUTHORIZED; // 401
HttpStatus.FORBIDDEN; // 403
HttpStatus.NOT_FOUND; // 404
HttpStatus.INTERNAL_SERVER_ERROR; // 500

// ContentType 枚举
ContentType.JSON; // 'application/json'
ContentType.FORM_DATA; // 'multipart/form-data'
ContentType.FORM_URLENCODED; // 'application/x-www-form-urlencoded'

// RequestMethod 枚举
RequestMethod.GET / POST / PUT / PATCH / DELETE;
```

### 分页

```ts
import { PAGINATION } from '@ku-utils/constants';

PAGINATION.DEFAULT_PAGE; // 1
PAGINATION.DEFAULT_PAGE_SIZE; // 10
PAGINATION.PAGE_SIZES; // [10, 20, 50, 100]
```

### 文件限制

```ts
import { FILE_SIZE_LIMIT, FILE_ACCEPT, FILE_TYPE } from '@ku-utils/constants';

FILE_SIZE_LIMIT.IMAGE; // 5 * 1024 * 1024   (5MB)
FILE_SIZE_LIMIT.DOCUMENT; // 20 * 1024 * 1024  (20MB)
FILE_SIZE_LIMIT.VIDEO; // 200 * 1024 * 1024 (200MB)
FILE_SIZE_LIMIT.AVATAR; // 2 * 1024 * 1024   (2MB)

FILE_ACCEPT.IMAGE; // '.jpg,.jpeg,.png,.gif,.webp,.svg'
FILE_ACCEPT.DOCUMENT; // '.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt'
FILE_ACCEPT.VIDEO; // '.mp4,.avi,.mov,.wmv,.mkv'
FILE_ACCEPT.EXCEL; // '.xls,.xlsx,.csv'
```

### 存储 Key

```ts
import { StorageKey } from '@ku-utils/constants';

// 与 @ku-utils/utils 的 local/session 搭配使用
import { local } from '@ku-utils/utils';

local.set(StorageKey.TOKEN, 'xxx');
local.get(StorageKey.USER_INFO);
local.get(StorageKey.LANGUAGE);
local.get(StorageKey.THEME);

// StorageKey 枚举值
StorageKey.TOKEN; // 'ku_utils_token'
StorageKey.REFRESH_TOKEN; // 'ku_utils_refresh_token'
StorageKey.USER_INFO; // 'ku_utils_user_info'
StorageKey.LANGUAGE; // 'ku_utils_language'
StorageKey.THEME; // 'ku_utils_theme'
```

### 正则

```ts
import { REGEX } from '@ku-utils/constants';

REGEX.EMAIL.test('user@do.com'); // true
REGEX.MOBILE.test('13812345678'); // true（中国手机号）
REGEX.URL.test('https://ku-utils.com'); // true
REGEX.ID_CARD.test('110101199001011234'); // true
REGEX.POSITIVE_INT.test('123'); // true
```

## 常见场景

### 请求响应处理

```ts
import { HttpStatus } from '@ku-utils/constants';

function handleResponse(res: { code: number; data: unknown }) {
  switch (res.code) {
    case HttpStatus.OK:
      return res.data;
    case HttpStatus.UNAUTHORIZED:
      router.push('/login');
      break;
    case HttpStatus.FORBIDDEN:
      message.error('无权限');
      break;
    default:
      message.error('请求失败');
  }
}
```

### 文件上传校验

```ts
import { FILE_SIZE_LIMIT, FILE_ACCEPT } from '@ku-utils/constants'

function validateFile(file: File) {
  if (file.size > FILE_SIZE_LIMIT.IMAGE) {
    return '图片大小不能超过 5MB'
  }
  return null
}

// el-upload 的 accept 属性
<el-upload :accept="FILE_ACCEPT.IMAGE" />
```

### 分页组件

```ts
import { PAGINATION } from '@ku-utils/constants'

const pageConfig = reactive({
  page: PAGINATION.DEFAULT_PAGE,
  pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
})

// el-pagination 的 page-sizes
<el-pagination :page-sizes="PAGINATION.PAGE_SIZES" />
```
