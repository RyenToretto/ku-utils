import type { Plugin } from 'esbuild';

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

function isExampleLeak(path: string): boolean {
  const normalized = normalizePath(path);
  return normalized.includes('/_example/') || normalized.endsWith('/header-example-tab.ts');
}

/**
 * 生产构建（关 Demo）时，禁止 `_example` 模块与 Header Demo 入口进入 bundle。
 * 防止静态 import / 漏配 fileReplacements 导致 Demo 上线（对齐 kr `forbid-example-in-bundle`）。
 * `replaced` 须与 `production.fileReplacements[].replace` 一致：被替换入口在 metafile 中仍以原路径出现，内容已是 stub。
 */
export default function forbidExampleInBundle(
  options: { enabled?: boolean; replaced?: string[] } = {},
): Plugin {
  const replaced = new Set((options.replaced ?? []).map(normalizePath));
  return {
    name: 'forbid-example-in-bundle',
    setup(build) {
      if (!options.enabled) return;
      build.initialOptions.metafile = true;
      build.onEnd((result) => {
        const leaks = Object.keys(result.metafile?.inputs ?? {}).filter(
          (input) => isExampleLeak(input) && !replaced.has(normalizePath(input)),
        );
        if (!leaks.length) return;
        result.errors.push({
          id: 'forbid-example-in-bundle',
          pluginName: 'forbid-example-in-bundle',
          text:
            '[forbid-example-in-bundle] 生产包禁止包含 Demo(_example / HeaderExampleTab)，' +
            `以下模块仍被引用：\n- ${leaks.join('\n- ')}\n` +
            '请仅通过 angular.json `production.fileReplacements` 换成 src/stubs 的入口引用示例模块。',
          location: null,
          notes: [],
          detail: undefined,
        });
      });
    },
  };
}
