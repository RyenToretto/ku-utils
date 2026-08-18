# skins/

`theme-juxiao-lark`（当前默认皮肤）和 `_el-base.scss` 已经迁到
[`@ku-utils/skin`](../../../../../../packages/skin)，`main.ts` 直接
`import '@ku-utils/skin'`，不再从本目录读取。业务代码统一直接消费
`--ku-*`，不存在旧变量名的兼容桥接层。

本目录剩下的 10 套 `theme-juxiao-*.scss`（`breeze` / `dusk` / `ember` / `glen` /
`honey` / `hextech` / `indigo` / `iris` / `orchid` / `sky`）**没有被任何地方
import**，只作为迁到 `packages/skin/src/themes/*.js` 的原始数据保留。要让某一套
在本仓生效：

1. 参考 [`packages/skin/src/themes/lark.js`](../../../../../../packages/skin/src/themes/lark.js)
   的形状，把对应 scss 里的色值抄成 `themes/<name>.js`；
2. 跑 `pnpm --filter @ku-utils/skin build` 生成 `dist/<name>.css`；
3. `main.ts` 把 `import '@ku-utils/skin'` 换成 `import '@ku-utils/skin/<name>'`。
