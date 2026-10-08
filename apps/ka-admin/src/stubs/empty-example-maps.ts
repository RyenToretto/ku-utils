import type exampleMaps from '@/modules/_example/_maps';

/**
 * `business` 构建（关 Demo）的空 maps 占位（angular.json fileReplacements 指向此处，避免打入 `_example`）。
 * 使用 `import type` + 断言：IDE / ngc 仍有完整 `maps.example` 类型，运行时值为 {}。
 */
const emptyExampleMaps = {} as typeof exampleMaps;

export default emptyExampleMaps;
