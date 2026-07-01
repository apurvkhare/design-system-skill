# Label — usage guidelines

**When to use:** a small status / category pill attached to an item (e.g. `bug`, `triaged`, `ready`). Use `Label` instead of a hand-styled `<span>` so the color schemes stay owned by the design system.

## Rules

- Choose `variant` by **meaning**, not by color: `success` for positive/done, `danger` for problems, `accent` for emphasis, `muted`/`default` for neutral tags.
- Do **not** compute your own fills, borders, or translucent backgrounds from a hex value — that is exactly the anti-pattern this component exists to remove. Map your data's category to a `variant`.
- Keep label text short (one or two words). For long-form status, use text, not a Label.
- `Label` is non-interactive. For a clickable tag, wrap or use a button/link, don't add click handlers that look like plain text.

## Do / Don't

- ✅ `<Label variant="danger">bug</Label>`
- ✅ map data → variant: `const variant = issue.blocking ? 'danger' : 'muted'`
- ❌ `<span style={{ background: 'rgba(207,34,46,.18)', color: '#ff8182', border: '1px solid rgba(207,34,46,.35)' }}>bug</span>` — hand-tuned translucent colors; reinvents the component.
