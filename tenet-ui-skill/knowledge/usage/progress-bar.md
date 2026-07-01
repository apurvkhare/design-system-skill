# ProgressBar

A thin, pill-shaped bar that communicates the progress of a task — a file upload,
a multi-step form, a background job.

## When to use

- Use **ProgressBar** when you can express progress as a fraction of a known total
  (determinate) — pass `value` (and `max` if it isn't 100).
- Use the **indeterminate** ProgressBar (omit `value`) when work is underway but its
  duration is unknown.
- Reach for **Spinner** instead when the indicator must be compact (inline, inside a
  button) rather than a full-width bar.

## Rules

- **Always give it an accessible name.** A progressbar has no intrinsic label, so pass
  `aria-label` or `aria-labelledby`. Without one it is announced nameless — an axe failure.
- `value` is clamped to `[0, max]`; you don't have to pre-clamp. `max` defaults to `100`.
- Determinate bars expose `aria-valuenow` and a human-readable `aria-valuetext` (e.g. `"42%"`).
  Indeterminate bars omit `aria-valuenow` and run an animated sweep.
- The sweep respects `prefers-reduced-motion`: under reduced motion it becomes a calm
  opacity pulse rather than a traveling bar.
- Track is `bgColor-muted`; the fill uses the variant's emphasis token. Pick `variant`
  for meaning (`success` when complete, `danger` for an at-risk quota), not decoration.

## Do / Don't

✅ Determinate with a name and a real total:

```tsx
<ProgressBar value={file.uploaded} max={file.size} aria-label="Upload progress" />
```

✅ Indeterminate while the duration is unknown:

```tsx
<ProgressBar aria-label="Loading report" />
```

❌ No accessible name (announced nameless):

```tsx
<ProgressBar value={42} />
```

❌ Faking indeterminate with `value={0}` — that's a real, stalled 0%. Omit `value` instead.
