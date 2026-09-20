# kv3-admin 三模块 Demo 移植设计

**日期**: 2026-09-08  
**状态**: 已批准（方案 A）  
**目标仓**: `apps/kv3-admin`  
**对照源**: `oversea-creative-web` Demo 侧栏「基础组件 / 筛选面板 / 自定义列」

## 边界

**做**

- Demo 壳收敛到 `DomainModuleShell`
- 筛选面板 9 场景 + `SimpleExampleList` 演示 props
- 基础组件补齐 6 页（含 `ScheduleTimeWeekPicker`）
- `DoFilterPanel.disableFold`
- rules/docs 增量更新

**不做**

- 业务选择器 Demo、vue-i18n / `titleKey`、整仓拷贝 oversea rules/skills
- 重写 DoFilterPanel 行高测量为 oversea `rowBottoms`（除非 layout-fold 验收失败）

## 菜单

顺序：示例管理 → 基础组件（8）→ 筛选面板（9）→ 自定义列（8）→ 多级导航。

文案中文硬编码；叶子 path 与路由一致。侧栏标题取 `route.meta.title`。

## 文件地图

见实现计划；核心新建：

- `modules/_example/doFilterPanel/**`
- ui-kit 6 个 Demo 页
- `components/ScheduleTimeWeekPicker.vue`（局部引入）
- `utils/scheduleTime.ts`（无 deprecated 别名）

## 验收

侧栏三组可进；筛选 9 场景与 ui-kit 新页无报错；自定义列回归；typecheck / lint 通过。
