---
name: ui-vue2
description: 使用 @ku-utils/ui-vue2 的 Vue 2 业务组件（维护模式）。Vue 2 项目中需要 DuButton、DuEmpty、DuStatusTag 时使用。
---

# @ku-utils/ui-vue2 Skill

Vue 2 兼容的业务 UI 组件子集，**维护模式**（仅 Bug 修复）。

## 安装

```bash
npm install @ku-utils/ui-vue2
```

## 注册方式

```js
// main.js — 全局注册（推荐）
import { install } from '@ku-utils/ui-vue2';
import '@ku-utils/ui-vue2/style';
Vue.use(install);

// 按需注册
import { DuButton, DuEmpty, DuStatusTag } from '@ku-utils/ui-vue2';
Vue.component('DuButton', DuButton);
Vue.component('DuEmpty', DuEmpty);
Vue.component('DuStatusTag', DuStatusTag);
```

## DuEmpty — 空态

```html
<DuEmpty description="暂无数据" />
<DuEmpty
  description="加载失败"
  icon="error"
>
  <template v-slot:action>
    <el-button @click="reload">重新加载</el-button>
  </template>
</DuEmpty>
```

## DuButton — 按钮

```html
<DuButton @click="handleClick">默认</DuButton>
<DuButton
  type="primary"
  :loading="isLoading"
  @click="submit"
>
  提交
</DuButton>
<DuButton
  type="danger"
  @click="handleDelete"
>
  删除
</DuButton>
<DuButton :disabled="!isValid">保存</DuButton>
```

## DuStatusTag — 状态标签

```html
<DuStatusTag status="success">成功</DuStatusTag>
<DuStatusTag status="warning">处理中</DuStatusTag>
<DuStatusTag status="error">已失败</DuStatusTag>
<DuStatusTag status="info">待审核</DuStatusTag>
<DuStatusTag status="default">未开始</DuStatusTag>

<!-- 表格列中使用 -->
<el-table-column label="状态">
  <template slot-scope="{ row }">
    <DuStatusTag :status="getStatus(row.status)">{{ STATUS_LABELS[row.status] }}</DuStatusTag>
  </template>
</el-table-column>
```

## 注意

- 如需 DuCard、DuModal，请直接用 Element UI 的 `el-card`/`el-dialog`
- Vue 3 项目请改用 `@ku-utils/ui`
