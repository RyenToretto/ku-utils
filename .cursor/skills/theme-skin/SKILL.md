---
name: theme-skin
description: >-
  @ku-utils/skin 统一皮肤与 Design Token。新增/修改 token、换肤、v-loading 遮罩色、
  Element Plus --el-* 桥接、packages 内 var(--ku-*, fallback) 写法时使用。
---

# Theme Skin（@ku-utils/skin）

真源：`packages/skin` + [`TOKEN.md`](../../../packages/skin/TOKEN.md)。  
契约：**新增 token → minor；改名/删除 → major**。

## 核心原则

1. **唯一语义前缀** `--ku-*`；apps **不自建**第二套色板文件。
2. **packages 内必须带 fallback**：`var(--ku-xxx, <lark 浅色值>)`，不把 skin CSS 打进组件库产物。
3. 应用入口只 import **一套**生成后的皮肤 CSS（如 lark）；换肤改 import，不搞运行时多皮肤切换除非产品明确要求。
4. 明暗只认 `html.dark`（禁止 `data-theme` / 页面自造暗色选择器当主方案）。

## mask ≠ overlay（强制）

| 变量                               | 用途                  | token                      |
| ---------------------------------- | --------------------- | -------------------------- |
| `--el-mask-color`                  | 表格/区域 `v-loading` | **浅色** `--ku-loading-bg` |
| `--el-overlay-color`（及弹层遮罩） | Dialog/Drawer 遮罩    | **深色** `--ku-bg-overlay` |

禁止把 loading mask 指到深色 overlay（会出大黑罩）。

## 何时读 TOKEN.md

- 新增组件要用颜色/间距/圆角/阴影/层级
- 改 Element Plus 结构变量映射
- 评审是否破坏性变更（改名删除）

## 生成与校验

```bash
pnpm --filter @ku-utils/skin build   # 或包内 generate 脚本
```

改 `src/themes/*.js` / base tokens 后必须重新生成 CSS，再在 playground / kv3-admin 看 loading 与弹层。

## 禁止

- apps 复制一份 hex 色板当「本地皮肤」
- packages 写死品牌 hex 且无 `--ku-*` fallback
- mask / overlay 混用
