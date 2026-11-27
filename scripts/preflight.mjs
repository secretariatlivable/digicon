/**
 * DigiCon build preflight
 * -----------------------
 *
 * Purpose:
 *   Catch repository-integrity problems before TypeScript/Vite runs.
 *
 * Checks:
 *   1. @/* source imports resolve against src/.
 *   2. manifest.json and sw.js exist when referenced.
 *   3. Runtime assets referenced by those files exist in public/.
 *   4. DigiCon banner assets referenced by SectionBanner exist.
 *   5. Hero-loop assets referenced by the application exist.
 *
 * Important:
 *   This script checks the filesystem only.
 *   It MUST NOT claim that a missing file is "uncommitted", because
 *   filesystem existence does not prove Git tracking state.
 *
 * Alias contract:
 *   @/* -> src/*
 *
 * This must remain consistent with:
 *   - tsconfig.app.json
 *   - vite.config.ts
 *
 * The script intentionally has no npm dependencies so it works on a
 * fresh Netlify/CI checkout.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';

import {
  dirname,
  extname,
  join,
  relative,
  resolve,
} from 'node:path';

import { fileURLToPath } from 'node:url';

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const PUBLIC = join(ROOT, 'public');

const ALIAS_PREFIX = '@/';

const RESOLVE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.json',
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Recursively return every file beneath a directory.
 */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }

  return out;
}

/**
 * Resolve an @/* import using the DigiCon alias:
 *
 *   @/foo/bar
 *       ↓
 *   src/foo/bar
 *
 * Supports:
 *   src/foo/bar
 *   src/foo/bar.ts
 *   src/foo/bar.tsx
 *   src/foo/bar/index.ts
 *   etc.
 */
