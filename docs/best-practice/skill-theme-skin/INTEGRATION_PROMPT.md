# 接入 Prompt：skill-theme-skin

> 本 Prompt 供 **本项目或其他项目** 参考接入用；落地目标以 `.cursor/skills` 为主。

请在本仓库落实统一皮肤 / Design Token 最佳实践（来源：ku-utils `docs/best-practice/skill-theme-skin`）。

## 目标

1. 若可使用 `@ku-utils/skin`：在应用入口引入金标皮肤（`import '@ku-utils/skin'` = `tome`）；删除 apps 内重复的皮肤/色板文件（先列清单再删，危险操作需确认）。
2. 添加 `.cursor/skills/theme-skin/SKILL.md`：如何选 token、packages fallback 写法、禁止第二套变量。
3. 检查 Element Plus 相关 CSS 变量：
   - `v-loading` / `--el-mask-color` 必须指向**浅色 loading** token
   - 对话框遮罩走 overlay 类变量，不能与 mask 共用深色 overlay
4. 在 rule 或 docs 中链到 token 契约（本生态为 `packages/skin/TOKEN.md`）。
5. 若仓内自有前缀（非 `--ku-*`）：保留前缀，但采纳「单一真源 + mask/overlay 分离 + 组件 fallback」原则。

## 完成后

说明入口 CSS 路径、mask/overlay 映射、以及是否仍有 apps 自建色板。
