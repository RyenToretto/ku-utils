import { mkdirSync, watch, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');
const tokensDir = resolve(__dirname, '..', 'tokens');
const watchMode = process.argv.includes('--watch');

async function loadTokens() {
  const { default: colors } = await import('../tokens/colors.js');
  const { default: typography } = await import('../tokens/typography.js');
  const { default: spacingModule } = await import('../tokens/spacing.js');
  const { default: effects } = await import('../tokens/effects.js');
  const nested = { colors, ...typography, ...spacingModule, ...effects };
  const forFlatCss = { ...colors, ...typography, ...spacingModule, ...effects };
  return { nested, forFlatCss };
}

function flattenTokens(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

const SEMANTIC_ALIASES = {
  'color-primary': 'var(--du-primary-500)',
  'color-primary-light': 'var(--du-primary-50)',
  'color-primary-hover': 'var(--du-primary-600)',
  'color-primary-active': 'var(--du-primary-700)',
  'color-success': 'var(--du-success-500)',
  'color-success-light': 'var(--du-success-50)',
  'color-warning': 'var(--du-warning-500)',
  'color-warning-light': 'var(--du-warning-50)',
  'color-danger': 'var(--du-danger-500)',
  'color-danger-light': 'var(--du-danger-50)',
  'color-info': 'var(--du-primary-400)',
  'color-info-light': 'var(--du-primary-50)',
  'color-text-primary': 'var(--du-neutral-900)',
  'color-text-secondary': 'var(--du-neutral-600)',
  'color-text-placeholder': 'var(--du-neutral-400)',
  'color-text-disabled': 'var(--du-neutral-300)',
  'color-bg-primary': '#ffffff',
  'color-bg-secondary': 'var(--du-neutral-50)',
  'color-bg-tertiary': 'var(--du-neutral-100)',
  'color-border': 'var(--du-neutral-200)',
  'color-border-light': 'var(--du-neutral-100)',
  'color-border-hover': 'var(--du-neutral-300)',

  'radius-sm': 'var(--du-borderRadius-sm)',
  'radius-base': 'var(--du-borderRadius-base)',
  'radius-md': 'var(--du-borderRadius-md)',
  'radius-lg': 'var(--du-borderRadius-lg)',
  'radius-xl': 'var(--du-borderRadius-xl)',
  'radius-full': 'var(--du-borderRadius-full)',

  'shadow-sm': 'var(--du-shadow-sm)',
  'shadow-base': 'var(--du-shadow-base)',
  'shadow-md': 'var(--du-shadow-md)',
  'shadow-lg': 'var(--du-shadow-lg)',
  'shadow-xl': 'var(--du-shadow-xl)',

  'loading-bg': 'rgba(255, 255, 255, 0.8)',
};

const DARK_SEMANTIC_ALIASES = {
  'color-primary': 'var(--du-primary-400)',
  'color-primary-light': 'var(--du-primary-900)',
  'color-primary-hover': 'var(--du-primary-300)',
  'color-primary-active': 'var(--du-primary-200)',
  'color-success': 'var(--du-success-400)',
  'color-success-light': 'var(--du-success-900)',
  'color-warning': 'var(--du-warning-400)',
  'color-warning-light': 'var(--du-warning-900)',
  'color-danger': 'var(--du-danger-400)',
  'color-danger-light': 'var(--du-danger-900)',
  'color-info': 'var(--du-primary-300)',
  'color-info-light': 'var(--du-primary-900)',
  'color-text-primary': 'var(--du-neutral-50)',
  'color-text-secondary': 'var(--du-neutral-300)',
  'color-text-placeholder': 'var(--du-neutral-500)',
  'color-text-disabled': 'var(--du-neutral-600)',
  'color-bg-primary': 'var(--du-neutral-900)',
  'color-bg-secondary': 'var(--du-neutral-800)',
  'color-bg-tertiary': 'var(--du-neutral-700)',
  'color-border': 'var(--du-neutral-700)',
  'color-border-light': 'var(--du-neutral-800)',
  'color-border-hover': 'var(--du-neutral-600)',

  'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  'shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',

  'loading-bg': 'rgba(23, 23, 23, 0.8)',
};

function generateCSS(tokens) {
  const flat = flattenTokens(tokens);
  const atomicVars = Object.entries(flat)
    .map(([key, value]) => `  --du-${key}: ${value};`)
    .join('\n');
  const semanticVars = Object.entries(SEMANTIC_ALIASES)
    .map(([key, value]) => `  --du-${key}: ${value};`)
    .join('\n');
  const darkVars = Object.entries(DARK_SEMANTIC_ALIASES)
    .map(([key, value]) => `  --du-${key}: ${value};`)
    .join('\n');

  return [
    `:root {\n${atomicVars}\n\n  /* Semantic Aliases */\n${semanticVars}\n}`,
    '',
    `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${darkVars}\n  }\n}`,
    '',
    `:root[data-theme="dark"] {\n${darkVars}\n}`,
    '',
  ].join('\n');
}

function generateCSSCustomData(tokens) {
  const flat = flattenTokens(tokens);
  const semanticKeys = new Set([
    ...Object.keys(SEMANTIC_ALIASES),
    ...Object.keys(DARK_SEMANTIC_ALIASES),
  ]);
  const allVars = [
    ...Object.keys(flat).map((k) => `--du-${k}`),
    ...[...semanticKeys].map((k) => `--du-${k}`),
  ];
  const properties = allVars.map((name) => ({
    name,
    description: `ku-utils design token: ${name}`,
  }));
  return JSON.stringify(
    {
      version: 1.1,
      properties,
    },
    null,
    2,
  );
}

function generateSCSS(tokens) {
  const flat = flattenTokens(tokens);
  const atomicVars = Object.entries(flat)
    .map(([key, value]) => `$du-${key}: ${value};`)
    .join('\n');
  const semanticVars = Object.entries(SEMANTIC_ALIASES)
    .map(([key, value]) => `$du-${key}: ${value};`)
    .join('\n');
  return `${atomicVars}\n\n// Semantic Aliases\n${semanticVars}\n`;
}

function generateJS(tokens) {
  return `export default ${JSON.stringify(tokens, null, 2)};\n`;
}

function generateCJS(tokens) {
  return `"use strict";\nmodule.exports = ${JSON.stringify(tokens, null, 2)};\n`;
}

function generateDTS(tokens) {
  function generateType(obj, indent = '  ') {
    const lines = [];
    for (const [key, value] of Object.entries(obj)) {
      const safeKey = /^\d/.test(key) || key.includes('-') ? `'${key}'` : key;
      if (typeof value === 'object' && value !== null) {
        lines.push(`${indent}${safeKey}: {`);
        lines.push(generateType(value, `${indent}  `));
        lines.push(`${indent}};`);
      } else {
        lines.push(`${indent}${safeKey}: string;`);
      }
    }
    return lines.join('\n');
  }

  return `declare const tokens: {\n${generateType(tokens)}\n};\nexport default tokens;\n`;
}

function generateJSON(tokens) {
  return `${JSON.stringify(tokens, null, 2)}\n`;
}

async function build() {
  mkdirSync(distDir, { recursive: true });
  const { nested, forFlatCss } = await loadTokens();

  writeFileSync(resolve(distDir, 'tokens.css'), generateCSS(forFlatCss));
  writeFileSync(resolve(distDir, 'tokens.scss'), generateSCSS(forFlatCss));
  writeFileSync(resolve(distDir, 'tokens.js'), generateJS(nested));
  writeFileSync(resolve(distDir, 'tokens.cjs'), generateCJS(nested));
  writeFileSync(resolve(distDir, 'tokens.d.ts'), generateDTS(nested));
  writeFileSync(resolve(distDir, 'tokens.json'), generateJSON(nested));
  writeFileSync(resolve(distDir, 'css-custom-data.json'), generateCSSCustomData(forFlatCss));

  // eslint-disable-next-line no-console
  console.log('Design tokens built successfully!');
}

function startWatch() {
  build().catch(console.error);
  watch(tokensDir, { recursive: true }, (_eventType, filename) => {
    if (filename) {
      console.warn(`[watch] ${filename} changed, rebuilding...`);
    }
    build().catch(console.error);
  });
  console.warn(`Watching ${tokensDir} for changes...`);
}

if (watchMode) {
  startWatch();
} else {
  build().catch(console.error);
}
