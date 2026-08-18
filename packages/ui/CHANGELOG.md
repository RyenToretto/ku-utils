# @ku-utils/ui

## 1.2.4

### Patch Changes

- 修复 DuLiquidGlass disabled 态仍渲染 edge/highlight 阴影的问题，避免透明态残留玻璃高光。

## 1.2.3

### Patch Changes

- 修复 DuLiquidFloatingBar 胶囊态左右边缘被 paint containment 裁切的问题，保留布局隔离但允许阴影和液态玻璃边缘自然绘制。

## 1.2.2

### Patch Changes

- 优化 DuLiquidFloatingBar 胶囊过渡性能：过渡期间使用轻量玻璃模式并增加布局/绘制隔离，降低液态滤镜与尺寸动画叠加时的重绘压力。

## 1.2.1

### Patch Changes

- 为液态玻璃组件增加稳定 filter id 透传能力，修复 SSR 场景下实例 uid 不一致导致的 hydration mismatch。

## 1.2.0

### Minor Changes

- 新增 DuLiquidGlass 与 DuLiquidFloatingBar 液态玻璃组件，并在 Nuxt 模块中注册新组件。

## 1.1.2

### Patch Changes

- feat(ui): 新增 Cursor rules/skills 自动安装（postinstall）
