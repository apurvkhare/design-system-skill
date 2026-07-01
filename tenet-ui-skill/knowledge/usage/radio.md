# Radio & RadioGroup — usage guidelines

**When to use:** choosing exactly one option from a small, visible set. Always use `Radio` inside a `RadioGroup` — never a lone radio or a styled `<div>`.

## Rules

- `RadioGroup` renders a `<fieldset>`/`<legend>` and shares the `name` + selection with its `Radio` children — don't set `name` on each radio by hand.
- Give the group a `label`; give each `Radio` a `label` and a unique `value`. Add `caption` on the group or per radio for help text.
- Control with `value` + `onChange(value)`, or leave uncontrolled with `defaultValue`.
- The dot color comes from the accent token — **never** hardcode it.

## Do / Don't

- ✅
  ```tsx
  <RadioGroup label="Visibility" defaultValue="public">
    <Radio value="public" label="Public" />
    <Radio value="private" label="Private" />
  </RadioGroup>
  ```
- ❌ three `<input type="radio">` with a hand-set `name` and separate `<label>`s — reinvents the group, easy to get a11y wrong.
