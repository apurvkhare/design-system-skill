# Stack — usage guidelines

**When to use:** any time you place two or more elements next to or above each other with space between them. `Stack` is the design-system layout primitive — reach for it instead of writing `display: flex` with hardcoded gaps, and instead of reinventing a generic `Box`.

## Rules

- Use `direction` for the axis and `gap` for spacing — `gap` values map to the `space` scale (`condensed`=8, `normal`=16, `spacious`=24). **Never** set a pixel gap or margins between Stack children.
- Use `Stack.Item grow` for the child that should absorb extra space (e.g. a search field in a toolbar) rather than `flex: 1` inline.
- Use `align` / `justify` for alignment; don't add wrapper `<div>`s just to center things.
- `padding` (optional) also comes from the `space` scale.

## Do / Don't

- ✅ `<Stack direction="horizontal" gap="condensed" align="center">…</Stack>`
- ✅ `<Stack.Item grow><TextInput … /></Stack.Item>`
- ❌ `<div style={{ display: 'flex', gap: 12 }}>` — raw flex, hardcoded gap.
- ❌ A bespoke `Box` component that re-implements spacing with a custom `sx` prop.
