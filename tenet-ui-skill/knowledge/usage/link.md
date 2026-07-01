# Link — usage guidelines

**When to use:** inline navigation — sending the user to another page or resource within flowing text or alongside other content. For an action that *does* something (submit, open a dialog, delete) use a `Button`; for a button styled as a link use `Button` with the `invisible` variant. A link navigates; a button acts.

## Rules

- It renders a real `<a>` and forwards its ref. Always give it descriptive link text ("View billing settings"), never "click here" or a bare URL — the text is the accessible name.
- `underline` defaults to `'hover'`. Prefer `'always'` for links sitting inside a paragraph of body text so they're distinguishable without relying on color alone; `'none'` is for links that already have another affordance (e.g. card-wide links, nav rows).
- `muted` swaps the accent color for the muted foreground (secondary/utility links). It still resolves to the accent color on hover for affordance.
- Pass `external` for off-site links: it sets `target="_blank"` + `rel="noopener noreferrer"` and appends a visually-hidden " (opens in new tab)" so screen-reader users are warned. A small `↗` glyph is shown (`aria-hidden`).
- The focus ring is a `:focus-visible` accent outline — don't suppress it.

## Do / Don't

- ✅ `<Link href="/settings/billing">View billing settings</Link>`
- ✅ `<Link href="https://example.com" external>Open the changelog</Link>`
- ❌ `<Link href="https://x.com" target="_blank">x.com</Link>` — opens a new tab with no `rel` and no screen-reader warning; use `external` instead.
- ❌ `<Link onClick={save}>Save</Link>` — that's an action, use a `Button`.
