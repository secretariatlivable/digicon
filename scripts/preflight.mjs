#!/usr/bin/env node
/**
 * DigiCon build preflight.
 *
 * Catches the two failure modes that a plain `vite build` will not:
 *
 *  1. **A source module that exists locally but was never committed.**
 *     `tsc` does report these, but only once the build reaches Netlify — a
 *     30-second round trip per attempt. This resolves every `@/…` import in
 *     `src/` against the filesystem and fails immediately with the exact list.
 *
 *  2. **A runtime asset that was never committed.** This one is worse, because
 *     nothing catches it: the build succeeds and production quietly 404s every
 *     banner, the hero video and the PWA icons. Here we verify each asset the
 *     banner registry, the manifest and the service-worker precache reference.
 *
 * Dependency-free and filesystem-based, so it behaves identically on a
 * developer machine and on a fresh CI clone.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const PUBLIC = join(ROOT, 'public');

const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.json'];

/** Every file under a directory, recursively. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Mirrors the `@/* -> src/*` alias in tsconfig.app.json and vite.config.ts. */
function resolveAlias(spec) {
  const base = join(SRC, spec.slice(2));
  if (existsSync(base) && statSync(base).isFile()) return base;
  for (const ext of RESOLVE_EXTENSIONS) {
    if (existsSync(base + ext)) return base + ext;
  }
  for (const ext of RESOLVE_EXTENSIONS) {
    const indexed = join(base, `index${ext}`);
    if (existsSync(indexed)) return indexed;
  }
  return null;
}

const problems = [];

/* ---------------------------------------------- 1. source modules ------- */
const sourceFiles = walk(SRC).filter((f) => /\.(tsx?|jsx?)$/.test(f));
const importPattern = /(?:from\s+|import\s*\(\s*)['"](@\/[^'"]+)['"]/g;
const seen = new Set();

for (const file of sourceFiles) {
  const text = readFileSync(file, 'utf8');
  for (const [, spec] of text.matchAll(importPattern)) {
    const key = `${file}::${spec}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (!resolveAlias(spec)) {
      problems.push({
        kind: 'module',
        spec,
        from: relative(ROOT, file),
      });
    }
  }
}

/* ---------------------------------------------- 2. runtime assets ------- */
const assets = new Set();

// Banner registry — slugs are expanded into the -2400/-1200 pair the
// SectionBanner component builds at runtime.
const bannerRegistry = join(SRC, 'components/ui/SectionBanner.tsx');
if (existsSync(bannerRegistry)) {
  const text = readFileSync(bannerRegistry, 'utf8');
  const block = text.slice(text.indexOf('export const BANNERS'), text.indexOf('} as const;'));
  for (const [, slug] of block.matchAll(/^\s{2}(\w+):\s*'/gm)) {
    assets.add(`/media/banners/${slug}-2400.jpg`);
    assets.add(`/media/banners/${slug}-1200.jpg`);
  }
}

// Anything the manifest and the service worker promise to serve.
for (const file of ['manifest.json', 'sw.js']) {
  const full = join(PUBLIC, file);
  if (!existsSync(full)) {
    problems.push({ kind: 'asset', path: `/${file}`, from: 'public/' });
    continue;
  }
  const text = readFileSync(full, 'utf8');
  for (const [, ref] of text.matchAll(/["'](\/[\w\-./]+\.(?:png|jpg|jpeg|svg|ico|webm|mp4|json))["']/g)) {
    assets.add(ref);
  }
}

// The hero loop is assembled from a base name, so it never appears as a literal.
for (const ext of ['mp4', 'webm']) assets.add(`/media/hero-loop.${ext}`);
assets.add('/media/hero-loop-poster.jpg');

for (const asset of [...assets].sort()) {
  if (!existsSync(join(PUBLIC, asset))) {
    problems.push({ kind: 'asset', path: asset, from: 'public/' });
  }
}

/* ---------------------------------------------- report ------------------ */
if (problems.length === 0) {
  console.log(
    `✓ preflight: ${seen.size} aliased imports resolve, ${assets.size} runtime assets present`,
  );
  process.exit(0);
}

const modules = problems.filter((p) => p.kind === 'module');
const missingAssets = problems.filter((p) => p.kind === 'asset');

console.error('\n✗ DigiCon preflight failed.\n');

if (modules.length) {
  console.error('  Unresolvable module imports:\n');
  for (const p of modules) console.error(`    ${p.spec}\n      imported by ${p.from}`);
  console.error(
    '\n  These files exist in the working tree on a developer machine but are\n' +
      '  absent here. The usual cause is a NEW DIRECTORY that was never staged —\n' +
      '  `git commit -a` stages modified tracked files, never new ones.\n\n' +
      '  Fix:  git add -A src && git status --short\n',
  );
}

if (missingAssets.length) {
  console.error(`  Missing runtime assets (${missingAssets.length}):\n`);
  for (const p of missingAssets.slice(0, 12)) console.error(`    public${p.path}`);
  if (missingAssets.length > 12) {
    console.error(`    …and ${missingAssets.length - 12} more`);
  }
  console.error(
    '\n  These would not fail the build — the site would deploy and then 404\n' +
      '  every banner and the hero video.\n\n' +
      '  Fix:  git add -A public && git status --short\n',
  );
}

process.exit(1);
