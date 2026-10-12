# @ku-utils/skin

## 0.2.0

### Minor Changes

- c5d99b5: 新增 `@ku-utils/skin/tokens` 导出：tome 明暗两套已解析色值（键名同 `--ku-*` 去前缀），供 antd 等 JS 主题系统派生色阶
- 31b0c0e: 新增状态色色阶 token `--ku-color-{primary,success,warning,danger,info}-light-1..9` / `-dark-2` / `-rgb`（明暗各一套，算法同 Element Plus），供 antd / ng-zorro 等非 Element 栈与 Element Plus 同值取色；`--el-*` 结构变量与色阶改为转发到 `--ku-*` 并声明在 `:root, html.dark` 共享块，修复先引入 Element Plus `dark/css-vars.css` 时暗色被其灰色系压过（skin 须在其后引入）
