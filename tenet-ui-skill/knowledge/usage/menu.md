# Menu — usage guidelines

**When to use:** a list of **actions** triggered from a button (a row's "⋯" overflow, a "New ▾" split of choices). For picking a **value** from a list use `Select`; for navigation use links.

## Rules

- Pass a focusable `trigger` (a `Button`) — it's wired with `aria-haspopup="menu"`, `aria-expanded`, and open/close handling. Each item runs its `onSelect` and the menu closes.
- Give an `aria-label` describing the menu (e.g. "Repository actions"); otherwise it falls back to the trigger's text.
- Keyboard + ARIA are handled: arrows move, Enter/Space invoke, Escape closes and returns focus to the trigger, click-outside closes. Don't rebuild this with a div of onClick rows.
- Mark dangerous actions `destructive` (renders in the danger color); use a `{ type: 'separator' }` to group. Keep menus short — long lists belong in a `Select` or a dedicated page.

## Do / Don't

- ✅ `<Menu aria-label="Row actions" trigger={<Button>⋯</Button>} items={[{label:'Edit',onSelect},{type:'separator'},{label:'Delete',onSelect,destructive:true}]} />`
- ❌ Using a Menu to choose a value that should persist in a field — that's `Select`.
- ❌ A non-focusable trigger (plain `<div>`).
