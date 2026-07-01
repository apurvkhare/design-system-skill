# Skeleton — usage guidelines

**When to use:** as a placeholder for content whose *shape* you know while it loads (a card, an avatar + name, a few lines of copy). It reduces perceived wait and prevents layout shift versus a blank space. If you can't predict the layout, or the wait is short/indeterminate with no structure to mimic, use a Spinner instead. If you can show real progress, use a progress bar.

## Rules

- **The skeleton is decorative.** It renders `aria-hidden="true"`, so screen readers skip it. Announce the wait on the **surrounding region**, e.g. `aria-busy="true"` on the container plus a visually-hidden status (or a `Spinner` with a `label`). Don't rely on the skeleton blocks to convey "loading" to assistive tech.
- **Match the shape and size of the real content** so swapping in the loaded UI doesn't shift layout. Use `width`/`height` to size `rect`, and one `circle` for an avatar.
- `width`/`height` are applied inline (number → px, string like `'60%'` → as-is). This is the one place inline `style` is correct — caller-driven dimensions aren't a token concern. All color, radius, and spacing stay on tokens.
- `circle` is always a full-radius square: pass `width` and it mirrors to height; the `radius` prop is ignored for it.
- The shimmer honors `prefers-reduced-motion` — it drops to a gentle opacity pulse — so you don't need to gate it yourself.

## Do / Don't

- ✅ Stack a few `text` lines of decreasing width to mimic a paragraph:
  ```tsx
  <div aria-busy="true">
    <span className="sr-only">Loading article…</span>
    <Skeleton variant="text" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="60%" />
  </div>
  ```
- ✅ Avatar + name placeholder: `<Skeleton variant="circle" width={48} />`
- ❌ Relying on the skeleton alone for the loading announcement — it's `aria-hidden`, so this strands screen-reader users:
  ```tsx
  <Skeleton aria-label="Loading" /> {/* hidden from AT — the label never reaches anyone */}
  ```
