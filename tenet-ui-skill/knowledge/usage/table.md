# Table — usage guidelines

**When to use:** to present rows of structured, comparable data (repos, users, runs). Use the `Table` family — real `<table>` semantics — not a grid of styled `<div>`s.

## Rules

- Compose `Table.Head` → `Table.Row` → `Table.Header` for the header, and `Table.Body` → `Table.Row` → `Table.Cell` for data. Header cells are real `<th scope="col">` for screen readers.
- Wrap in `Table.Container` with `Table.Title` / `Table.Subtitle` when the table needs a heading or actions — don't hand-build a bordered header.
- Use `density` (`condensed` | `normal` | `spacious`) for row height; never set row padding inline.
- Use `align="end"` on numeric columns (header **and** cells) so figures line up.
- For sortable columns set `sortDirection` on the `Table.Header` (it renders the indicator and `aria-sort`) and handle `onClick`.
- **Never** hardcode borders, row striping, or padding — they come from `borderColor`, `bgColor`, and the `space` scale.

## Do / Don't

- ✅ `<Table.Header align="end" sortDirection="descending">Stars</Table.Header>`
- ❌ `<div className="row" style={{ display: 'flex', borderBottom: '1px solid #d0d7de' }}>` — not a table, hardcoded border, no semantics.
