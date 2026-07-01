# Generate — design → {{DESIGN_SYSTEM_NAME}} React

Goal: reproduce the target using **real {{DESIGN_SYSTEM_NAME}} components + tokens**,
wired so it actually renders. Order matters — wire the runtime first, because that's
the step everyone forgets and it's the difference between "renders" and "blank".

## 0. Read the runtime contract FIRST
Open `knowledge/runtime.json`. Import the required stylesheet(s) once at the app
entry (and mount any required provider). Use its `entryExample` verbatim as the
model. If you skip this, every `var(--token)` and component class is undefined and
the screen is unstyled — even though your component code is perfect.

## 1. Decompose the design into roles, then map to components
Look at the target and name each element by its *role*, then pick the
{{DESIGN_SYSTEM_NAME}} component from `knowledge/components.json`. Typical roles:
primary/secondary/destructive action → the button (icon-only → the icon button);
status word → the tag/label; text field / search → the text input; dropdown → the
select; on/off → the switch (confirm → checkbox, one-of-many → radio); date → the
date picker; action overflow (⋯) → the menu; tabs → the tabs; collapsible → the
accordion; inline message → the banner (transient → the toast); modal → the dialog;
table → the data table; loading → the spinner/skeleton; layout → the stack/card.

Don't reinvent any of these with a styled `<div>` — that's the primary violation.
For genuinely custom layout, use a plain element but style it with **tokens**.

## 2. Write the code
- Import components from `{{PACKAGE}}`. Use only props that exist in
  `knowledge/components.json` (check before using `variant`/`size` values).
- Any custom CSS uses `var(--token)` only — no hex, no arbitrary px. Match by
  meaning: text/surface/border colors, spacing, headings — all via tokens.
{{ICONS_GENERATE_LINE}}
- Read the relevant `knowledge/usage/…` for the components you use — they carry the
  rules people get wrong (accessible names, sort-on-value, etc.).
- Theme: use the mechanism in `knowledge/runtime.json` (usually a
  `{{THEME_ATTRIBUTE}}` attribute or a provider prop). Don't hand-build a dark palette.

## 3. Verify before declaring done (the gate)
Run, in order:
```
node scripts/audit.mjs <each generated .tsx>      # token/component/API hygiene → 0 errors
node scripts/audit-runtime.mjs <project-root>     # the stylesheet/provider is wired → 0 errors
```
Then **Verify** (`reference/verify.md`): actually render it and confirm it's styled
(a DS element has a real background/border, the font is the DS stack) and matches the
target in light and dark. "Compiles + audits clean" is necessary but not sufficient —
only a real render proves the runtime contract.
