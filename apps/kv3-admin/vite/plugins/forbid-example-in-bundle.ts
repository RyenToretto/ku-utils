import type { Plugin } from 'vite';

function isExampleLeak(moduleId: string): boolean {
  const normalized = moduleId.replace(/\\/g, '/');
  return (
    normalized.includes('/_example/') ||
    normalized.endsWith('/HeaderExampleTab.vue') ||
    normalized.endsWith('/headerExampleTabEntry.ts')
  );
}

/**
 * 当未启用 Demo 时，禁止 `_example` 模块与 Header Demo 入口进入最终 bundle。
 * 防止静态 import / 漏改 alias 导致 Demo 上线。
 */
export function forbidExampleInBundle(useExample: boolean): Plugin {
  return {
    name: 'forbid-example-in-bundle',
    apply: 'build',
    generateBundle(_options, bundle) {
      if (useExample) return;
      const leaks: string[] = [];
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk') continue;
        const hit = output.moduleIds?.some((id) => isExampleLeak(id));
        if (hit) leaks.push(fileName);
      }
      if (leaks.length) {
        throw new Error(
          `[forbid-example-in-bundle] 生产包禁止包含 Demo(_example / HeaderExampleTab)，以下 chunk 仍引用了示例模块：\n- ${leaks.join('\n- ')}\n请确认 VITE_APP_USE_EXAMPLE≠1，且仅通过 @example-* / @header-example-tab alias 引用。`,
        );
      }
    },
  };
}
