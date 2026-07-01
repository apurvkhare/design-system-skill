# DataTable — usage guidelines

**When to use:** rendering a list of records where users need to **search, filter, or sort** without you wiring it all by hand. It's built on the `Table` primitives plus `TextInput` + `Select`, so it stays on-system. For a bespoke layout (grouped rows, custom toolbars, server-driven paging), drop down to `Table.*` directly.

## Rules

- Describe the table with `columns` (id, header, optional `accessor`/`cell`, `align`, `sortable`, `filterable`) + `data`. Don't hand-roll `<th>`/`<td>`.
- `accessor` returns the **raw** value used for sorting + filtering; `cell` is only for display (e.g. wrapping a status in a `Label`). Keep them consistent — sort on the value, not the badge.
- Turn on `sortable` per column for click-to-sort (asc → desc → off), and `filterable` for a per-column dropdown built from the column's distinct values.
- Provide a `rowKey` when rows can reorder or the list is large — falling back to the index is fine only for static data.
- Use numeric `align="end"` for number columns so they line up.
- This is **client-side** (filters/sort run over the `data` you pass). For huge or server-paged data, drive `Table.*` yourself and fetch on change.

## Do / Don't

- ✅ `<DataTable columns={cols} data={rows} title="Repositories" />`
- ✅ a status column: `{ id: 'status', header: 'CI', filterable: true, cell: r => <Label variant={r.variant}>{r.status}</Label> }`
- ❌ Building search/filter/sort state around a raw `Table` when DataTable already does it.
- ❌ Sorting/filtering on the rendered `cell` output instead of the underlying value.
