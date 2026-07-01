// Audit a PROJECT (not a single file) for the tenet-ui RUNTIME contract.
// Catches the #1 failure mode: code that references tokens / tenet-ui components but never
// imports the stylesheet — so every var(--token) AND every Tenet-* component class is
// undefined at runtime (unstyled: no background, no borders, fallback fonts, collapsed
// spacing, broken controls) even though per-file audit.mjs reports 0 violations.
// audit.mjs checks token *names*; this checks whether they *resolve*. Run BOTH.
//
// Usage: node scripts/audit-runtime.mjs <project-root> [--json]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve as resolvePath, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(readFileSync(resolvePath(skillDir, 'knowledge/runtime.json'), 'utf8'));

const root = process.argv[2];
const asJson = process.argv.includes('--json');
if (!root) {
  console.error('usage: node scripts/audit-runtime.mjs <project-root> [--json]');
  process.exit(2);
}

// ---- collect source files ----
const SKIP = new Set(['node_modules', 'dist', 'build', '.git', '.next', 'coverage']);
const exts = /\.(tsx?|jsx?|css)$/;
const files = [];
(function walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (exts.test(e)) files.push(p);
  }
})(resolvePath(root));

const rawBlob = files.map((f) => readFileSync(f, 'utf8')).join('\n');
// Strip comments BEFORE any detection. The whole point of this gate is to catch a missing
// stylesheet import; an import that lives only in a comment / JSDoc / stale TODO
// (e.g. `// import 'tenet-ui/styles.css'`) must NOT count as wired. Drop block comments,
// then line comments — but keep `://` so we don't chop protocols inside string URLs.
const blob = rawBlob
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

// ---- does this project actually use tenet-ui? ----
// pkg = "tenet-ui" (from the first css import, "tenet-ui/styles.css").
const pkg = (runtime.cssImports?.[0] || '').split('/')[0]; // "tenet-ui"
const usesTokens = /var\(\s*--[\w-]+\s*\)/.test(blob);
// Match both `from 'tenet-ui'` and `from 'tenet-ui/...'`.
const usesDsImport = pkg ? new RegExp(`from\\s+['"]${pkg}(?:/[^'"]*)?['"]`).test(blob) : false;
const usesTenetClass = /Tenet-[A-Z]/.test(blob);
const usesDs = usesTokens || usesDsImport || usesTenetClass;

const violations = [];
const add = (severity, code, message, fix) => violations.push({ severity, code, message, fix });

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A real side-effect import / require / CSS @import — NOT a mere mention in a comment.
const isImported = (imp) =>
  new RegExp(`(?:^|[^\\w])(?:import|@import)\\s+['"]${escapeRe(imp)}['"]`, 'm').test(blob) ||
  new RegExp(`require\\(\\s*['"]${escapeRe(imp)}['"]\\s*\\)`).test(blob);

if (usesDs) {
  // 1. the stylesheet must be imported somewhere (tokens + component CSS live here).
  for (const imp of runtime.cssImports || []) {
    if (!isImported(imp)) {
      add('error', imp,
        `Stylesheet not imported: '${imp}'.`,
        `add \`import '${imp}'\` once at the app entry (e.g. main.tsx). Without it every var(--token) and every Tenet-* class is undefined at runtime — the UI renders unstyled.`);
    }
  }
  // 2. any required providers (tenet-ui has none, but keep general for retargeting).
  for (const prov of runtime.providers || []) {
    const name = prov.import;
    const imported = new RegExp(`import[^;]*\\b${name}\\b[^;]*from\\s+['"]${prov.from}['"]`).test(blob);
    const mounted = new RegExp(`<${name}[\\s/>]`).test(blob);
    if (!imported || !mounted) {
      add('error', name, `Provider <${name}> from '${prov.from}' is ${!imported ? 'not imported' : 'imported but never mounted'}.`,
        `mount <${name}> at the app root.`);
    }
  }
}

function report() {
  const errors = violations.filter((v) => v.severity === 'error').length;
  if (asJson) {
    console.log(JSON.stringify({ root: resolvePath(root), usesDesignSystem: usesDs, total: violations.length, errors, violations }, null, 2));
    process.exit(errors ? 1 : 0);
  }
  console.log(`\ntenet-ui RUNTIME audit — ${resolvePath(root)}`);
  console.log(`Files scanned: ${files.length} | uses tenet-ui: ${usesDs ? 'yes' : 'no'}`);
  if (!usesDs) { console.log('\n✓ Project does not reference tenet-ui — no runtime wiring required.\n'); return; }
  if (!violations.length) {
    console.log(`\n✓ Runtime wired — '${runtime.cssImports?.[0]}' is imported, so tokens + component styles resolve.`);
    console.log(`  Theme: set data-color-mode="light|dark" on an ancestor to switch (defaults to light).`);
    console.log(`  Next: run Verify (reference/verify.md) to confirm the rendered output actually matches.\n`);
    return;
  }
  console.log('');
  for (const v of violations) console.log(`  ✗ ${v.code}\n      ${v.message}\n      ↳ ${v.fix}`);
  console.log(`\n✗ ${violations.length} runtime violation(s). The code references tenet-ui but it WILL NOT resolve.`);
  console.log(`  Symptom at runtime: unstyled — no background/borders, fallback fonts, collapsed spacing, broken controls.\n`);
  process.exit(1);
}

report();
