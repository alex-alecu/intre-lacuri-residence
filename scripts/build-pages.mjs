import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const basePath = '/intre-lacuri-residence';
const origin = 'https://alex-alecu.github.io';
if (!process.argv.includes('--verify-only')) {
const result = spawnSync(process.execPath, [resolve(root, 'node_modules/vinext/dist/cli.js'), 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true', NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_INCLUDE_SOURCE_PLANS: 'false' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
}

const output = resolve(root, 'dist/client');
// Only these public data and icon files are needed by the viewer.
// The original floor-plan documents stay outside the public site.
for (const file of ['measurements.json', 'home-icon.svg']) {
  copyFileSync(resolve(root, 'public', file), resolve(output, file));
}
assert.ok(!existsSync(resolve(output, 'plans')), 'The original plan documents are excluded.');
const html = readFileSync(resolve(output, 'index.html'), 'utf8');
assert.ok(html.includes('Acasă, împreună'), 'The Romanian home page is present.');
assert.ok(html.includes('lang="ro"'), 'The document language is Romanian.');
for (const phrase of ['Our connected home', 'Walk inside', 'Furniture', 'Show dimensions', 'Plans &amp; dimensions']) assert.ok(!html.includes(phrase), `Old interface text is absent: ${phrase}`);
assert.ok(html.includes(`${basePath}/home-icon.svg`), 'The icon uses the repository path.');
let references = 0;
for (const [, raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(data:|#)/.test(raw)) continue;
  const url = new URL(raw.replaceAll('&amp;', '&'), `${origin}${basePath}/`);
  if (url.origin !== origin) continue;
  assert.ok(url.pathname.startsWith(`${basePath}/`), `File path stays in the repository: ${raw}`);
  const relative = decodeURIComponent(url.pathname.slice(basePath.length + 1));
  const local = resolve(output, relative || 'index.html');
  assert.ok(local.startsWith(output), 'File path stays inside the public output.');
  assert.ok(existsSync(local), `Exported file exists: ${relative}`);
  references++;
}
for (const file of ['index.rsc', 'measurements.json', 'home-icon.svg']) {
  assert.ok(existsSync(resolve(output, file)), `Required public file exists: ${file}`);
}
writeFileSync(resolve(output, '.nojekyll'), '');
console.log(`GitHub Pages export checked: ${references} local page references. The original plan documents are excluded.`);
