#!/usr/bin/env node
/**
 * tools/build-bundle.mjs
 *
 * Build pipeline para o Web Component micro-formulario-ps-inscricao.
 *
 * Etapas:
 *  1. Executa `ng build --configuration=production`.
 *  2. Lê o `index.html` gerado em dist/.../browser/ (fonte da verdade da ordem dos scripts).
 *  3. Extrai os <script src="..."> de arquivos JS locais em ordem de carregamento.
 *  4. Valida a existência de cada arquivo referenciado.
 *  5. Concatena os conteúdos com separadores de rastreabilidade.
 *  6. Grava o bundle final em dist/micro-form-bundle.js.
 *
 * Uso:
 *   node tools/build-bundle.mjs
 *   npm run build:bundle
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BROWSER_DIST = join(ROOT, 'dist', 'micro-form-pse-inscricao', 'browser');
const INDEX_HTML = join(BROWSER_DIST, 'index.html');
const OUTPUT_BUNDLE = join(ROOT, 'dist', 'micro-form-bundle.js');

// ---------------------------------------------------------------------------
// Step 1 — ng build
// ---------------------------------------------------------------------------

console.log('\n▶ Step 1/4 — Running ng build --configuration=production...\n');

try {
  execSync('npx ng build --configuration=production', {
    cwd: ROOT,
    stdio: 'inherit',
  });
} catch (err) {
  console.error('\n✗ ng build failed.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 2 — Read index.html (source of truth for script load order)
// ---------------------------------------------------------------------------

console.log('\n▶ Step 2/4 — Reading index.html...');

if (!existsSync(INDEX_HTML)) {
  console.error(
    `\n✗ index.html not found at:\n  ${INDEX_HTML}\n` +
      '  Make sure the Angular build outputs to dist/micro-form-pse-inscricao/browser/.'
  );
  process.exit(1);
}

const html = readFileSync(INDEX_HTML, 'utf8');

// ---------------------------------------------------------------------------
// Step 3 — Extract local JS <script> src attributes in DOM order
// ---------------------------------------------------------------------------

console.log('\n▶ Step 3/4 — Extracting script references from index.html...');

/**
 * Matches <script ... src="<path>.js" ...> tags.
 * The capture group [1] holds the src value.
 * External URLs (http/https/protocol-relative) are filtered out afterwards.
 */
const SCRIPT_REGEX = /<script[^>]+\bsrc="([^"]+\.js)"[^>]*>/gi;

/** @type {string[]} */
const scriptSrcs = [];
let match;

while ((match = SCRIPT_REGEX.exec(html)) !== null) {
  const src = match[1];
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
    continue; // skip external scripts
  }
  scriptSrcs.push(src);
}

if (scriptSrcs.length === 0) {
  console.error(
    '\n✗ No local JS <script> tags found in index.html.\n' +
      '  The Angular build may have generated an unexpected output structure.'
  );
  process.exit(1);
}

console.log(`   Found ${scriptSrcs.length} script(s) (in load order):`);
scriptSrcs.forEach((s) => console.log(`   • ${s}`));

// ---------------------------------------------------------------------------
// Step 4 — Validate files, concatenate and write bundle
// ---------------------------------------------------------------------------

console.log('\n▶ Step 4/4 — Concatenating and writing bundle...');

/** @type {string[]} */
const chunks = [];

for (const src of scriptSrcs) {
  // Angular outputs src values as bare filenames (e.g. "main-ABC123.js")
  // but some setups may prefix with "/". Normalise here.
  const relativeSrc = src.startsWith('/') ? src.slice(1) : src;
  const filePath = join(BROWSER_DIST, relativeSrc);

  if (!existsSync(filePath)) {
    console.error(
      `\n✗ Script file referenced in index.html not found on disk:\n  ${filePath}\n` +
        '  Re-run the build and try again.'
    );
    process.exit(1);
  }

  const content = readFileSync(filePath, 'utf8');
  chunks.push(`/* ===== ${src} ===== */\n${content}`);
}

const header =
  `/* ============================================================\n` +
  ` * micro-form-bundle.js\n` +
  ` * Web Component: <micro-formulario-ps-inscricao>\n` +
  ` * Generated: ${new Date().toISOString()}\n` +
  ` * Sources (${chunks.length}):\n` +
  scriptSrcs.map((s) => ` *   ${s}`).join('\n') +
  `\n * ============================================================ */\n\n`;

const bundle = header + chunks.join('\n\n');

writeFileSync(OUTPUT_BUNDLE, bundle, 'utf8');

const sizeKb = (Buffer.byteLength(bundle, 'utf8') / 1024).toFixed(2);
console.log(`\n✓ Bundle written to:\n  ${OUTPUT_BUNDLE}\n  Size: ${sizeKb} kB`);
console.log('\n✓ Done. Distribute dist/micro-form-bundle.js and dist/micro-form-pse-inscricao/browser/styles-*.css together.\n');
