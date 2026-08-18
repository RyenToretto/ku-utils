# ku-utils 团队 Skills

本目录为 Cursor / Agent 可引用的团队定制 Skill，与 `.cursor/rules/` 中的规则互补：规则偏约束，Skill 偏流程与示例。

| Skill                                                                       | 说明                                                        |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [vue-best-practices](./vue-best-practices/SKILL.md)                         | Vue 2/3 组件结构、类型声明、CSS 与 @ku-utils/\* 包使用约定  |
| [systematic-debugging](./systematic-debugging/SKILL.md)                     | 系统化排错步骤与团队常见问题（跨域、401、构建、类型）       |
| [frontend-design](./frontend-design/SKILL.md)                               | 设计令牌、组件优先级、BEM 类名与响应式 hooks                |
| [git-commit](./git-commit/SKILL.md)                                         | Conventional Commits 式提交：`type(scope): message`         |
| [verification-before-completion](./verification-before-completion/SKILL.md) | 宣称完成前的 lint、typecheck、build、test、changeset 等清单 |
| [web-design-guidelines](./web-design-guidelines/SKILL.md)                   | 无障碍、性能与交互（含 DuEmpty、懒加载等）                  |

在 Cursor 中可将 `skills/<name>/SKILL.md` 作为项目级 Skill 路径配置，或按需复制到个人 `~/.agents/skills/` 使用。
