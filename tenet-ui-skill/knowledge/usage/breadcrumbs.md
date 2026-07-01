# Breadcrumbs — usage guidelines

**When to use:** showing where the current page sits in a hierarchy and letting users jump back up it. For switching between peer views use `Tabs`; for paging through results use `Pagination`.

## Rules

- Pass `items` root-first; the **last** item is the current page and is rendered as text with `aria-current="page"` (not a link) — don't pass it an `href`.
- It renders a `<nav aria-label>` landmark with an ordered list. Give a distinct `aria-label` if the page has more than one nav.
- The separator is decorative (`aria-hidden`); don't encode meaning in it.
- Keep labels short; truncate long middle segments rather than wrapping to many lines.

## Do / Don't

- ✅ `<Breadcrumbs items={[{label:'Home',href:'/'},{label:'Repos',href:'/repos'},{label:'web-client'}]} />`
- ❌ Giving the last (current) item an `href`.
- ❌ Using breadcrumbs as the primary navigation of a flat site with no hierarchy.
