# NumberInput — usage guidelines

**When to use:** entering a bounded quantity — a count, a price, a limit, a percentage. For free-form text use `TextInput`; for picking from a fixed list use `Select`.

## Rules

- Give it an accessible name via `FormControl.Label` or `aria-label`.
- It reports a parsed `number | null` through `onChange` — **don't** re-parse a string. An empty field is `null`, not `0`.
- Set `min` / `max` so the steppers and arrow keys clamp; set `step` to the natural increment (e.g. `5`, `0.1`).
- Control it with `value` + `onChange`, or leave uncontrolled with `defaultValue`.
- Use `size` / `block` from the scale; use `invalid` for validation state.
- **Never** use a raw `<input type="number">` styled by hand — you lose the token chrome, the clamping, and the number-typed change handler.

## Do / Don't

- ✅ `<NumberInput aria-label="Quantity" defaultValue={1} min={1} max={99} />`
- ✅ controlled: `<NumberInput value={qty} onChange={setQty} min={0} step={5} />`
- ❌ `<input type="number" className="myfield" />` — off-system, no `number | null` contract.
- ❌ Treating the empty state as `0` — it is `null`; decide intent explicitly.
