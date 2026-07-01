# Toast — usage guidelines

**When to use:** brief, transient, non-blocking feedback about something that just happened ("Saved", "Copied", "Upload failed"). For a message anchored to content use `Banner`; for something that must be acknowledged use `Dialog`.

## Setup

- Wrap your app once in `<ToastProvider>` (optionally set `duration` and `placement`). Call `const { toast } = useToast()` anywhere beneath it.

## Rules

- Keep it short — a `title` plus one line of `message`. Toasts are glanceable, not a place for forms or long text.
- Pick `variant` by meaning; `danger` is announced assertively (`role="alert"`), the rest politely (`role="status"`). The viewport is a labelled live region.
- Let them auto-dismiss (default 5s); only set `duration: 0` for a message the user must dismiss, and always keep the manual dismiss button.
- Never put critical, must-act information **only** in a toast — it disappears. Mirror it in a `Banner` or inline error.
- Don't stack many at once; collapse repeats rather than flooding the corner.

## Do / Don't

- ✅ `toast({ variant: 'success', title: 'Saved', message: 'Your changes are live.' })`
- ✅ `<ToastProvider placement="bottom-right"><App /></ToastProvider>`
- ❌ A toast as the only record of a validation error the user must fix.
- ❌ Long, interactive content inside a toast — use a Dialog.
