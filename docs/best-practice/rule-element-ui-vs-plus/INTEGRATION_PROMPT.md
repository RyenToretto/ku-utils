# 接入 Prompt：rule-element-ui-vs-plus

> 本 Prompt 供 **本项目或其他项目** 参考接入用；适用于 Element UI（Vue 2）与 Element Plus（Vue 3）并存或迁移期。

请在本仓库落实 Element UI ↔ Element Plus 移植与视觉对齐最佳实践（来源：ku-utils `docs/best-practice/rule-element-ui-vs-plus`）。

## 目标

1. 确认哪一端是视觉金标（通常 Element Plus 端），并约定「对齐的是金标端浏览器计算样式，不是 SCSS 源码数值」。
2. 在 Element UI 端添加 `.cursor/rules/element-ui-vs-plus.mdc`：globs 挂该端 `src/**/*.{vue,scss,css,ts}`；正文含落点分层、移植对照表、已知语义差异、验收步骤（控制在百行内）。
3. 颜色：若仍直接引入 `element-ui/lib/theme-chalk/index.css` 再手写换色覆写，提出改为构建期生成器（chalk 字面量按属性语境映射到 CSS 变量，未映射即失败）的方案，**征得同意后再改**。
4. 添加审计脚本（不存在的 `.el-*` 类名、未声明变量、EP 专有 prop），挂到 `prebuild`。
5. 若存在从 Element Plus 端复制来的样式 / 模板：列出命中审计的文件与修改计划，先给计划再动手。

## 完成后

给出 rule 路径、审计脚本命令与当前问题数、以及需要人工对比验收的组件清单。
