/**
 * Pinia 依赖的 vue-demi 在 Vue 2.7 下偶发停留在 isVue3=true（postinstall 未跑或被切回），
 * 会导致 Options Store 的 state 以 Ref 暴露（如 theme 变成 Object）并触发 toRefs 警告。
 * 强制切到 vue-demi 的 2.7 入口（isVue2=true，走 Vue.set 路径）。
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(fileURLToPath(import.meta.url));

function resolveVueDemiDir() {
  const piniaDir = path.dirname(require.resolve('pinia/package.json'));
  return path.dirname(require.resolve('vue-demi/package.json', { paths: [piniaDir] }));
}

function readFlags(demiDir) {
  // 清缓存，避免 switch 后仍读到旧入口
  const cjs = path.join(demiDir, 'lib/index.cjs');
  const mjs = path.join(demiDir, 'lib/index.mjs');
  delete require.cache[cjs];
  delete require.cache[mjs];
  return require(cjs);
}

const demiDir = resolveVueDemiDir();
const before = readFlags(demiDir);

if (before.isVue2 === true && before.isVue3 === false) {
  console.log('[kv2-admin] vue-demi already on Vue 2.7 mode');
  process.exit(0);
}

console.log(
  `[kv2-admin] vue-demi was isVue2=${before.isVue2} isVue3=${before.isVue3}, switching to 2.7…`,
);

const cli = path.join(demiDir, 'bin/vue-demi-switch.js');
const result = spawnSync(process.execPath, [cli, '2.7'], {
  cwd: demiDir,
  stdio: 'inherit',
});

if (result.status !== 0) {
  console.error('[kv2-admin] vue-demi-switch 2.7 failed');
  process.exit(result.status ?? 1);
}

const after = readFlags(demiDir);
if (!(after.isVue2 === true && after.isVue3 === false)) {
  console.error('[kv2-admin] vue-demi still not in Vue 2.7 mode after switch');
  process.exit(1);
}

console.log('[kv2-admin] vue-demi switched to Vue 2.7 mode');