function resolveAlias(specifier) {
  if (
    typeof specifier !== 'string' ||
    !specifier.startsWith(ALIAS_PREFIX)
  ) {
    return null;
  }

  const relativePath = specifier.slice(ALIAS_PREFIX.length);

  if (!relativePath || relativePath.startsWith('/')) {
    return null;
  }

  const base = join(SRC, relativePath);

  /*
   * Protect the alias resolver from paths escaping src/.
   */
  const normalizedBase = resolve(base);
  const normalizedSrc = resolve(SRC);

  if (
    normalizedBase !== normalizedSrc &&
    !normalizedBase.startsWith(`${normalizedSrc}/`)
  ) {
    return null;
  }

  /*
   * Direct file:
   *
   * @/foo/bar
   * -> src/foo/bar
   */
  if (existsSync(base) && statSync(base).isFile()) {
    return base;
  }

  /*
   * File with an extension:
   *
   * @/foo/bar
   * -> src/foo/bar.ts
   * -> src/foo/bar.tsx
   * etc.
   */
  for (const extension of RESOLVE_EXTENSIONS) {
    const candidate = `${base}${extension}`;

    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  /*
   * Directory index:
   *
   * @/foo/bar
   * -> src/foo/bar/index.ts
   * -> src/foo/bar/index.tsx
   * etc.
   */
  for (const extension of RESOLVE_EXTENSIONS) {
    const candidate = join(base, `index${extension}`);

    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

/**
 * Convert an absolute repository path into a readable relative path.
 */
function displayPath(file) {
  return relative(ROOT, file).replaceAll('\\', '/');
}

/**
 * Convert a public URL path into a filesystem path.
 *
 * Example:
 *
 *   /media/hero.jpg
 *       ↓
 *   public/media/hero.jpg
 */
function publicPath(urlPath) {
  if (
    typeof urlPath !== 'string' ||
    !urlPath.startsWith('/')
  ) {
    return null;
  }

  const relativePath = urlPath.slice(1);

  if (!relativePath) return null;

  const candidate = resolve(PUBLIC, relativePath);
  const normalizedPublic = resolve(PUBLIC);

  /*
   * Prevent references such as:
   *
   *   /../secret.txt
   */
  if (
    candidate !== normalizedPublic &&
    !candidate.startsWith(`${normalizedPublic}/`)
  ) {
    return null;
  }

  return candidate;
}

/**
 * Extract source import specifiers.
 *
 * Handles:
 *
 *   import X from '@/foo';
 *   import { X } from '@/foo';
 *   export { X } from '@/foo';
 *   import('@/foo');
 *   import type { X } from '@/foo';
 *
 * It intentionally focuses on @/* imports because that is the contract
 * this preflight is responsible for validating.
 */
function extractAliasImports(text) {
  const imports = new Set();

  const patterns = [
    /\bfrom\s*['"](@\/[^'"]+)['"]/g,
    /\bimport\s*['"](@\/[^'"]+)['"]/g,
    /\bimport\s*\(\s*['"](@\/[^'"]+)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const specifier = match[1];

      if (specifier) {
        imports.add(specifier);
      }
    }
  }

  return [...imports];
}

/**
 * Add a runtime asset URL to the set while rejecting malformed references.
 */
function addAsset(assets, value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/')
  ) {
    return;
  }

  /*
   * Ignore URLs that are clearly external.
   */
  if (
    value.startsWith('//') ||
    /^\/https?:\/\//i.test(value)
  ) {
    return;
  }

  assets.add(value);
}

/* -------------------------------------------------------------------------- */
/* Problems                                                                   */
/* -------------------------------------------------------------------------- */

const problems = [];

/* -------------------------------------------------------------------------- */
/* 1. Validate source directory                                               */
/* -------------------------------------------------------------------------- */

if (!existsSync(SRC) || !statSync(SRC).isDirectory()) {
  problems.push({
    kind: 'source',
    message: `Source directory does not exist: ${displayPath(SRC)}`,
  });
}

/* -------------------------------------------------------------------------- */
/* 2. Validate @/* imports                                                    */
/* -------------------------------------------------------------------------- */

const sourceFiles = walk(SRC).filter((file) =>
  /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(file),
);

const seenImports = new Set();

for (const file of sourceFiles) {
  let text;

  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    problems.push({
      kind: 'source',
      message: `Unable to read ${displayPath(file)}: ${error.message}`,
    });

    continue;
  }

  for (const specifier of extractAliasImports(text)) {
    const key = `${displayPath(file)}::${specifier}`;

    if (seenImports.has(key)) {
      continue;
    }

    seenImports.add(key);

    const resolved = resolveAlias(specifier);

    if (!resolved) {
      problems.push({
        kind: 'module',
        specifier,
        from: displayPath(file),
      });
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Runtime assets                                                           */
/* -------------------------------------------------------------------------- */

const assets = new Set();

/* -------------------------------------------------------------------------- */
/* 3a. Section banner registry                                                 */
/* -------------------------------------------------------------------------- */

const bannerRegistry = join(
  SRC,
  'components',
  'ui',
  'SectionBanner.tsx',
);

if (existsSync(bannerRegistry)) {
  const text = readFileSync(bannerRegistry, 'utf8');

  const start = text.indexOf('export const BANNERS');

  /*
   * The original implementation assumed the closing text:
   *
   *   } as const;
   *
   * If the component is reformatted, that exact sequence may disappear.
   *
   * Therefore, when possible, inspect the complete file rather than
   * failing simply because the registry formatting changed.
   */
  const registryText =
    start >= 0 ? text.slice(start) : text;

  /*
   * Existing DigiCon banner convention:
   *
   *   slug: 'something'
   *
   * produces:
   *
   *   /media/banners/something-2400.jpg
   *   /media/banners/something-1200.jpg
   */
  for (const match of registryText.matchAll(
    /^\s{2,}([A-Za-z0-9_-]+)\s*:\s*['"]([^'"]+)['"]/gm,
  )) {
    const value = match[2];

    /*
     * If the registry value already looks like a path or filename,
     * don't manufacture another path from it.
     */
    if (
      value.includes('/') ||
      /\.(?:jpg|jpeg|png|webp|avif)$/i.test(value)
    ) {
      addAsset(assets, value);
      continue;
    }

    /*
     * Standard DigiCon banner convention.
     */
    addAsset(
      assets,
      `/media/banners/${value}-2400.jpg`,
    );

    addAsset(
      assets,
      `/media/banners/${value}-1200.jpg`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* 3b. manifest.json and sw.js                                                */
/* -------------------------------------------------------------------------- */

for (const filename of ['manifest.json', 'sw.js']) {
  const full = join(PUBLIC, filename);

  if (!existsSync(full)) {
    /*
     * A missing manifest is relevant to a PWA build.
     *
     * A missing service worker is only an error if the project expects one.
     * DigiCon currently treats both as expected public files, so retain the
     * check but report it accurately.
     */
    problems.push({
      kind: 'asset',
      path: `/${filename}`,
      from: `public/${filename}`,
    });

    continue;
  }

  let text;

  try {
    text = readFileSync(full, 'utf8');
  } catch (error) {
    problems.push({
      kind: 'asset',
      path: `/${filename}`,
      from: `public/${filename}`,
      message: error.message,
    });

    continue;
  }

  /*
   * Look for root-relative static assets:
   *
   * /icons/icon-192.png
   * /media/foo.jpg
   * /images/logo.svg
   * etc.
   */
  const assetPattern =
    /["'`](\/[\w@%+~:.,\-./]+\.(?:png|jpg|jpeg|webp|avif|svg|ico|webm|mp4|json))["'`]/gi;

  for (const match of text.matchAll(assetPattern)) {
    addAsset(assets, match[1]);
  }
}

/* -------------------------------------------------------------------------- */
/* 3c. Known hero assets                                                       */
/* -------------------------------------------------------------------------- */

/*
 * DigiCon's hero implementation assembles these names dynamically, so they
 * cannot necessarily be discovered through literal-string scanning.
 */
addAsset(assets, '/media/hero-loop.mp4');
addAsset(assets, '/media/hero-loop.webm');
addAsset(assets, '/media/hero-loop-poster.jpg');

/* -------------------------------------------------------------------------- */
/* 4. Verify runtime assets                                                    */
/* -------------------------------------------------------------------------- */

for (const asset of [...assets].sort()) {
  const filesystemPath = publicPath(asset);

  if (!filesystemPath) {
    problems.push({
      kind: 'asset',
      path: asset,
      from: 'public/',
      message: 'Invalid public asset path',
    });

    continue;
  }

  if (
    !existsSync(filesystemPath) ||
    !statSync(filesystemPath).isFile()
  ) {
    problems.push({
      kind: 'asset',
      path: asset,
      from: 'public/',
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Report                                                                   */
/* -------------------------------------------------------------------------- */

if (problems.length === 0) {
  console.log(
    `✓ DigiCon preflight passed: ` +
      `${seenImports.size} aliased imports resolve; ` +
      `${assets.size} runtime assets present.`,
  );

  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Categorize problems                                                         */
/* -------------------------------------------------------------------------- */

const sourceProblems = problems.filter(
  (problem) => problem.kind === 'source',
);

const moduleProblems = problems.filter(
  (problem) => problem.kind === 'module',
);

const assetProblems = problems.filter(
  (problem) => problem.kind === 'asset',
);

/* -------------------------------------------------------------------------- */
/* Header                                                                      */
/* -------------------------------------------------------------------------- */

console.error('\n✗ DigiCon preflight failed.\n');

/* -------------------------------------------------------------------------- */
/* Source problems                                                             */
/* -------------------------------------------------------------------------- */

if (sourceProblems.length) {
  console.error('  Source filesystem problems:\n');

  for (const problem of sourceProblems) {
    console.error(`    ${problem.message}`);
  }

  console.error();
}

/* -------------------------------------------------------------------------- */
/* Module problems                                                             */
/* -------------------------------------------------------------------------- */

if (moduleProblems.length) {
  console.error(
    `  Unresolvable @/* module imports (${moduleProblems.length}):\n`,
  );

  for (const problem of moduleProblems) {
    console.error(
      `    ${problem.specifier}\n` +
        `      imported by ${problem.from}`,
    );
  }

  console.error(
    '\n  The import path does not resolve against the repository filesystem.\n' +
      '  Verify that the import path matches the actual file location and\n' +
      '  filename casing, and that the file is included in the Git commit\n' +
      '  being deployed.\n',
  );

  console.error(
    '  Useful Git check:\n' +
      '    git status --short\n' +
      '    git ls-files src\n',
  );

  console.error();
}

/* -------------------------------------------------------------------------- */
/* Asset problems                                                              */
/* -------------------------------------------------------------------------- */

if (assetProblems.length) {
  console.error(
    `  Missing runtime assets (${assetProblems.length}):\n`,
  );

  for (const problem of assetProblems.slice(0, 20)) {
    console.error(
      `    public${problem.path}` +
        (problem.message ? ` — ${problem.message}` : ''),
    );
  }

  if (assetProblems.length > 20) {
    console.error(
      `    …and ${assetProblems.length - 20} more`,
    );
  }

  console.error(
    '\n  These files are expected to exist in public/ at build/deploy time.\n' +
      '  Verify their paths, filename casing, and Git tracking.\n',
  );

  console.error(
    '  Useful Git check:\n' +
      '    git status --short\n' +
      '    git ls-files public\n',
  );

  console.error();
}

/* -------------------------------------------------------------------------- */
/* Exit                                                                       */
/* -------------------------------------------------------------------------- */

process.exit(1);
