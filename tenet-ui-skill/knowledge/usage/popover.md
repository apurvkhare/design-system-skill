# Popover — usage guidelines

**When to use:** a lightweight floating container anchored to a control — a filter panel, a small form, rich help, an account summary. It's **non-modal**: the page behind stays interactive. For a blocking task or confirmation (focus trap, scroll lock, dimmed background) use `Dialog`; for a plain text hint use `Tooltip`; for a list of actions use `Menu`; for picking a value use `Select`.

## Rules

- Pass a focusable `trigger` (a `Button`). It's cloned and wired with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, an onClick toggle, and a ref so focus returns to it on close. A non-focusable trigger (a plain `<div>`) strands keyboard users.
- Give an `aria-label` — it names the `role="dialog"` surface (it falls back to "Popover", which isn't descriptive).
- Focus + keyboard are handled: on open focus moves into the surface (first focusable child, else the container); Escape closes and returns focus to the trigger; click-outside closes; and focus leaving the wrapper (Tab-out) closes it so it can't strand open behind the page.
- It is **non-modal** (`aria-modal="false"`): no focus trap, no scroll lock, no background `aria-hidden`. If you need any of those, you want `Dialog`, not a Popover with hacks bolted on.
- Choose `placement` to keep the surface on-screen near the trigger (`bottom-start` default, plus `bottom-end`, `top-start`, `top-end`). Keep the content short — a popover is not a page.

## Do / Don't

- ✅ `<Popover aria-label="Filters" trigger={<Button>Filters ▾</Button>}><FilterForm /></Popover>`
- ❌ `<Popover trigger={<div>Open</div>}>…</Popover>` — a non-focusable trigger; keyboard users can't reach it.
- ❌ Reaching for a Popover for a destructive confirm that must block the flow — that's a `Dialog`.
- ❌ Omitting `aria-label` — the dialog is then named only "Popover".
