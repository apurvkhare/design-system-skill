# Checkbox — usage guidelines

**When to use:** an independent on/off choice (or several non-exclusive ones). Use `Checkbox` with its `label`, not a raw `<input>` or a styled toggle `<div>`.

## Rules

- Always pass a `label` (it is associated to the input automatically); add `caption` for help text.
- For a set of mutually exclusive options use `RadioGroup`, not multiple checkboxes.
- Control with `checked` + `onChange`, or leave uncontrolled with `defaultChecked`.
- The tick color comes from the accent token (`accent-color`) — **never** restyle it with hardcoded colors.

## Do / Don't

- ✅ `<Checkbox label="Watch this repository" caption="Get notified of all activity." />`
- ❌ `<div className="checkbox checked" />` — not focusable, not a real input, no label.
