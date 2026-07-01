// Ingest a design system into a committed knowledge snapshot the skill reads:
//   knowledge/tokens.json      — every legal token (name, cssVar, light/dark or value, type, description)
//   knowledge/components.json  — component catalog (props, variants, subcomponents, importPath), keyed by id
//   knowledge/usage/*.md       — per-component usage guidelines (copied) OR usage/stories.json (Storybook)
//   knowledge/icons.json       — the legal icon set (names + importPath + usage) — optional
//   knowledge/runtime.json     — the runtime contract (how tokens/styles bootstrap)
//   knowledge/meta.json        — counts + provenance
//
// This is a GENERIC, dependency-free ingester (Node >=18 for global fetch). It is driven ENTIRELY by
// design-system.config.json — retarget to any design system by editing that config and re-running.
// Each knowledge category ("tokens", "components", "usage", "icons") declares a `mode` that selects
// how it is sourced. `mode: "manual"` means the corresponding knowledge file is authored by hand
// (e.g. the model normalized Confluence/Figma/screenshots into it) and ingest LEAVES IT UNTOUCHED.
//
//   node scripts/ingest.mjs [--from <path>]   (--from overrides a local packageDir for npm/repo modes)
import { mkdirSync, writeFileSync, readFileSync, readdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve as resolvePath, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(resolvePath(skillDir, 'design-system.config.json'), 'utf8'));
const knowledgeDir = resolvePath(skillDir, config.knowledgeDir || 'knowledge');
mkdirSync(resolvePath(knowledgeDir, 'usage'), { recursive: true });

const fromFlag = process.argv.indexOf('--from');
const fromArg = fromFlag >= 0 ? process.argv[fromFlag + 1] : null;

const write = (rel, data) => writeFileSync(resolvePath(knowledgeDir, rel), JSON.stringify(data, null, 2) + '\n');
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));
const fill = (tpl, vars) => String(tpl).replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}
// Resolve a local source dir for npm/repo modes: --from wins, then the category packageDir
// (relative to the skill), then node_modules/<package> in the CWD (a consumer's install).
function resolveDir(cat) {
  const candidates = [
    fromArg && resolvePath(process.cwd(), fromArg),
    cat.packageDir && resolvePath(skillDir, cat.packageDir),
    config.package && resolvePath(process.cwd(), 'node_modules', config.package),
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) || null;
}

const counts = {};
const provenance = {};

// ---------------------------------------------------------------- TOKENS ----
async function ingestTokens() {
  const t = config.tokens || { mode: 'manual' };
  if (t.mode === 'manual') { provenance.tokens = 'manual (authored)'; return; }

  if (t.mode === 'npm-json' || t.mode === 'repo-file') {
    const dir = resolveDir(t);
    if (!dir) throw new Error(`tokens: could not resolve source dir (packageDir "${t.packageDir}"). Pass --from <path>.`);
    const file = resolvePath(dir, t.path || 'dist/tokens.json');
    const tokens = readJSON(file);
    write('tokens.json', tokens);
    counts.tokens = Object.keys(tokens).length;
    provenance.tokens = file;
    return;
  }

  if (t.mode === 'url') {
    // Fetch per-theme color tokens (themes[0]=light/base, themes[1]=dark), then non-color files, and merge.
    const u = t.urls || {};
    const vars = { ...(config.packages || {}) };
    const tokens = {};
    const slim = (name, tok) => ({ name, cssVar: `--${name}`, type: tok?.type ?? null, description: tok?.description ?? '' });
    if (u.themeUrl && Array.isArray(u.themes)) {
      const themeData = await Promise.all(u.themes.map((theme) => getJSON(fill(u.themeUrl, { ...vars, theme }))));
      const [light = {}, dark = {}] = themeData;
      for (const [name, tok] of Object.entries(light)) tokens[name] = { ...slim(name, tok), light: tok.value, dark: null };
      for (const [name, tok] of Object.entries(dark)) {
        if (tokens[name]) tokens[name].dark = tok.value;
        else tokens[name] = { ...slim(name, tok), light: null, dark: tok.value };
      }
    }
    for (const path of u.nonColor || []) {
      const fileData = await getJSON(fill(u.nonColorUrl, { ...vars, path }));
      for (const [name, tok] of Object.entries(fileData)) {
        if (!tokens[name]) tokens[name] = { ...slim(name, tok), light: tok.value, dark: tok.value };
        else { if (tokens[name].light == null) tokens[name].light = tok.value; if (tokens[name].dark == null) tokens[name].dark = tok.value; }
      }
    }
    for (const tok of Object.values(tokens)) if (tok.dark == null) tok.dark = tok.light; // no dark override => same
    write('tokens.json', tokens);
    counts.tokens = Object.keys(tokens).length;
    provenance.tokens = u.themeUrl ? fill(u.themeUrl, { ...vars, theme: (u.themes || ['?'])[0] }) : 'url';
    return;
  }
  throw new Error(`tokens: unknown mode "${t.mode}"`);
}

