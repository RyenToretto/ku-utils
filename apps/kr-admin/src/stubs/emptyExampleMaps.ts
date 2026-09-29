import type exampleMaps from '@/modules/_example/_maps';

/**
 * 生产/关闭 Demo 时的空 maps 占位（Vite alias 指向此处，避免打入 `_example`）。
 * 使用 `import type` + 断言：IDE/vue-tsc 仍有完整 `$MAPS.example` 类型，运行时值为 {}。
 */
const emptyExampleMaps = {} as typeof exampleMaps;

export default emptyExampleMaps;
