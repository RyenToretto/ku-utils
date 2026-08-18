---
name: nuxt-module
description: 在 Nuxt 4 项目中集成 @ku-utils/nuxt-module，一键启用 hooks auto-import、组件注册、指令、CSS tokens。
---

# @ku-utils/nuxt-module Skill

Nuxt 4 集成模块，一键注入 ku-utils 全套工具链。

## 安装

```bash
npm install @ku-utils/nuxt-module
```

## 基础配置

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ku-utils/nuxt-module'],

  kuUtils: {
    components: true, // DuButton, DuEmpty, DuModal, DuStatusTag
    composables: true, // useRequest, usePagination, useClipboard 等
    directives: true, // v-permission, v-loading, v-copy 等
    css: true, // design-tokens CSS vars + ui style
  },
});
```

## 可用 Composables（auto-import，无需手动 import）

```ts
// 以下在 <script setup> 中直接可用，无需 import

const { data, loading, execute } = useRequest(() => fetchUser());
const { list, total, fetch } = usePagination(({ page, pageSize }) => getList({ page, pageSize }));
const { copy, copied } = useClipboard();
// useCountdown 返回 count（不是 remaining），isActive（不是 isRunning）
const { count, isActive, start } = useCountdown(60);
// useBreakpoint 返回 { sm, md, lg, xl, xxl }（布尔 Ref），无 isMobile/isTablet
const { sm, md, lg } = useBreakpoint();
const isMobile = computed(() => !md.value); // 自行派生
// useDialogState 返回 show/hide（不是 open/close）
const { visible, show, hide } = useDialogState();
const { columns } = useResponsiveColumns();
```

## 可用组件（auto-import，无需注册）

```html
<!-- 直接在模板中使用，无需 import 或 components 注册 -->
<DuEmpty description="暂无数据" />
<DuButton type="primary">提交</DuButton>
<DuStatusTag status="success">成功</DuStatusTag>
<DuModal
  v-model:visible="visible"
  title="弹窗"
>
  内容
</DuModal>
```

## 可用指令（auto-install，无需注册）

```html
<el-button v-permission="'admin'">管理</el-button>
<div v-loading="isLoading">内容</div>
<span v-copy="'复制文本'">点击复制</span>
```

## 选择性禁用

```ts
// 只启用 composables，不引入组件和 CSS
kuUtils: {
  components: false,
  composables: true,
  directives: false,
  css: false,
}
```

## SSR 注意事项

- 模块已自动将 `@ku-utils/hooks` 加入 `build.transpile`，无需手动配置
- `useStorage`（操作 localStorage）在 SSR 端会安全降级
- `useWebSocket` 仅在客户端工作，SSR 中不会建立连接
