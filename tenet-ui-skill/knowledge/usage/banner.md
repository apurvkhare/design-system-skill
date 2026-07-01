# Banner — usage guidelines

**When to use:** an inline, contextual message anchored to the content it describes — a form-level error, a page notice, a "you're approaching your limit" warning. For transient floating feedback use a toast; for a one-word status on a table row use `Label`.

## Rules

- Pick `variant` by meaning: `info` (clay), `success` (olive), `warning` (ochre), `danger` (brick). Don't pick by color.
- `danger` renders `role="alert"` (interrupts assistive tech); the others render `role="status"` (announced politely). Don't override the role to make a non-critical message shout.
- Lead with a short `title`; keep the body to a sentence or two with a clear next step.
- Only add `onDismiss` when the message is non-critical — never let users dismiss a blocking error they still need to fix.
- Colors come from the semantic tint tokens — never hardcode a background.

## Do / Don't

- ✅ `<Banner variant="danger" title="Build failed">3 tests are failing.</Banner>`
- ✅ `<Banner variant="success" title="Saved" onDismiss={hide}>Your changes are live.</Banner>`
- ❌ A `<div style={{background:'#fee'}}>` hand-rolled alert — off-system, no role, no AA guarantee.
- ❌ A dismiss button on a required-fix error.
