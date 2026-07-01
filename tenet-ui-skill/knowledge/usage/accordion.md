# Accordion — usage guidelines

**When to use:** progressively disclosing stacked sections of content (FAQs, settings groups) so the page stays scannable. For switching between peer views use `Tabs`; for a single show/hide, a lone disclosure button is enough.

## Rules

- Compose `Accordion.Item`s, each with a unique `value` and a `title`. Each item is a real `<button aria-expanded>` controlling a labelled `region` — keyboard and screen-reader support come for free (Enter/Space toggle; Up/Down/Home/End move between headers).
- Use `type="single"` (default) when only one section should be open; `type="multiple"` when several can. Control with `value` + `onValueChange`, or uncontrolled with `defaultValue`.
- Put the most important section first; don't bury critical content behind a collapsed header by default.
- Don't nest accordions deeply — one level keeps it comprehensible.

## Do / Don't

- ✅ `<Accordion type="single" defaultValue={['faq-1']}><Accordion.Item value="faq-1" title="…">…</Accordion.Item></Accordion>`
- ❌ A `<div onClick>` that toggles `display` with no `aria-expanded`/region.
- ❌ Hiding must-see content (errors, primary actions) inside a collapsed item.
