# Runtime contract — the piece everyone forgets

This is the single most important thing the generated skill gets right and most
hand-rolled attempts get wrong. **Citing real tokens is not enough.** Every
`var(--token)` and every component style is undefined until the design system is
*bootstrapped* at the app root. Get this wrong and the UI renders fully unstyled — no
background, no borders, fallback fonts, collapsed spacing, broken controls — even
though the component code is perfect and the content audit is clean.

So: discover exactly how *this* design system loads its styles, and encode it in
`config.runtime` (→ `knowledge/runtime.json`). `scripts/audit-runtime.mjs` then enforces
it as a gate.

## What to discover
1. **Stylesheet(s) to import.** Does the DS ship one CSS file (tokens + component
   styles together) or several (primitives + per-theme)? Find the exact import
   specifier(s) a consumer uses, e.g. `@acme/ui/styles.css`, or a set like Primer's
   `@primer/primitives/dist/css/{primitives,functional/themes/light,…}.css`.
2. **Provider(s) to mount.** Some systems need a React provider at the root (e.g. a
   `ThemeProvider` / `BaseStyles`). Note the import, where it comes from, and required
   props. Many systems need *none* (theming is just an attribute) — record `[]`.
3. **Theme mechanism.** How do you switch light/dark? Usually a data attribute on an
   ancestor (`data-color-mode`, `data-theme`) or a provider prop. Record the attribute
   name + values.
4. **Component class prefix (optional).** If component styles are scoped to namespaced
   classes (e.g. `Acme-Button`), record `classPrefix` so the runtime audit can detect
   DS usage even when a file uses no `var(--token)` directly.
5. **A few tokens that must resolve.** Pick 3–5 foundational tokens
   (`--bgColor-default`, `--fgColor-default`, a spacing token) for Verify to check
   `getComputedStyle` on — empty string ⇒ the stylesheet wasn't imported.

## How to discover it
- Read the DS's **"getting started / installation"** docs — the import lines there ARE
  the contract.
- Inspect the package **`package.json` `exports`** for a `./styles.css` (or similar)
  entry, and `sideEffects`.
- Look at the DS's own **example app / Storybook `preview.js`** — how it imports CSS
  and wraps stories is exactly what a consumer must do.
- If unsure, build the tiny throwaway app you'll use for Verify and confirm tokens
  resolve *only* after the import is added.

## Encode it (config.runtime)
```json
"runtime": {
  "summary": "One paragraph a human can act on: what to import, what provider (if any) to mount, how theming works, and the symptom if it's skipped.",
  "cssImports": ["@acme/ui/styles.css"],
  "classPrefix": "Acme-",
  "providers": [
    { "import": "ThemeProvider", "from": "@acme/ui", "wraps": "root", "props": { "colorMode": "light | dark" } }
  ],
  "themeAttribute": { "name": "data-theme", "values": ["light", "dark"], "appliedTo": "the documentElement (or any ancestor)" },
  "entryExample": "import '@acme/ui/styles.css';\n… mount providers … set the theme attribute … render(<App/>)",
  "verifyTokensResolve": ["--bgColor-default", "--fgColor-default", "--space-3"]
}
```
`providers: []` is correct and common — don't invent one. The `entryExample` should be
copy-pasteable; the generated Generate/Verify workflows quote it directly.

## Why the gate matters (the canonical lesson)
Two agents can rebuild the same page: one **hardcodes the palette** into hand-rolled
`<div>`s — it *looks* perfect but can't theme and fails the content audit; the other
**uses real tokens/components but forgets the stylesheet import** — it audits clean but
renders blank. The runtime audit + a real render (Verify) are what catch both. Bake
this into the generated skill and never optimize it away.
