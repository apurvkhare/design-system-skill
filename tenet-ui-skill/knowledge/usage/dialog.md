# Dialog — usage guidelines

**When to use:** a focused task or confirmation that must interrupt the flow — destructive confirmations, short forms, critical choices. For non-blocking feedback use a toast or `Banner`; for lightweight hints use a `Tooltip`.

## Rules

- It's a controlled component: drive `open` and handle `onClose` (Escape, backdrop, and the close button all call it). Render your actions in `footer`.
- Always pass a `title` — it's the dialog's accessible name. Add a `description` for context; it's wired as `aria-describedby`.
- Focus management is automatic: focus moves in on open, is trapped while open, and is restored to the trigger on close, and body scroll is locked. **Don't** re-implement this with a `position:fixed` div.
- For a destructive confirm, keep the confirming button `variant="danger"` and make the consequence explicit in the body.
- Keep dialogs short. If it scrolls a lot or has many steps, it probably wants its own page.

## Do / Don't

- ✅ `<Dialog open={open} onClose={close} title="Delete repository?" description="This can't be undone." footer={<><Button variant="invisible" onClick={close}>Cancel</Button><Button variant="danger" onClick={confirm}>Delete</Button></>}>…</Dialog>`
- ❌ A hand-built overlay div — no focus trap, no scroll lock, no Escape, no restore.
- ❌ Using a dialog for a transient "Saved!" message — that's a toast.
