---
name: systematic-debugging
description: 系统化调试方法论（团队定制版）
version: 1.0.0
tags: [debugging, workflow]
---

# 系统化调试方法论

遇到 bug 时，按以下步骤排查，不要凭直觉猜测：

## 1. 收集证据

- 确认错误信息的完整内容
- 检查控制台/网络面板/日志
- 确认复现步骤

## 2. 形成假设

- 根据证据列出可能的原因（至少 3 个）
- 按概率排序

## 3. 验证假设

- 从最可能的假设开始验证
- 每次只改一个变量
- 使用 console.log / debugger / 网络抓包等工具

## 4. 修复并验证

- 修复后确认原始问题已解决
- 确认没有引入新的副作用
- 编写回归测试（如适用）

## 5. 团队常见问题

- **跨域**：检查后端 CORS 配置和代理设置
- **token 失效**：检查请求拦截器是否正确处理 401
- **构建失败**：先执行 `pnpm clean && pnpm install`
- **类型错误**：检查 tsconfig.json 是否正确继承 @ku-utils/tsconfig