// ------------------------------------------------------------ COMPONENTS ----
async function ingestComponents() {
  const c = config.components || { mode: 'manual' };
  if (c.mode === 'manual') { provenance.components = 'manual (authored)'; return; }

  let catalog;
  if (c.mode === 'npm-json' || c.mode === 'repo-file') {
    const dir = resolveDir(c);
    if (!dir) throw new Error(`components: could not resolve source dir (packageDir "${c.packageDir}"). Pass --from <path>.`);
    const file = resolvePath(dir, c.path || 'generated/components.json');
    catalog = readJSON(file);
    provenance.components = file;
  } else if (c.mode === 'url') {
    catalog = await getJSON(fill(c.url, config.packages || {}));
    provenance.components = fill(c.url, config.packages || {});
  } else {
    throw new Error(`components: unknown mode "${c.mode}"`);
  }
  // The catalog may be { components: { <id>: {...} } } or already the inner map. Flatten so the
  // audit can Object.values() it directly. Normalize each entry to the shape the audit relies on.
  const raw = catalog.components || catalog;
  const components = {};
  for (const [id, comp] of Object.entries(raw)) {
    components[id] = {
      id: comp.id ?? id,
      name: comp.name ?? id,
      status: comp.status ?? null,
      importPath: comp.importPath ?? c.importPath ?? config.package ?? '',
      props: (comp.props || []).map((p) => ({
        name: p.name, type: p.type, required: !!p.required,
        defaultValue: p.defaultValue ?? '', description: p.description ?? '',
      })),
      subcomponents: comp.subcomponents ?? [],
      stories: comp.stories ?? [],
    };
  }
  write('components.json', components);
  counts.components = Object.keys(components).length;
}

// ----------------------------------------------------------------- USAGE ----
async function ingestUsage() {
  const u = config.usage || { mode: 'none' };
  if (u.mode === 'none') { provenance.usage = 'none'; return; }
  if (u.mode === 'manual') { provenance.usage = 'manual (authored *.md)'; counts.usage = countUsageMd(); return; }

  if (u.mode === 'package-md' || u.mode === 'repo-md') {
    const dir = resolveDir(u);
    if (!dir) throw new Error(`usage: could not resolve source dir (packageDir "${u.packageDir}").`);
    const srcDir = resolvePath(dir, u.dir || 'guidelines');
    let files = [];
    try { files = readdirSync(srcDir).filter((f) => f.endsWith('.md')); } catch { /* none */ }
    for (const f of files) copyFileSync(join(srcDir, f), resolvePath(knowledgeDir, 'usage', f));
    counts.usage = files.length;
    provenance.usage = srcDir;
    return;
  }
  if (u.mode === 'storybook-url') {
    const index = await getJSON(u.storybookIndexUrl);
    const stories = {};
    for (const e of Object.values(index.entries || index.stories || {})) {
      if (e.type && e.type !== 'story') continue;
      (stories[e.title || 'Unknown'] ||= []).push({
        id: e.id, name: e.name, exportName: e.exportName, importPath: e.importPath, tags: e.tags || [],
      });
    }
    write('usage/stories.json', stories);
    counts.usage = Object.keys(stories).length;
    provenance.usage = u.storybookIndexUrl;
    return;
  }
  throw new Error(`usage: unknown mode "${u.mode}"`);
}
function countUsageMd() {
  try { return readdirSync(resolvePath(knowledgeDir, 'usage')).filter((f) => f.endsWith('.md')).length; } catch { return 0; }
}

// ----------------------------------------------------------------- ICONS ----
// Optional. Many DSs ship icons as a SEPARATE package/set — code should use those, not inline <svg>.
async function ingestIcons() {
  const ic = config.icons;
  if (!ic || ic.mode === 'none') return;
  if (ic.mode === 'manual') { provenance.icons = 'manual (authored icons.json)'; counts.icons = safeIconCount(); return; }

  let names = [];
  if (ic.mode === 'repo-svgs') {
    const dir = resolveDir(ic);
    if (!dir) throw new Error(`icons: could not resolve source dir (packageDir "${ic.packageDir}").`);
    const svgDir = resolvePath(dir, ic.path || 'icons');
    const walk = (d) => { for (const e of readdirSync(d)) { const p = join(d, e); statSync(p).isDirectory() ? walk(p) : e.endsWith('.svg') && names.push(basename(e, '.svg')); } };
    try { walk(svgDir); } catch { /* none */ }
    provenance.icons = svgDir;
  } else if (ic.mode === 'json') {
    // A JSON array of names, or an object whose keys are names, from a local path or URL.
    const data = ic.url ? await getJSON(fill(ic.url, config.packages || {})) : readJSON(resolveDir(ic) ? resolvePath(resolveDir(ic), ic.path) : resolvePath(skillDir, ic.path));
    names = Array.isArray(data) ? data.map(String) : Object.keys(data);
    provenance.icons = ic.url || ic.path;
  } else {
    throw new Error(`icons: unknown mode "${ic.mode}"`);
  }
  names = [...new Set(names)].sort();
  write('icons.json', {
    package: ic.package ?? null,
    importPath: ic.importPath ?? ic.package ?? null,
    usage: ic.usage ?? 'Use these icon components/names — never inline <svg> or a raw icon font.',
    componentPattern: ic.componentPattern ?? null, // e.g. "<Icon name=\"...\" />" or "named-export"
    names,
  });
  counts.icons = names.length;
}
function safeIconCount() { try { return (readJSON(resolvePath(knowledgeDir, 'icons.json')).names || []).length; } catch { return 0; } }

// ----------------------------------------------------------------- MAIN ----
try {
  await ingestTokens();
  await ingestComponents();
  await ingestUsage();
  await ingestIcons();
  if (config.runtime) { write('runtime.json', config.runtime); provenance.runtime = 'config.runtime'; }

  write('meta.json', {
    designSystem: config.designSystem,
    package: config.package || null,
    packages: config.packages || null,
    counts,
    hasRuntimeContract: !!config.runtime,
    hasIcons: !!(config.icons && config.icons.mode !== 'none'),
    provenance,
  });

  const summary = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' | ') || '(all manual)';
  console.log(summary);
  console.log(`-> ${knowledgeDir}`);
} catch (err) {
  console.error(`ingest failed: ${err.message}`);
  process.exit(1);
}
