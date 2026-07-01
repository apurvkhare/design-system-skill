# Calendar — usage guidelines

**When to use:** an always-visible month grid for picking a day — e.g. inline in a booking flow, or hosted in a popover by `DatePicker`. For a compact field that opens on demand, reach for `DatePicker` (which wraps this).

## Rules

- Give it an accessible name via `aria-label` (e.g. "Departure date").
- Control it with `value` + `onChange`, or leave uncontrolled with `defaultValue`. `onChange` hands you a real `Date`.
- Constrain selectable days with `min` / `max` — out-of-range days are disabled and the month-nav arrows stop at the boundary.
- Set `weekStartsOn={1}` for Monday-first locales. Month and weekday names follow `locale` (defaults to the runtime locale) — don't hardcode English.
- It implements the ARIA grid + roving-tabindex keyboard model (arrows, Home/End, PageUp/PageDown, Enter/Space). **Don't** rebuild this with a plain table of clickable `<div>`s.

## Do / Don't

- ✅ `<Calendar aria-label="Departure date" defaultValue={new Date()} min={new Date()} />`
- ✅ controlled: `<Calendar value={date} onChange={setDate} weekStartsOn={1} />`
- ❌ A grid of `<div onClick>` cells — no keyboard, no roles, no roving focus.
- ❌ Formatting the month/weekday labels yourself in English — pass `locale` and let `Intl` do it.
