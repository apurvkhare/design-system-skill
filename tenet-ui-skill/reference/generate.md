# Generate — design → tenet-ui React

Goal: reproduce the target using **real tenet-ui components + tokens**, wired so
it actually renders. Order matters — wire the runtime first, because that's the
step everyone forgets and it's the difference between "renders" and "blank".

## 0. Read the runtime contract FIRST
Open `knowledge/runtime.json`. The app entry MUST import the stylesheet once:
```tsx
// main.tsx
import 'tenet-ui/styles.css';            // tokens + component styles — without this, nothing renders
import { createRoot } from 'react-dom/client';
import App from './App';

document.documentElement.dataset.colorMode = 'light'; // or 'dark' — theming is an attribute, no provider
createRoot(document.getElementById('root')!).render(<App />);
```
If you skip this, every `var(--token)` and `Tenet-*` class is undefined and the
screen is unstyled — even though your component code is perfect.

## 1. Decompose the design into roles, then map to components
Look at the target and name each element by its *role*, then pick the tenet-ui
component from `knowledge/components.json`. Common mappings:

| You see… | Use |
|---|---|
| primary/secondary/destructive action | `Button` (`variant`), icon-only → `IconButton` |
| status word (passing/failing/beta) | `Label` (tinted tag) |
| count / unread dot | `Badge` |
| removable chip / filter token | `Tag` |
| text field / search | `TextInput` (`leadingVisual`) |
| multi-line input | `Textarea` |
| dropdown choosing a value | `Select` |
| number entry | `NumberInput` |
| on/off setting | `Switch`; check-to-confirm → `Checkbox`; one-of-many → `Radio`/`RadioGroup` |
| date entry / month grid | `DatePicker` / `Calendar` |
| action overflow (⋯) | `Menu` |
| 2–5 view toggle | `SegmentedControl` |
| tabs of peer content | `Tabs` |
| collapsible sections | `Accordion` |
| inline message | `Banner`; transient toast → `ToastProvider` + `useToast` |
| modal / confirm | `Dialog`; lightweight floating panel → `Popover`; hint → `Tooltip` |
| avatar / person | `Avatar` |
| table (with search/filter/sort) | `DataTable`; bespoke → `Table.*` primitives |
| pagination / breadcrumbs / link | `Pagination` / `Breadcrumbs` / `Link` |
| loading | `Spinner` / `Skeleton` / `ProgressBar` |
| layout row/stack, card, rule | `Stack` / `Card` / `Divider` |
| labelled form field | wrap the field in `FormControl` (auto-wires label + a11y) |

Don't reinvent any of these with a styled `<div>` — that's the primary violation.
For genuinely custom layout, use a plain element but style it with **tokens**.

## 2. Write the code
- Import components from `tenet-ui`. Use only props that exist in
  `knowledge/components.json` (check before using `variant`/`size` values).
- Any custom CSS uses `var(--token)` only — no hex, no arbitrary px. Match by
  meaning: text `--fgColor-default`/`-muted`, surfaces `--bgColor-default`/`-muted`,
  accents/status via the `*-emphasis`/`*-muted` tints, spacing `--space-*`,
  headings `--fontFamily-display`.
- Read the relevant `knowledge/usage/<name>.md` for the components you use — they
  carry the rules people get wrong (e.g. give `Select`/`IconButton`/`DataTable`
  filters an accessible name; `DataTable` sorts on the value not the rendered cell).
- Theme: set `data-color-mode` once (or a toggle). Don't hand-build a dark palette.

## 3. Verify before declaring done (the gate)
Run, in order:
```
node scripts/audit.mjs <each generated .tsx>      # token/component/API hygiene → 0 errors
node scripts/audit-runtime.mjs <project-root>     # the stylesheet is imported → 0 errors
```
Then **Verify** (`reference/verify.md`): actually render it and confirm it's
styled (a Tenet element has a real background/border, the font is the editorial
serif/sans) and matches the target in light and dark. "Compiles + audits clean"
is necessary but not sufficient — only a real render proves the runtime contract.
