# FormControl & form fields — usage guidelines

**When to use:** every labeled form field. `FormControl` wraps a label, a field, and optional caption/validation, and wires the accessibility for you. Build forms by stacking `FormControl`s in a `Stack`.

## Rules

- Wrap text-like fields (`TextInput`, `Textarea`, `Select`) in a `FormControl` with a `FormControl.Label`. The control generates a shared id and sets `htmlFor`, `aria-describedby`, `aria-invalid`, `required`, and `disabled` automatically — **don't** wire ids by hand, and **never** use a placeholder as the label.
- Use `FormControl.Caption` for help text and `FormControl.Validation variant="error"` for errors (it also flips the field to invalid). Use `variant="success"` for confirmation.
- For booleans use `Checkbox` (with its own `label`); for one-of-many use `RadioGroup` + `Radio` (a `<fieldset>`/`<legend>` group). Don't put these in a `FormControl`.
- Lay out fields with `<Stack gap="normal">`; submit with `<Button variant="primary">` (one per form). Spacing comes from the `space` scale only.
- **Never** use raw `<input>`, `<textarea>`, `<select>`, or a styled `<div>` toggle — every field has a design-system component.

## Do / Don't

- ✅
  ```tsx
  <FormControl required>
    <FormControl.Label>Email</FormControl.Label>
    <TextInput type="email" />
    <FormControl.Validation variant="error">Enter a valid email.</FormControl.Validation>
  </FormControl>
  ```
- ❌ `<label>Email</label><input style={{ border: '1px solid #d0d7de' }} />` — raw element, hardcoded border, label not associated, no error wiring.
