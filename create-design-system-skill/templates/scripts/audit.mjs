// Audit a React/TSX file for design-system compliance against the ingested knowledge base.
// Checks token hygiene (no hardcoded color/px, no unknown tokens), component usage (no raw element
// where a DS component exists), component API (no invented props), and iconography (no inline <svg>
// when the DS ships an icon set). Heuristic, dependency-free. Usage: node scripts/audit.mjs <file.tsx> [--json]
//
// NOTE: this audits token *names* in ONE file. It does NOT prove the styles load at runtime —
// that's audit-runtime.mjs (run BOTH), and neither replaces Verify (a real render).
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const K = (rel) => resolvePath(skillDir, 'knowledge', rel);
const tokens = JSON.parse(readFileSync(K('tokens.json'), 'utf8'));
const components = JSON.parse(readFileSync(K('components.json'), 'utf8'));
const meta = JSON.parse(readFileSync(K('meta.json'), 'utf8'));
const icons = existsSync(K('icons.json')) ? JSON.parse(readFileSync(K('icons.json'), 'utf8')) : null;

const fileArg = process.argv[2];
const asJson = process.argv.includes('--json');
if (!fileArg) { console.error('usage: node scripts/audit.mjs <file.tsx> [--json]'); process.exit(2); }
const src = readFileSync(fileArg, 'utf8');

// ---- indexes from the knowledge base ----
// Themed tokens carry .light/.dark; shared tokens (space/radius/size) carry .value.
const resolvedOf = (t) => String(t.light ?? t.value ?? '').toLowerCase();
const hexToTokens = {};
const pxToTokens = {};
const cssVars = new Set();
for (const t of Object.values(tokens)) {
  if (t.cssVar) cssVars.add(t.cssVar);
  const v = resolvedOf(t);
  if (/^#[0-9a-f]{3,8}$/.test(v)) (hexToTokens[v] ||= []).push(t.name);
  if (/^\d+px$/.test(v)) (pxToTokens[v] ||= []).push(t.name);
}
// Prefer semantic tokens over base primitives in suggestions.
const rank = (n) => (/^(fgColor|bgColor|borderColor)-/.test(n) ? 0 : /^(space|control|borderRadius|fontSize|fontWeight)-/.test(n) ? 0 : /^base-/.test(n) ? 2 : 1);
const suggest = (map, key) => (map[key] || []).slice().sort((a, b) => rank(a) - rank(b)).slice(0, 3);

const componentByName = {};
for (const c of Object.values(components)) componentByName[c.name] = c;

// API index for prop validation, INCLUDING compound subcomponents (e.g. Tabs.Tab, Table.Header).
// Value = Set of prop names to validate against, or null = "known component but prop surface not
// catalogued — skip prop checks" (avoids false positives on prop-less compound primitives).
const apiByName = {};
for (const c of Object.values(components)) {
  apiByName[c.name] = new Set((c.props || []).map((p) => p.name));
  for (const sub of c.subcomponents || []) {
    if (typeof sub === 'string') apiByName[sub] = null;
    else if (sub && sub.name) apiByName[sub.name] = sub.props?.length ? new Set(sub.props.map((p) => p.name)) : null;
  }
}

// Raw element -> DS component that should be used instead (only flagged if that component exists).
const RAW_MAP = { button: 'Button', input: 'TextInput', textarea: 'Textarea', select: 'Select', a: 'Link' };
const GLOBAL_ATTRS = new Set(['key', 'ref', 'as', 'className', 'class', 'style', 'id', 'role', 'title', 'slot', 'hidden', 'dir', 'lang', 'tabIndex', 'draggable', 'spellCheck', 'translate', 'autoFocus', 'htmlFor', 'for', 'name', 'value', 'type', 'placeholder', 'disabled', 'required', 'checked', 'defaultValue', 'defaultChecked', 'readOnly', 'maxLength', 'minLength', 'min', 'max', 'step', 'pattern', 'autoComplete', 'multiple', 'rows', 'cols', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'loading', 'open', 'selected', 'colSpan', 'rowSpan', 'children']);
const isPassthrough = (a) => GLOBAL_ATTRS.has(a) || /^(aria|data)-/.test(a) || /^on[A-Z]/.test(a);

const lineOf = (idx) => src.slice(0, idx).split('\n').length;
const violations = [];
const add = (dimension, severity, idx, code, message, suggestion) =>
  violations.push({ dimension, severity, line: lineOf(idx), code: String(code).trim(), message, suggestion });

// 1. hardcoded colors
for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
  const s = suggest(hexToTokens, m[0].toLowerCase());
  add('color', 'error', m.index, m[0], `Hardcoded color ${m[0]} — colors must come from a token.`,
    s.length ? `use var(--${s[0]})${s.length > 1 ? ` (or --${s.slice(1).join(', --')})` : ''}` : 'use a semantic color token (e.g. --fgColor-default)');
}
for (const m of src.matchAll(/\b(rgb|rgba|hsl|hsla)\(/g))
  add('color', 'error', m.index, `${m[1]}()`, `Hardcoded ${m[1]}() color — use a color token.`, 'use a color token');

// 2. hardcoded dimensions (the 4px scale; 1/2px are allowed hairlines)
for (const m of src.matchAll(/\b(\d+(?:\.\d+)?)px\b/g)) {
  const n = parseFloat(m[1]);
  if (n === 0) continue;
  const offScale = !(n % 4 === 0 || n === 1 || n === 2);
  const s = suggest(pxToTokens, m[0]);
  add('spacing', offScale ? 'error' : 'warn', m.index, m[0],
    `Hardcoded ${m[0]}${offScale ? ' (off the 4px scale)' : ''} — spacing/size must come from a token.`,
    s.length ? `use var(--${s[0]})` : 'use a spacing/size token');
}

// 3. unknown token (css var) references
for (const m of src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g))
  if (!cssVars.has(m[1])) add('token', 'error', m.index, m[1], `Unknown token ${m[1]} — not in ${meta.designSystem}.`, 'use a real token from knowledge/tokens.json');

