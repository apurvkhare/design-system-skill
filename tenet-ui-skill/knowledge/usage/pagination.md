# Pagination — usage guidelines

**When to use:** moving through a large result set split into pages (a table, search results). For infinite streams prefer "load more"; for hierarchy use `Breadcrumbs`.

## Rules

- It's controlled: pass `page` (1-based) + `pageCount` and handle `onPageChange`. Keep `page` in sync with your data fetch.
- Every control is a real `<button>`, so it's keyboard-operable; the current page is marked `aria-current="page"` and Previous/Next disable at the ends. Don't reimplement with click-only `<span>`s.
- Long ranges collapse with ellipses around `siblingCount` pages — tune `siblingCount`, don't render 42 buttons.
- It's wrapped in a `<nav aria-label>`; give a distinct label if more than one nav is on the page.

## Do / Don't

- ✅ `<Pagination page={page} pageCount={total} onPageChange={setPage} />`
- ❌ Rendering all pages with no ellipsis for large counts.
- ❌ Click-only page numbers with no `aria-current` and no keyboard support.
