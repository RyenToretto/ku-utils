import type clazzManage from '@/modules/_example/clazzManage/_map';
import type clubActivity from '@/modules/_example/clubActivity/_map';
import type schoolResource from '@/modules/_example/schoolResource/_map';
import type simpleExample from '@/modules/_example/simpleExample/_map';

/**
 * 生产构建（关 Demo）的空 maps 占位（angular.json fileReplacements 指向此处，避免打入 `_example`）。
 * 类型只能引子业务 `_map`：引被替换的 `_example/_maps` 会在替换后自引用成环。
 */
interface ExampleMaps {
  simpleExample: typeof simpleExample;
  schoolResource: typeof schoolResource;
  clazzManage: typeof clazzManage;
  clubActivity: typeof clubActivity;
}

const emptyExampleMaps = {} as ExampleMaps;

export default emptyExampleMaps;
