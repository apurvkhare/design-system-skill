---
name: create-design-system-skill
description: >-
  Build a custom "design-system skill" for a team's OWN component library — an agent
  skill that turns screenshots/mockups into React that complies with THAT design
  system (real components, tokens, and icons; correctly wired to render), and that
  audits/verifies existing code against it. Use this whenever someone wants to make
  AI generate UI that follows their in-house or third-party design system, asks to
  "create/scaffold a design-system skill", "ground the model in our component
  library", "teach Claude our DS", or points at their components repo, Storybook,
  Figma, or design docs and wants a reusable skill built from them. This skill
  interviews for the sources (components, guidelines, Storybook, icons), then
  autonomously ingests the real API and generates the full skill (SKILL.md, scripts,
  knowledge base, ARCHITECTURE.md). It does NOT itself generate app UI — it PRODUCES
  the skill that does.
---

# create-design-system-skill

A **meta-skill**: it builds a design-system skill for *any* component library. The
generated skill has the proven shape — a config-driven ingest of the real API into a
committed `knowledge/` snapshot, two audit scanners (content + runtime), and three
workflows (Generate / Audit / Verify) — so the model grounds UI generation in the
*current* design system instead of training-data guesses.

## The one idea this whole thing exists to encode
A design system is a **runtime contract**, not just a token dictionary. Code can cite
every real token and component and still render **completely unstyled** because the
stylesheet was never imported / provider never mounted. So the generated skill always
audits on two axes — *content* (right tokens/components?) and *runtime* (do they
resolve?) — and gates on a real render. Never let the generated skill lose this.

## Process (do these in order)
Follow the detailed steps in `reference/build.md`. In brief:

1. **Interview — ask, don't guess.** Collect the source pointers using the host's
   structured question UI. Read `reference/interview.md` for the exact questions and
   how to ask on any host (Claude Code `AskUserQuestion`, Cursor/Codex ask tools, or
   plain prose as fallback). The four inputs:
   - **Components** — where the components live (ideally a GitHub repo; or an npm
     package, a generated `components.json`, or TS types).
   - **Guidelines** — usage rules (Confluence, Google Docs, markdown, a docs site).
   - **Storybook** — a GitHub link or any scrapeable URL (or "none").
   - **Icons (optional)** — a separate icon package/repo, if the DS ships one.
   Then derive everything else yourself from those sources.

2. **Gather the API.** From the answers, pull the real tokens, component API,
   guidelines, and icon set. `reference/ingest-strategies.md` covers each source type
   (GitHub repo, npm package, Storybook URL, Confluence/Docs, Figma/screenshots, icon
   packages) and how to normalize each into the canonical knowledge shape.

3. **Nail the runtime contract.** Determine exactly how this design system bootstraps
   so tokens/component styles resolve (stylesheet import? provider? theme attribute?).
   This is the #1 thing teams get wrong — `reference/runtime-contract.md` shows how to
   discover it and encode it in `config.runtime`.

4. **Write `design-system.config.json`.** Encode the sources + runtime contract (see
   `templates/design-system.config.example.json` for the schema and all `mode`s).

5. **Scaffold + ingest (autonomous).**
   ```
   node scripts/scaffold.mjs <target-skill-dir>      # copies engine + prose, fills placeholders
   node <target-skill-dir>/scripts/ingest.mjs        # populates knowledge/ from the real sources
   ```

6. **Refine + document.** Tailor the generated `SKILL.md`/reference prose to this DS's
   real component names, and fill the `{{...}}` prompts in the generated
   `ARCHITECTURE.md` (how it was built + how it works — a required deliverable).

7. **Verify the generated skill works.** Run `audit.mjs` on a known-bad and known-good
   snippet, and prove a render wires up (the runtime gate). Only then is it done.

## What the generated skill contains
```
<skill>/
├── SKILL.md                         # when-to-use + rubric + workflow pointers
├── ARCHITECTURE.md                  # how it was created and how it works
├── design-system.config.json       # the single source of truth for sources + runtime
├── scripts/{ingest,audit,audit-runtime}.mjs
├── reference/{generate,audit,verify}.md
└── knowledge/{tokens,components,runtime,meta,icons}.json + usage/…
```

## Autonomy
After the interview, work autonomously: fetch/clone sources, derive the config, run
ingest, populate knowledge, write ARCHITECTURE.md, and verify — without further
questions unless something is genuinely ambiguous or a fetch fails. If a source can't
be reached, say so and fall back (e.g. `mode: "manual"` and author the knowledge file
from what you can access), rather than silently guessing.

## Reference files
- `reference/build.md` — the full step-by-step build (read this first).
- `reference/interview.md` — the exact questions + cross-host asking.
- `reference/ingest-strategies.md` — how to source each knowledge category, per source type.
- `reference/runtime-contract.md` — discovering & encoding the runtime bootstrap.
- `templates/` — the files copied into the generated skill (engine scripts verbatim;
  prose with placeholders).
