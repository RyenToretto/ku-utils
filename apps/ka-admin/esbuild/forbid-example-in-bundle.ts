import type { Plugin } from 'esbuild';

function isExampleLeak(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');
  return normalized.includes('/_example/') || normalized.endsWith('/header-example-tab.ts');
}

/**
 * `business` 构建（关 Demo）时，禁止 `_example` 模块与 Header Demo 入口进入 bundle。
 * 防止静态 import / 漏配 fileReplacements 导致 Demo 上线（对齐 kr `forbid-example-in-bundle`）。
 */
export default function forbidExampleInBundle(options: { enabled?: boolean } = {}): Plugin {
  return {
    name: 'forbid-example-in-bundle',
    setup(build) {
      if (!options.enabled) return;
      build.initialOptions.metafile = true;
      build.onEnd((result) => {
        const leaks = Object.keys(result.metafile?.inputs ?? {}).filter(isExampleLeak);
        if (!leaks.length) return;
        result.errors.push({
          id: 'forbid-example-in-bundle',
          pluginName: 'forbid-example-in-bundle',
          text:
            '[forbid-example-in-bundle] business 构建禁止包含 Demo(_example / HeaderExampleTab)，' +
            `以下模块仍被引用：\n- ${leaks.join('\n- ')}\n` +
            '请仅通过 angular.json `business.fileReplacements` 换成 src/stubs 的入口引用示例模块。',
          location: null,
          notes: [],
          detail: undefined,
        });
      });
    },
  };
}
