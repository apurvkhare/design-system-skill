# Divider — usage guidelines

**When to use:** a thin rule that separates content groups — sections of a menu, columns in a toolbar, an "or" between two choices.

## Rules

- It renders `role="separator"` with the correct `aria-orientation`, so it's a real separator, not a decorative border. Use it instead of a styled `<hr>` or a bordered `<div>`.
- Use a labelled horizontal divider ("or") to split alternative actions; keep the label one or two words.
- Vertical dividers need a flex parent with a height to stretch against.
- Don't stack dividers to fake spacing — reach for `Stack` gaps for layout and a divider only when a visible rule communicates a boundary.

## Do / Don't

- ✅ `<Divider />`  ·  `<Divider>or</Divider>`
- ✅ `<Stack direction="horizontal"><span>A</span><Divider orientation="vertical" /><span>B</span></Stack>`
- ❌ `<hr style={{opacity:.2}} />` — off-system thickness/color.
