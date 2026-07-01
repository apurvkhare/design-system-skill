# Spinner — usage guidelines

**When to use:** an indeterminate wait where you can't show progress (loading a panel, submitting). If you know the proportion done, use a progress bar instead; for content placeholders, prefer a skeleton.

## Rules

- It renders `role="status"` with a visually-hidden `label` — keep the label meaningful ("Loading repositories") so screen-reader users hear what's pending.
- It inherits `currentColor`, so place it inside text of the right color (e.g. inside a Button it picks up the button text color) rather than restyling it.
- Don't block the whole screen with a bare spinner for long waits — pair it with context or a skeleton.

## Do / Don't

- ✅ `<Spinner label="Loading repositories" />`
- ✅ inside a button: `<Button disabled><Spinner size="small" /> Saving…</Button>`
- ❌ A spinning `<div>` with no role/label — invisible to assistive tech.
