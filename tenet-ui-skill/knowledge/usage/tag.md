# Tag — usage guidelines

**When to use:** a removable chip representing a user-applied token — an active filter, a selected option in a multi-select, a recipient, a keyword. The defining trait is that the user can dismiss it (the remove ✕).

**When to use a neighbor instead:**

- For a non-interactive **status** pill (`passing`, `failing`, `triaged`) use `Label` — it's tracked-caps and read-only.
- For a **count** or presence dot (`3 unread`) use `Badge`.
- If the chip's whole body should be clickable to toggle a choice (not just remove it), reach for a control like `SegmentedControl` or a Checkbox, not a Tag with a click handler on the span.

## Rules

- **Tag is stateless.** Setting `onRemove` renders a real `<button>`, but Tag never removes itself — your handler must drop the item from the collection you render from.
- The remove button is a real `<button>` so it is keyboard operable (Tab to it, Enter/Space to remove) and has a `:focus-visible` ring. Don't replace it with a clickable `<span>`.
- It gets an accessible name automatically: `Remove ${text}` when `children` is a string. If `children` is not a plain string (e.g. an icon + element), pass `removeLabel` so the button is still named.
- The ✕ glyph and any `leadingIcon` are decorative (`aria-hidden`); the button's label carries the meaning.
- Choose `variant` by **meaning**: `accent` for an active/selected token, `default` for a neutral one. Don't compute your own fills or borders from a hex value — that's the anti-pattern this component removes.
- Tag is **normal-case readable text** — do not uppercase it. The tracked-caps look belongs to `Label`.

## Do / Don't

- ✅ `<Tag variant="accent" onRemove={() => setFilters(f => f.filter(x => x !== id))}>{name}</Tag>`
- ✅ name the button when children aren't a string: `<Tag leadingIcon={<Avatar … />} removeLabel="Remove Ada Lovelace">Ada</Tag>`
- ❌ `<Tag onRemove={() => {}}>x</Tag>` — a no-op handler; the chip looks removable but isn't. The parent must actually drop it.
- ❌ `<span className="tag" onClick={remove}>bug ✕</span>` — a clickable span isn't keyboard operable and reinvents the component.
