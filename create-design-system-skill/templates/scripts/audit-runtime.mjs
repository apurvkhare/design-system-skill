// Audit a PROJECT (not a single file) for the design system's RUNTIME contract.
// Catches the #1 failure mode: code that references tokens / DS components but never imports the
// stylesheet (or never mounts the required provider) — so every var(--token) AND every component
// class is undefined at runtime (unstyled: no background, no borders, fallback fonts, collapsed
// spacing, broken controls) even though per-file audit.mjs reports 0 violations.
// audit.mjs checks token *names*; this checks whether they *resolve*. Run BOTH.
//
// Driven by knowledge/runtime.json (from design-system.config.json). Usage:
//   node scripts/audit-runtime.mjs <project-root> [--json]
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve as resolvePath, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(readFileSync(resolvePath(skillDir, 'knowledge/runtime.json'), 'utf8'));
const meta = JSON.parse(readFileSync(resolvePath(skillDir, 'knowledge/meta.json'), 'utf8'));

const root = process.argv[2];
const asJson = process.argv.includes('--json');
if (!root) { console.error('usage: node scripts/audit-runtime.mjs <project-root> [--json]'); process.exit(2); }

// ---- collect source files ----
const SKIP = new Set(['node_modules', 'dist', 'build', '.git', '.next', 'coverage', 'out']);
const exts = /\.(tsx?|jsx?|css|scss)$/;
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
// Strip comments BEFORE detection. The whole point is to catch a MISSING import; an import that lives
// only in a comment / JSDoc / stale TODO must NOT count as wired. Drop block then line comments,
// but keep `://` so we don't chop protocols inside string URLs.
const blob = rawBlob.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

// ---- does this project actually use the design system? ----
const pkg = meta.package || (runtime.cssImports?.[0] || '').split('/')[0];
const classPrefix = runtime.classPrefix || null; // e.g. "Tenet-" — component CSS class namespace, if any
const usesTokens = /var\(\s*--[\w-]+\s*\)/.test(blob);
const usesDsImport = pkg ? new RegExp(`from\\s+['"]${escapeRe(pkg)}(?:/[^'"]*)?['"]`).test(blob) : false;
const usesClass = classPrefix ? new RegExp(`${escapeRe(classPrefix)}[A-Za-z]`).test(blob) : false;
const usesDs = usesTokens || usesDsImport || usesClass;

const violations = [];
const add = (severity, code, message, fix) => violations.push({ severity, code, message, fix });

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
// A real side-effect import / require / CSS @import — NOT a mere mention in a comment.
const isImported = (imp) =>
  new RegExp(`(?:^|[^\\w])(?:import|@import)\\s+['"]${escapeRe(imp)}['"]`, 'm').test(blob) ||
  new RegExp(`require\\(\\s*['"]${escapeRe(imp)}['"]\\s*\\)`).test(blob);

if (usesDs) {
  // 1. every required stylesheet must be imported somewhere (tokens + component CSS live here).
  for (const imp of runtime.cssImports || []) {
    if (!isImported(imp)) add('error', imp, `Stylesheet not imported: '${imp}'.`,
      `add \`import '${imp}'\` once at the app entry (e.g. main.tsx). Without it every var(--token)${classPrefix ? ` and every ${classPrefix}* class` : ''} is undefined at runtime — the UI renders unstyled.`);
  }
  // 2. any required providers must be imported AND mounted.
  for (const prov of runtime.providers || []) {
    const name = prov.import;
    const imported = new RegExp(`import[^;]*\\b${escapeRe(name)}\\b[^;]*from\\s+['"]${escapeRe(prov.from)}['"]`).test(blob);
    const mounted = new RegExp(`<${escapeRe(name)}[\\s/>]`).test(blob);
    if (!imported || !mounted) add('error', name, `Provider <${name}> from '${prov.from}' is ${!imported ? 'not imported' : 'imported but never mounted'}.`, `mount <${name}> at the app root (see knowledge/runtime.json entryExample).`);
  }
}

function report() {
  const errors = violations.filter((v) => v.severity === 'error').length;
  if (asJson) {
    console.log(JSON.stringify({ root: resolvePath(root), usesDesignSystem: usesDs, total: violations.length, errors, violations }, null, 2));
    process.exit(errors ? 1 : 0);
  }
  console.log(`\n${meta.designSystem} RUNTIME audit — ${resolvePath(root)}`);
  console.log(`Files scanned: ${files.length} | uses ${meta.designSystem}: ${usesDs ? 'yes' : 'no'}`);
  if (!usesDs) { console.log(`\n✓ Project does not reference ${meta.designSystem} — no runtime wiring required.\n`); return; }
  if (!violations.length) {
    console.log(`\n✓ Runtime wired — required stylesheet(s)/provider(s) are present, so tokens + component styles resolve.`);
    if (runtime.themeAttribute) console.log(`  Theme: set ${runtime.themeAttribute.name}="${(runtime.themeAttribute.values || []).join('|')}" on an ancestor to switch.`);
    console.log(`  Next: run Verify (reference/verify.md) to confirm the rendered output actually matches.\n`);
    return;
  }
  console.log('');
  for (const v of violations) console.log(`  ✗ ${v.code}\n      ${v.message}\n      ↳ ${v.fix}`);
  console.log(`\n✗ ${violations.length} runtime violation(s). The code references ${meta.designSystem} but it WILL NOT resolve.`);
  console.log(`  Symptom at runtime: unstyled — no background/borders, fallback fonts, collapsed spacing, broken controls.\n`);
  process.exit(1);
}

report();
