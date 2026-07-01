# Avatar — usage guidelines

**When to use:** representing a person or entity (user, org, repo) with an image or initials.

## Rules

- Always pass `name` — it generates the initials **and** the accessible label, so the avatar is never an unlabelled image to a screen reader. The decorative `<img>` itself gets empty alt.
- Provide `src` when you have a photo; the component falls back to initials automatically if it's missing or fails to load (no broken-image icon).
- Use `shape="circle"` for people and `shape="rounded"` for orgs/repos so the two read differently at a glance.
- Pick `size` from the scale rather than overriding width/height, so avatars line up with adjacent controls.

## Do / Don't

- ✅ `<Avatar src={user.photo} name={user.fullName} />`
- ✅ `<Avatar name="design-tokens" shape="rounded" />`
- ❌ `<Avatar src={url} name="" />` — no label, no initials fallback.
- ❌ A raw `<img>` with no alt strategy and no fallback.
