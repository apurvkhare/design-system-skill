# TextInput — usage guidelines

**When to use:** any single-line text entry — search, email, name, filter. Use `TextInput` instead of a raw `<input>` so border, height, focus ring, and spacing stay on-system.

## Rules

- Always give the field an accessible name: an associated `<label>` or an `aria-label`. A placeholder is **not** a label.
- Use `leadingVisual` / `trailingVisual` for icons (e.g. a search glyph) rather than absolutely-positioning your own.
- Use `size` from the scale (`small` | `medium` | `large`); use `block` to fill the container width instead of inline `width: 100%`.
- Use `invalid` to signal validation errors — it sets `aria-invalid` and the danger border. Don't recolor the border by hand.
- **Never** hardcode height, border, or colors — they come from `control.*`, `borderColor`, and `bgColor`/`fgColor` tokens.

## Do / Don't

- ✅ `<TextInput aria-label="Search all issues" leadingVisual={<SearchIcon />} block />`
- ❌ `<input style={{ height: 32, border: '1px solid #d0d7de', padding: '0 12px' }} />` — raw element, hardcoded chrome, no accessible name.
