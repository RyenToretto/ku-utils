---
name: web-design-guidelines
description: Web 界面设计指南
version: 1.0.0
tags: [design, accessibility, ui]
---

# Web 界面设计指南

## 无障碍

- 所有可交互元素必须可键盘操作
- 图片必须有 alt 属性
- 颜色对比度满足 WCAG 2.1 AA 标准
- 使用语义化 HTML 标签

## 性能

- 图片使用懒加载（@ku-utils/directives 的 v-lazy-load）
- 长列表使用虚拟滚动
- 合理使用 v-show vs v-if

## 交互

- 按钮需有 loading 状态防止重复提交
- 表单验证使用实时反馈
- 空状态使用 @ku-utils/ui 的 DuEmpty 组件
- 操作反馈不超过 3 秒
