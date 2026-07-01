# Verify — prove it actually renders (the gate)

The audits check the code; **Verify checks reality**. The canonical failure is
code that audits clean but renders unstyled because the stylesheet was never
imported. Never call a Generate done without this step.

## Fastest path: the repo demo harness
`demo-app/` (Vite, fixed to port 5180) imports `tenet-ui/styles.css` once in
`src/main.jsx` — the exact import the skill mandates — and aliases `tenet-ui` (and
`tenet-ui/styles.css`) to the local DS in `vite.config.mjs`. Drop the generated
component into a route/section there, then:
```
cd demo-app && npm run dev     # fixed to :5180 via vite.config (strictPort)
curl -s -o /dev/null -w "%{http_code}" http://localhost:5180/   # expect 200
```
Caveat: the harness aliases components to the DS *source* for fast iteration, so
it proves the stylesheet import path and that tokens/classes resolve — but the
truest test of the published package is a throwaway app that `npm install`s
`tenet-ui` and imports only `tenet-ui/styles.css`.

## What to actually check (not just "it loaded")
1. **It's styled, not blank.** The #1 bug renders a page of unstyled HTML. Confirm
   a tenet-ui element has real computed styles — e.g. a `Tenet-Button`/`Tenet-Card`
   has a non-transparent background or a visible border, and the body font is the
   editorial stack. A quick programmatic check (Playwright/JS):
   ```js
   const bg = getComputedStyle(document.querySelector('[class^="Tenet-"]')).backgroundColor;
   const tokenResolves = getComputedStyle(document.documentElement).getPropertyValue('--bgColor-default').trim();
   // tokenResolves must be non-empty; if it's '' the stylesheet wasn't imported.
   ```
   If `--bgColor-default` resolves to empty string, the runtime contract is broken
   — go back and add `import 'tenet-ui/styles.css'`.
2. **Both themes.** Toggle `document.documentElement.dataset.colorMode` between
   `light` and `dark`; the UI should re-theme with no hardcoded colors surviving.
3. **a11y holds.** If Playwright + axe-core are available, drive the page and run
   axe (wcag2a+aa), expecting 0 violations — generated UI inherits the components'
   accessibility, so violations usually mean a raw element crept in or an
   accessible name is missing. (These aren't in `demo-app`'s deps by default;
   `npm i -D playwright axe-core` there, or skip this step — it's optional, the
   styled-render and both-themes checks are the hard gate.)
4. **It matches the target.** Screenshot and compare structure/spacing/hierarchy
   to the design. Differences should be intentional, not drift.

## Pass bar
Renders **styled** (tokens resolve) in light AND dark, axe clean if available, and
structurally matches the target. Only now is Generate complete. If you changed the
palette or a token while fixing, re-check both themes (a tweak that's AA in light
can fail in dark).
