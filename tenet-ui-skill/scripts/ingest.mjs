// Ingest the tenet-ui design system into a committed knowledge snapshot the skill reads.
//   knowledge/tokens.json       — every legal token (name, cssVar, light/dark or value, type, description)
//   knowledge/components.json   — component catalog (props, variants, import path), keyed by id
//   knowledge/usage/*.md        — per-component usage guidelines (copied verbatim)
//   knowledge/runtime.json      — the runtime contract (how tokens/styles bootstrap)
//   knowledge/meta.json         — counts + provenance
//
// Source resolution (so the skill refreshes whether it lives next to the repo OR is installed
// globally and pointed at a consumer's install), first match wins:
//   1. `--from <path>`            explicit source
//   2. config.packageDir          the repo build (dev) — ships dist + generated + guidelines/
//   3. node_modules/<package>     a consumer's installed copy (dist + generated; guidelines only
//                                 if the package ships them — the copy is graceful if absent)
//   node scripts/ingest.mjs [--from <path>]
import { mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve as resolvePath, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolvePath(skillDir, 'design-system.config.json'), 'utf8'));

const fromFlag = process.argv.indexOf('--from');
const fromArg = fromFlag >= 0 ? process.argv[fromFlag + 1] : null;
const isPkgRoot = (p) => p && existsSync(resolvePath(p, 'dist/tokens.json'));
const pkgDir = [
  fromArg && resolvePath(process.cwd(), fromArg),
  config.packageDir && resolvePath(skillDir, config.packageDir),
  resolvePath(process.cwd(), 'node_modules', config.package || 'tenet-ui'),
].find(isPkgRoot);
if (!pkgDir) {
  console.error(
    `Could not find a tenet-ui source. Pass --from <path>, run this from a project that has ` +
      `'${config.package || 'tenet-ui'}' installed, or fix config.packageDir.`,
  );
  process.exit(1);
}
console.log(`Ingesting from: ${pkgDir}`);
const knowledgeDir = resolvePath(skillDir, config.knowledgeDir || 'knowledge');
mkdirSync(resolvePath(knowledgeDir, 'usage'), { recursive: true });
const write = (rel, data) => writeFileSync(resolvePath(knowledgeDir, rel), JSON.stringify(data, null, 2) + '\n');

// 1. Tokens — copy the resolved registry as-is (themed entries carry light/dark; shared carry value).
const tokens = JSON.parse(readFileSync(resolvePath(pkgDir, 'dist/tokens.json'), 'utf8'));
write('tokens.json', tokens);

// 2. Components — the catalog ships as { schemaVersion, generatedFrom, components: { <id>: {...} } }.
//    Flatten to the inner map so the audit can Object.values() it directly.
const catalog = JSON.parse(readFileSync(resolvePath(pkgDir, 'generated/components.json'), 'utf8'));
const components = catalog.components || catalog;
write('components.json', components);

// 3. Usage guidelines — copy every markdown file.
const guidelinesDir = resolvePath(pkgDir, 'guidelines');
let guidelineFiles = [];
try {
  guidelineFiles = readdirSync(guidelinesDir).filter((f) => f.endsWith('.md'));
  for (const f of guidelineFiles) copyFileSync(join(guidelinesDir, f), resolvePath(knowledgeDir, 'usage', f));
} catch {
  /* no guidelines dir */
}

// 4. Runtime contract — copied from config so generate/verify/audit can read it from the knowledge base.
if (config.runtime) write('runtime.json', config.runtime);

// 5. Meta.
write('meta.json', {
  designSystem: config.designSystem,
  package: config.package,
  counts: {
    tokens: Object.keys(tokens).length,
    components: Object.keys(components).length,
    guidelines: guidelineFiles.length,
  },
  hasRuntimeContract: !!config.runtime,
  generatedFrom: catalog.generatedFrom || pkgDir,
});

console.log(
  `tokens: ${Object.keys(tokens).length} | components: ${Object.keys(components).length} | guidelines: ${guidelineFiles.length}`,
);
console.log(`-> ${knowledgeDir}`);
