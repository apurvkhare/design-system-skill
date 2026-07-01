# Audit — find & fix tenet-ui violations in existing code

Use when asked "is this compliant?", "find design-system violations", or before
merging generated/handwritten UI. Two outputs can look identical while one is
non-compliant (hardcoded palette that can't theme), and a token-perfect file can
render broken (styles never imported) — so audit on **both** axes.

## Run both scanners
```
node scripts/audit-runtime.mjs <project-root>     # does tenet-ui resolve at runtime?
node scripts/audit.mjs <file.tsx>                 # is this file token/component/API-clean?
```
- `audit-runtime.mjs` scans the whole project for the one required import
  (`tenet-ui/styles.css`). **If it fails, fix that first** — every other finding is
  moot because nothing renders. Symptom in the app: unstyled page.
- `audit.mjs` flags, per file: hardcoded colors (hex/rgb), off-scale px, unknown
  `var(--…)`, raw `<button>/<input>/<textarea>/<select>/<a>` that have a tenet-ui
  equivalent, and invented props on tenet-ui components. Each finding includes the
  concrete fix (the token/component to use). Run it on every changed file; use
  `--json` to aggregate across many.

## Score against the rubric (same one Generate targets)
Runtime wiring → components → color → spacing/size → typography/radius/border/shadow
→ API → guidelines. (Full rubric in `SKILL.md`.) A clean audit means 0 errors on
**both** scanners.

## Fix using the same rubric, then re-score
- Replace hand-rolled controls with the real component (`<button>` → `Button`, a
  styled status `<span>` → `Label`, a div-dropdown → `Select`/`Menu`, …).
- Replace hardcoded values with the suggested tokens. For status colors prefer the
  semantic tints (`--bgColor-<status>-muted` + `--fgColor-<status>`), not raw hues.
- Remove invented props; use the real API from `knowledge/components.json`.
- If runtime failed, add `import 'tenet-ui/styles.css'` once at the entry.
Re-run both scanners until 0 errors, then **Verify** (`reference/verify.md`) — a
clean audit is necessary but does not prove it renders.

## The trap to call out explicitly
A hardcoded-palette reimplementation can pass the runtime check and *look* perfect
in one theme while being deeply non-compliant: it can't be themed, can't be
audited for token drift, and won't pick up design-system changes. Flag it as a
**components/color** failure even though "it looks right" — that's precisely the
case this skill exists to catch.
