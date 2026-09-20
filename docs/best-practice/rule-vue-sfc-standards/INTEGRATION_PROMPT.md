# 接入 Prompt：rule-vue-sfc-standards

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/rules` 为主。

请在本仓库落实 Vue SFC / CSS 最佳实践（来源：ku-utils `docs/best-practice/rule-vue-sfc-standards`）。

## 目标

1. 新增或更新 `.cursor/rules/vue-standards.mdc`（或等价名），`globs` 覆盖 `**/*.{vue,scss,css}`。
2. 正文必须包含：块顺序、Vue3 script setup、CSS 禁止 `&-` 类名拼接、主题变量约定。
3. 若项目使用 ESLint flat config：确认存在 `vue/block-order`（或等价）且与规则一致。
4. 若同时维护 Vue 2：单独一小节写明 Options API / 2.7 Composition，勿与 Vue3 混为一谈。
5. 对照现有 1～2 个业务 SFC，列出不符合项（只报告，改码需用户同意或明确要求「顺手修」）。

## 完成后

给出 rule 路径、是否已接 ESLint、以及本仓推荐的 token 前缀（若无 skin 则写「待定 / 使用现有 CSS 变量」）。
