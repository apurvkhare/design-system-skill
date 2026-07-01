# Audit — find & fix {{DESIGN_SYSTEM_NAME}} violations in existing code

Use when asked "is this compliant?", "find design-system violations", or before
merging generated/handwritten UI. Two outputs can look identical while one is
non-compliant (hardcoded palette that can't theme), and a token-perfect file can
render broken (styles never imported) — so audit on **both** axes.

## Run both scanners
```
node scripts/audit-runtime.mjs <project-root>     # does {{DESIGN_SYSTEM_NAME}} resolve at runtime?
node scripts/audit.mjs <file.tsx>                 # is this file token/component/API-clean?
```
- `audit-runtime.mjs` scans the whole project for the required import(s)/provider(s)
  from `knowledge/runtime.json`. **If it fails, fix that first** — every other
  finding is moot because nothing renders. Symptom in the app: unstyled page.
- `audit.mjs` flags, per file: hardcoded colors (hex/rgb), off-scale px, unknown
  `var(--…)`, raw `<button>/<input>/<textarea>/<select>/<a>` that have a DS
  equivalent, {{ICONS_AUDIT_CLAUSE}}and invented props on DS components. Each finding
  includes the concrete fix. Run it on every changed file; use `--json` to aggregate.

## Score against the rubric (same one Generate targets)
Runtime wiring → components → color → spacing/size → typography/radius/border/shadow
{{ICONS_RUBRIC_ARROW}}→ API → guidelines. (Full rubric in `SKILL.md`.) A clean audit
means 0 errors on **both** scanners.

## Fix using the same rubric, then re-score
- Replace hand-rolled controls with the real component.
- Replace hardcoded values with the suggested tokens. For status colors prefer the
  semantic tints, not raw hues.
{{ICONS_AUDIT_FIX_LINE}}
- Remove invented props; use the real API from `knowledge/components.json`.
- If runtime failed, add the required import(s)/provider(s) at the entry.
Re-run both scanners until 0 errors, then **Verify** (`reference/verify.md`) — a
clean audit is necessary but does not prove it renders.

## The trap to call out explicitly
A hardcoded-palette reimplementation can pass the runtime check and *look* perfect
in one theme while being deeply non-compliant: it can't be themed, can't be audited
for token drift, and won't pick up design-system changes. Flag it as a
**components/color** failure even though "it looks right" — that's precisely the case
this skill exists to catch.
