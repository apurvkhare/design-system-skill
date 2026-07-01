# Tabs — usage guidelines

**When to use:** switching between peer views of the same context without navigating away (an entity's Overview / Issues / Settings). For navigation between pages use links; for a small either/or use a SegmentedControl.

## Rules

- Compose `Tabs.List` (give it an `aria-label`) with `Tabs.Tab`s, and one `Tabs.Panel` per tab value. Tab `value` must match its Panel `value`.
- Control it with `value` + `onChange`, or leave uncontrolled with `defaultValue`.
- Keep tab labels short (one or two words). Don't overflow a dozen tabs — that's navigation, not tabs.
- Keyboard and ARIA are handled: arrows move (selection follows focus), Home/End jump, roles + `aria-controls`/`aria-labelledby` are wired. **Don't** rebuild this with buttons that toggle `display:none` divs.

## Do / Don't

- ✅ `<Tabs defaultValue="overview"><Tabs.List aria-label="Sections">…</Tabs.List><Tabs.Panel value="overview">…</Tabs.Panel></Tabs>`
- ❌ `<button onClick>` + conditionally rendered divs with no roles/keyboard.
- ❌ Tabs as primary site navigation.
