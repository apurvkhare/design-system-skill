# SegmentedControl — usage guidelines

**When to use:** switching between a few (2–5) mutually exclusive views or modes that take effect immediately — a List/Board/Timeline view toggle, a chart range. For many options or free text use `Select`; for on/off use `Switch`; for navigating peer content panes use `Tabs`.

## Rules

- Give it an `aria-label` — it's an ARIA radiogroup and needs a group name.
- Control with `value` + `onChange`, or uncontrolled with `defaultValue` (defaults to the first enabled segment).
- Keep labels to one word where possible; the control is meant to be compact.
- Keyboard is built in: arrows move and select (selection follows focus), Home/End jump, with a roving tab stop. Don't rebuild it from styled buttons.
- Don't exceed ~5 segments — past that, it gets cramped and a `Select` is clearer.

## Do / Don't

- ✅ `<SegmentedControl aria-label="View" options={[{value:'list',label:'List'},{value:'board',label:'Board'}]} defaultValue="list" />`
- ❌ Using it for a long list of options, or for a binary on/off (use Switch).
- ❌ Omitting `aria-label`.
