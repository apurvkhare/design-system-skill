# Card — usage guidelines

**When to use:** to group related content on a bordered, rounded surface (a panel, a list container, a pinned item). `Card` is the design-system "box" — use it instead of a styled `<div>` with hardcoded border, radius, or shadow.

## Rules

- Use `variant="default"` for surfaces that sit on the page, `variant="muted"` for recessed/secondary surfaces (e.g. a toolbar strip).
- Use `padding` from the `space` scale; use `padding="none"` when children manage their own padding (e.g. a list whose rows are padded individually).
- **Never** hardcode `border`, `border-radius`, `box-shadow`, or `background` — they come from `borderColor`, `borderRadius`, `shadow`, and `bgColor` tokens.
- For internal layout, compose a `Stack` inside the `Card`; don't add flex styles to the Card itself.

## Do / Don't

- ✅ `<Card variant="muted" padding="condensed"><Stack>…</Stack></Card>`
- ❌ `<div style={{ border: '1px solid #d0d7de', borderRadius: 6, boxShadow: '0 1px 0 rgba(0,0,0,.04)' }}>` — reinvented surface, hardcoded everything.
