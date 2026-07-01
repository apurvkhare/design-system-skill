# Switch — usage guidelines

**When to use:** an immediate on/off setting that takes effect right away (e.g. "Enable notifications"). For a choice the user confirms later with a Save/Submit button, prefer `Checkbox`.

## Rules

- Give it a label via the `label` prop (or an associated `aria-label`). A switch with no name is unusable on a screen reader.
- It is a real `<input type="checkbox" role="switch">` — control it with `checked` + `onChange`, or leave it uncontrolled with `defaultChecked`.
- Use `caption` for a one-line explanation; don't pile a paragraph next to a toggle.
- Use `size="small"` only in dense rows (e.g. a settings table). Default to `medium`.
- **Never** build a toggle out of a `<div>` with an `onClick` — you lose the role, the checked state, and keyboard support.

## Do / Don't

- ✅ `<Switch label="Enable notifications" defaultChecked />`
- ✅ controlled: `<Switch label="Dark mode" checked={dark} onChange={e => setDark(e.target.checked)} />`
- ❌ `<Switch>` with no label and no `aria-label`.
- ❌ Using a Switch for a form value you submit on save — that's a `Checkbox`.
