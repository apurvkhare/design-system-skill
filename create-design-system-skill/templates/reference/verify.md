# Verify — prove it actually renders (the gate)

The audits check the code; **Verify checks reality**. The canonical failure is code
that audits clean but renders unstyled because the stylesheet was never imported (or
the provider never mounted). Never call a Generate done without this step.

## Render it
Drop the generated component into a real app that wires the runtime exactly as
`knowledge/runtime.json` mandates (import the stylesheet(s) once; mount any provider).
{{VERIFY_HARNESS_LINE}} Start it and confirm the page returns 200 and paints.

## What to actually check (not just "it loaded")
1. **It's styled, not blank.** The #1 bug renders a page of unstyled HTML. Confirm a
   DS element has real computed styles and that a token resolves:
   ```js
   const tokenResolves = getComputedStyle(document.documentElement)
     .getPropertyValue('{{VERIFY_TOKEN}}').trim();
   // must be non-empty; if it's '' the stylesheet wasn't imported — the runtime contract is broken.
   ```
   If it resolves to empty string, go back and wire the runtime.
2. **Both themes.** Toggle the theme mechanism from `knowledge/runtime.json`
   (usually a `{{THEME_ATTRIBUTE}}` attribute or provider prop); the UI should
   re-theme with no hardcoded colors surviving.
3. **a11y holds.** If Playwright + axe-core are available, drive the page and run axe
   (wcag2a+aa), expecting 0 violations — generated UI inherits the components'
   accessibility, so violations usually mean a raw element crept in or an accessible
   name is missing. (Optional; the styled-render and both-themes checks are the hard gate.)
4. **It matches the target.** Screenshot and compare structure/spacing/hierarchy to
   the design. Differences should be intentional, not drift.

## Pass bar
Renders **styled** (tokens resolve) in light AND dark, axe clean if available, and
structurally matches the target. Only now is Generate complete. If you changed the
palette or a token while fixing, re-check both themes (a tweak that's AA in light can
fail in dark).
