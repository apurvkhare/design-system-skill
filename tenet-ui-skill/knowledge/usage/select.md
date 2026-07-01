# Select — usage guidelines

**When to use:** choosing one option from a known list. `Select` is a fully accessible listbox combobox (keyboard, typeahead, `aria-activedescendant`) — not a native `<select>`. Use it inside a `FormControl`.

## Rules

- Give it an accessible name via `FormControl.Label` or `aria-label`.
- Pass choices as the `options` array (`{ value, label, disabled? }`); use `placeholder` for the unselected state.
- Control it with `value` + `onChange(value)`, or leave uncontrolled with `defaultValue`. For form submission, pass `name` (it emits a hidden input).
- Use `size` / `block` from the scale; use `invalid` for validation state.
- **Never** build a div-based dropdown by hand — getting the ARIA listbox + keyboard right is exactly what this component does for you.

## Do / Don't

- ✅ `<Select options={[{ value: 'public', label: 'Public' }]} placeholder="Choose…" />`
- ✅ inside a form: `<FormControl><FormControl.Label>Visibility</FormControl.Label><Select options={…} /></FormControl>`
- ❌ `<div className="dropdown" onClick={…}>` — not keyboard-accessible, no roles, no typeahead.
