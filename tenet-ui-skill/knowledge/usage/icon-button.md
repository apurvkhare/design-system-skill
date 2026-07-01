# IconButton

A square, icon-only button for compact actions where a text label won't fit.

## When to use

- Use **IconButton** for dense surfaces: toolbars, table-row actions, the close
  affordance in a dialog/banner corner, segmented toolbars.
- Use **Button** (with a `leadingIcon`) whenever you have room for a label — a
  visible label is always clearer than an icon alone. Reach for IconButton only
  when space is genuinely the constraint.
- For a menu of actions behind one trigger, use **Menu**; IconButton is a single
  action, not a disclosure.

## Rules

- **It must have an accessible name.** The icon is the only visible content and is
  rendered `aria-hidden`, so the name has to come from `aria-label` (or
  `aria-labelledby`). With neither, screen-reader users hear nothing. In
  development the component logs a `console.warn` when the name is missing.
- The name should describe the **action**, not the glyph: `aria-label="Delete row"`,
  not `aria-label="Trash icon"`.
- Variants mirror `Button`: `primary` for the single most important action,
  `default` for secondary, `invisible` for tertiary/toolbar, `danger` for
  destructive.
- Sizes map to the control-height tokens (`small` 28 / `medium` 32 / `large` 40)
  and the control is square, so it lines up with same-size inputs and buttons.
- The whole control is a real `<button>`, so keyboard activation (Enter/Space) and
  the `:focus-visible` ring come for free. Pass `disabled` as usual.

## Do / Don't

Do — give it an action name and pass the icon via the `icon` prop:

```tsx
<IconButton icon={<TrashIcon />} variant="danger" aria-label="Delete row" onClick={remove} />
```

Don't — ship a nameless icon button (axe failure; the dev warning fires):

```tsx
// ❌ no accessible name — screen readers announce nothing
<IconButton icon={<TrashIcon />} variant="danger" onClick={remove} />
```

Don't — bake the label into the icon and leave the button unnamed:

```tsx
// ❌ the <span> text is aria-hidden with the icon; the button is still nameless
<IconButton icon={<><TrashIcon /> Delete</>} />
```