// 4. raw HTML elements that have a DS equivalent
for (const m of src.matchAll(/<([a-z][a-z0-9]*)\b/g)) {
  const repl = RAW_MAP[m[1]];
  if (repl && componentByName[repl]) add('components', 'error', m.index, `<${m[1]}>`, `Raw <${m[1]}> where ${meta.designSystem} provides <${repl}>.`, `import { ${repl} } from '${componentByName[repl].importPath || meta.package || 'the design system'}'`);
}

// 5. iconography — inline SVG where the DS ships an icon set
if (icons && (icons.names?.length || icons.importPath)) {
  const where = icons.importPath ? `use an icon from '${icons.importPath}'` : (icons.usage || 'use the design-system icon set');
  for (const m of src.matchAll(/<svg\b/g)) add('icons', 'error', m.index, '<svg>', `Inline <svg> — ${meta.designSystem} ships an icon set; inline icons drift from it.`, where);
  // If icons expose an <Icon name="..."/> API and we know the valid names, flag unknown names.
  if (icons.componentPattern && /name=/.test(icons.componentPattern) && icons.names?.length) {
    const nameSet = new Set(icons.names);
    for (const m of src.matchAll(/<Icon\b[^>]*\bname\s*=\s*["']([^"']+)["']/g))
      if (!nameSet.has(m[1])) add('icons', 'error', m.index, m[1], `Unknown icon "${m[1]}" — not in the icon set.`, 'use a name from knowledge/icons.json');
  }
}

// 6. invented / unknown props on DS components (incl. compound, e.g. Tabs.Tab)
for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)*)\b([^>]*?)\/?>/g)) {
  const name = m[1];
  if (!(name in apiByName)) continue;
  const propSet = apiByName[name];
  if (!propSet) continue;
  for (const a of m[2].matchAll(/([A-Za-z_][\w-]*)\s*=/g)) {
    const attr = a[1];
    if (propSet.has(attr) || isPassthrough(attr)) continue;
    const valid = [...propSet].filter((p) => !isPassthrough(p)).slice(0, 6);
    add('api', 'error', m.index, attr, `'${attr}' is not a prop of <${name}>.`, valid.length ? `valid props include: ${valid.join(', ')}` : 'see knowledge/components.json');
  }
}

// ---- report ----
const order = ['color', 'spacing', 'token', 'components', 'icons', 'api'];
const label = { color: 'Color', spacing: 'Spacing & size', token: 'Unknown token', components: 'Components', icons: 'Iconography', api: 'Component API' };
const counts = {};
for (const v of violations) counts[v.dimension] = (counts[v.dimension] || 0) + 1;
const errors = violations.filter((v) => v.severity === 'error').length;

if (asJson) {
  console.log(JSON.stringify({ file: fileArg, total: violations.length, errors, counts, violations }, null, 2));
  process.exit(errors ? 1 : 0);
}

console.log(`\n${meta.designSystem} compliance audit — ${fileArg}`);
console.log(`DS: ${meta.designSystem} (${meta.counts?.components ?? '?'} components, ${meta.counts?.tokens ?? '?'} tokens${meta.counts?.icons ? `, ${meta.counts.icons} icons` : ''})`);
const byDim = {};
for (const v of violations) (byDim[v.dimension] ||= []).push(v);
for (const dim of order) {
  const list = byDim[dim];
  if (!list?.length) continue;
  console.log(`\n${label[dim]} — ${list.length}`);
  for (const v of list.sort((a, b) => a.line - b.line))
    console.log(`  L${String(v.line).padEnd(3)} ${v.code.padEnd(20)} ${v.message}\n        ↳ ${v.suggestion}`);
}
console.log(`\nScorecard: ${order.filter((d) => counts[d]).map((d) => `${d} ${counts[d]}`).join('  |  ') || 'clean'}`);
console.log(violations.length ? `\n✗ ${violations.length} violations (${errors} errors). NOT ${meta.designSystem} compliant.\n` : `\n✓ Compliant — 0 violations. (Now run audit-runtime.mjs + Verify.)\n`);
process.exit(errors ? 1 : 0);
