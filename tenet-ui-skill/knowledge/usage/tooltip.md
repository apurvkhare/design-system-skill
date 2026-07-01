# Tooltip — usage guidelines

**When to use:** a brief text hint that supplements an already-labelled control (clarifying an icon button, explaining what an action does). Never the *only* place critical information lives.

## Rules

- The trigger must be a single **focusable** element (a button, link, or input) — the tooltip shows on hover **and** on keyboard focus, and Escape dismisses it. Don't wrap a bare `<div>`/`<span>` that can't receive focus.
- Keep `content` short — a phrase, not a paragraph. For rich, interactive content use a popover/dialog.
- The trigger is wired to the bubble via `aria-describedby`, so screen readers announce it. Don't duplicate the same text as a visible label and a tooltip.
- The bubble color comes from the inverse surface tokens, so it stays high-contrast in light and dark — don't recolor it.

## Do / Don't

- ✅ `<Tooltip content="Saves immediately"><Button>Publish</Button></Tooltip>`
- ✅ icon button: `<Tooltip content="Delete"><IconButton aria-label="Delete">🗑</IconButton></Tooltip>`
- ❌ `<Tooltip content="…"><span>text</span></Tooltip>` — not focusable, keyboard users can't reach it.
- ❌ Hiding must-have instructions behind hover only.
