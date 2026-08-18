---
name: git-commit
description: Git 提交规范
version: 1.0.0
tags: [git, workflow]
---

# Git 提交规范

## 格式

```
type(scope): message
```

## Type

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响逻辑）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `build`: 构建相关
- `ci`: CI/CD
- `chore`: 其他

## Scope

包名：utils / hooks / ui / request / cli 等

## 示例

```
feat(hooks): add useVirtualList composable
fix(request): handle 401 token refresh race condition
docs(utils): add formatDate usage examples
```
