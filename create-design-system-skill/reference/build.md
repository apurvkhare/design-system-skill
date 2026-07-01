# Build — end to end

The full flow for turning a team's design system into a working skill. Read
`interview.md`, `ingest-strategies.md`, and `runtime-contract.md` alongside this.

## Step 1 — Interview
Ask the four inputs with the host's question tool (`interview.md`): components,
guidelines, Storybook, icons. Get the concrete URLs/paths/package names. Decide the
**skill name** (kebab-case, e.g. `acme-ui-skill`) and **target directory** (default: a
`skills/<name>` dir, or next to the user's other skills). Confirm the DS display name
and the consumer **import path / package**.

## Step 2 — Get the sources in reach
For each provided source, make it fetchable (`ingest-strategies.md`):
- clone GitHub repos shallow into the scratch dir,
- pin + install / locate npm packages,
- confirm Storybook `index.json` and any docs URLs actually load,
- locate the icon set (svg dir, names JSON, or plan an export probe).
If something's unreachable, note it and plan a `manual` fallback for that category.

## Step 3 — Determine the runtime contract
Before writing config, work out how the DS bootstraps (`runtime-contract.md`): the
stylesheet import(s), any provider, the theme attribute, an optional class prefix, and
3–5 tokens that must resolve. This is the highest-leverage part — get it right.

## Step 4 — Write design-system.config.json
Create the target dir and write `design-system.config.json` there, using
`templates/design-system.config.example.json` as the schema. Set `designSystem`,
`package`, per-category `mode` + source fields (`tokens`, `components`, `usage`,
`icons`), the full `runtime` block, and optionally `render` (a demo app for Verify).
Omit `icons` (or `mode: "none"`) if the DS has no separate icon set.

## Step 5 — Scaffold
```
node scripts/scaffold.mjs <target-skill-dir> --name <skill-name>
```
This copies the engine scripts verbatim and the prose templates with placeholders
filled (icon clauses resolve to present/absent based on your config). If it reports it
seeded the example config, you skipped Step 4 — fill it and re-run.

## Step 6 — Ingest the real API
```
node <target-skill-dir>/scripts/ingest.mjs
```
Populates `knowledge/{tokens,components,usage,icons,runtime,meta}.json`. Then handle
every `manual` category you planned: author `knowledge/tokens.json` /
`components.json` / `usage/*.md` / `icons.json` from the sources ingest couldn't parse
(Confluence/Docs/Figma/CSS-vars/type-only). Check `knowledge/meta.json` counts look
sane (not 0 tokens / 0 components unless truly manual).

## Step 7 — Refine the generated prose
Open the generated `SKILL.md` and `reference/*.md` and replace the generic role→
component language with **this DS's real component names** (from
`knowledge/components.json`) — e.g. the actual button/select/menu/table names, the real
status-tag component, the real form-field wrapper. Keep the two-axis rubric and the
runtime-first ordering intact. Keep it tight; don't bloat.

## Step 8 — Write ARCHITECTURE.md (required deliverable)
Fill every `{{...}}` prompt in the generated `ARCHITECTURE.md`: the real source
URLs/repos, the ingest counts, the runtime summary, the verify harness, and the
knowledge-sources table. This is the durable record of how the skill was created and
how it works — the user explicitly wants it.

## Step 9 — Verify the generated skill actually works
Prove it, don't assume:
1. **Content audit discriminates.** Run `node <skill>/scripts/audit.mjs` on a tiny
   known-bad snippet (hardcoded `#fff`, a raw `<button>`, an inline `<svg>` if icons
   configured, an invented prop) → expect errors on the right dimensions. Run it on a
   known-good snippet (real component + tokens) → expect `0 violations`.
2. **Runtime gate discriminates.** Run `node <skill>/scripts/audit-runtime.mjs` on a
   project dir that uses the DS but omits the stylesheet import → expect the runtime
   violation; add the import → expect it to pass.
3. **A real render** (if a demo app / `render` is configured or easy to stand up):
   confirm a token from `verifyTokensResolve` is non-empty in `getComputedStyle` and
   the UI is styled in light + dark.
Fix anything that doesn't discriminate (usually a wrong `path`, `mode`, or `classPrefix`
in config), re-ingest, re-check.

## Step 10 — Hand off
Summarize for the user: where the skill lives, what it ingested (counts + provenance),
how to refresh it (`node scripts/ingest.mjs` after DS changes), and how to invoke it
("build this screenshot with <DS>", "audit this file"). Point them at the generated
`ARCHITECTURE.md`.

## Guardrails
- **Never lose the runtime axis.** Both scanners, always. It's the whole point.
- **Ground in the ingested API, not memory.** If you're unsure a prop/token exists,
  check `knowledge/`, don't guess.
- **Ask when a source is ambiguous or unreachable;** fall back to `manual`, never to
  invented data.
- **Keep the generated skill lean** — progressive disclosure: short SKILL.md, details
  in `reference/`, big data in `knowledge/` read on demand.
