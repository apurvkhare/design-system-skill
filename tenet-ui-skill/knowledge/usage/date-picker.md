# DatePicker — usage guidelines

**When to use:** picking a single date from a compact field that opens a calendar on demand (forms, filters). For an always-visible month grid, use `Calendar` directly (DatePicker wraps it).

## Rules

- Give it an accessible name via `FormControl.Label` or `aria-label`.
- Control it with `value` + `onChange`, or leave uncontrolled with `defaultValue`. `onChange` hands you a real `Date`.
- Constrain with `min` / `max`; the popover calendar disables out-of-range days and stops its nav at the boundary.
- For form submission pass `name` — it emits a hidden `yyyy-mm-dd` input. Use `size` / `block` from the scale and `invalid` for validation state.
- Set `weekStartsOn={1}` and/or `locale` for non-US conventions; the displayed date and the calendar both follow them.
- **Never** assemble a text input + hand-built dropdown calendar yourself — the popover focus management, the ARIA grid, and the keyboard model are exactly what this composes for you.

## Do / Don't

- ✅ `<DatePicker aria-label="Due date" defaultValue={new Date()} min={new Date()} />`
- ✅ in a form: `<FormControl><FormControl.Label>Start date</FormControl.Label><DatePicker name="start" /></FormControl>`
- ❌ `<TextInput />` next to a `<div>` calendar wired by hand — no focus trap-out, no roving grid, no Escape handling.
- ❌ Storing the value as a formatted string — keep the `Date`; format only for display.
