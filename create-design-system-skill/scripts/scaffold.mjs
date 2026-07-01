// Scaffold a new design-system skill from the create-design-system-skill templates.
// Copies the generic engine scripts VERBATIM and the prose templates with placeholder
// substitution (mechanical fields + icon clauses resolved; ARCHITECTURE prompts left for the model).
//
//   node scripts/scaffold.mjs <target-skill-dir> [--name <skill-name>]
//
// The target dir SHOULD already contain a design-system.config.json (write it from the interview
// first). If it doesn't, this copies the annotated example as a starting point and tells you to edit
// it, then re-run. After scaffolding: run `node <target>/scripts/ingest.mjs`, refine the prose, and Verify.
import { mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, resolve as resolvePath, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const templatesDir = resolvePath(skillDir, 'templates');

const args = process.argv.slice(2);
const nameFlag = args.indexOf('--name');
const nameArg = nameFlag >= 0 ? args[nameFlag + 1] : null;
const targetArg = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--name');
if (!targetArg) { console.error('usage: node scripts/scaffold.mjs <target-skill-dir> [--name <skill-name>]'); process.exit(2); }

const target = resolvePath(process.cwd(), targetArg);
const skillName = nameArg || basename(target);
mkdirSync(resolvePath(target, 'scripts'), { recursive: true });
mkdirSync(resolvePath(target, 'reference'), { recursive: true });
mkdirSync(resolvePath(target, 'knowledge', 'usage'), { recursive: true });

// 1. engine scripts — copied verbatim (config-driven; no per-DS edits).
// Only real .mjs files — ignore dotfiles / editor sockets (e.g. .impeccable, .DS_Store).
for (const f of readdirSync(resolvePath(templatesDir, 'scripts')))
  if (f.endsWith('.mjs')) copyFileSync(resolvePath(templatesDir, 'scripts', f), resolvePath(target, 'scripts', f));

// 2. config — keep an existing one; otherwise seed from the annotated example.
const cfgPath = resolvePath(target, 'design-system.config.json');
let config = null;
let seededConfig = false;
if (existsSync(cfgPath)) {
  config = JSON.parse(readFileSync(cfgPath, 'utf8'));
} else {
  copyFileSync(resolvePath(templatesDir, 'design-system.config.example.json'), cfgPath);
  seededConfig = true;
  try { config = JSON.parse(readFileSync(cfgPath, 'utf8')); } catch { config = {}; }
}

// 3. placeholder map.
const ds = config.designSystem || '{{DESIGN_SYSTEM_NAME}}';
const pkg = config.package || '{{PACKAGE}}';
const hasIcons = !!(config.icons && config.icons.mode && config.icons.mode !== 'none');
const iconPkg = config.icons?.importPath || config.icons?.package || pkg;
const themeAttr = config.runtime?.themeAttribute?.name || 'data-theme';
const verifyToken = (config.runtime?.verifyTokensResolve || [])[0] || '--bgColor-default';
const render = config.render || {};
const verifyHarness = render.app
  ? `A ready harness: the app at \`${render.app}\` imports the stylesheet once${render.url ? ` (served at ${render.url})` : ''}.`
  : `A quick harness: a throwaway Vite app that installs \`${pkg}\` and imports only its stylesheet, exactly as knowledge/runtime.json shows.`;

const vars = {
  SKILL_NAME: skillName,
  DESIGN_SYSTEM_NAME: ds,
  PACKAGE: pkg,
  THEME_ATTRIBUTE: themeAttr,
  VERIFY_TOKEN: verifyToken,
  VERIFY_HARNESS_LINE: verifyHarness,
  // icon clauses — fully resolved here (present vs absent).
  ICONS_DESC_CLAUSE: hasIcons ? `, and icons from \`${iconPkg}\`` : '',
  ICONS_KNOWLEDGE_LINE: hasIcons ? `- \`knowledge/icons.json\` — the legal icon set (names + import path). Use these; never inline \`<svg>\`.` : '',
  ICONS_RUBRIC_LINE: hasIcons ? `- **Icons** — an icon from \`${iconPkg}\` (see \`knowledge/icons.json\`), never an inline \`<svg>\` or icon font.` : '',
  ICONS_GENERATE_LINE: hasIcons ? `- Icons: use the icon set from \`${iconPkg}\` (names in \`knowledge/icons.json\`); never inline \`<svg>\` or paste SVG paths.` : '',
  ICONS_AUDIT_CLAUSE: hasIcons ? 'inline `<svg>` where the DS ships an icon set, ' : '',
  ICONS_RUBRIC_ARROW: hasIcons ? '→ icons ' : '',
  ICONS_AUDIT_FIX_LINE: hasIcons ? `- Replace inline \`<svg>\` / pasted SVG with the DS icon from \`${iconPkg}\`.` : '',
  ICONS_COUNT_CLAUSE: hasIcons ? ', {{ICON_COUNT}} icons' : '',
};

const apply = (text) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m)); // unknown → left for the model

// 4. copy prose with substitution (SKILL.md, reference/*.md, ARCHITECTURE.md).
const copyProse = (rel) => writeFileSync(resolvePath(target, rel), apply(readFileSync(resolvePath(templatesDir, rel), 'utf8')));
copyProse('SKILL.md');
copyProse('ARCHITECTURE.md');
for (const f of readdirSync(resolvePath(templatesDir, 'reference')))
  if (f.endsWith('.md')) copyProse(join('reference', f));

// 5. report.
console.log(`Scaffolded skill: ${skillName}`);
console.log(`  -> ${target}`);
console.log(`  engine: scripts/{ingest,audit,audit-runtime}.mjs (verbatim)`);
console.log(`  prose:  SKILL.md, ARCHITECTURE.md, reference/{generate,audit,verify}.md (placeholders filled: ${Object.keys(vars).length})`);
console.log(`  icons:  ${hasIcons ? `configured (${iconPkg})` : 'none'}`);
if (seededConfig) {
  console.log(`\n⚠ No design-system.config.json existed — seeded the annotated EXAMPLE. Edit it with the real`);
  console.log(`  sources from the interview, then re-run this scaffold so the prose picks up real values.`);
} else {
  console.log(`\nNext: node ${join(targetArg, 'scripts', 'ingest.mjs')}   # populate knowledge/`);
  console.log(`Then: refine the {{...}} prompts left in ARCHITECTURE.md, and Verify a render.`);
}
