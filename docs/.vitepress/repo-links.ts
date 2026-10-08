import { existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { MarkdownRenderer } from 'vitepress';

const DOCS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(DOCS_ROOT, '..');
const REPO_URL = 'https://github.com/RyenToretto/ku-utils';
const BRANCH = 'main';

const isRelative = (href: string) => !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href);

const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();

/**
 * 让 docs 内 md 同时适配 GitHub/IDE 与 VitePress：
 * - 链出 docs 根（.cursor / apps / packages 等）→ GitHub 仓库地址
 * - 目录链接 `./x/` 且目录只有 README.md → 指向 `x/README.md`（VitePress 只认 index.md）
 */
export function repoLinks(md: MarkdownRenderer) {
  md.core.ruler.push('ku_repo_links', (state) => {
    const file: string | undefined = state.env?.realPath ?? state.env?.path;
    if (!file) return;
    const fromDir = dirname(file);

    for (const block of state.tokens) {
      for (const token of block.children ?? []) {
        if (token.type !== 'link_open') continue;
        const href = token.attrGet('href');
        if (!href || !isRelative(href)) continue;

        const [pathPart, hash = ''] = href.split(/(?=#)/);
        if (!pathPart) continue;
        const target = resolve(fromDir, decodeURI(pathPart));

        if (target !== DOCS_ROOT && !target.startsWith(DOCS_ROOT + sep)) {
          const repoPath = relative(REPO_ROOT, target).split(sep).join('/');
          const kind = isDir(target) ? 'tree' : 'blob';
          token.attrSet('href', `${REPO_URL}/${kind}/${BRANCH}/${repoPath}${hash}`);
          continue;
        }

        if (isDir(target) && !existsSync(join(target, 'index.md')) && existsSync(join(target, 'README.md'))) {
          const base = pathPart.endsWith('/') ? pathPart : `${pathPart}/`;
          token.attrSet('href', `${base}README.md${hash}`);
        }
      }
    }
  });
}
