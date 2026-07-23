# design-system-skill

Teach an AI coding agent your **own** design system, so it generates UI with your real
components, tokens, and icons — correctly wired to actually render — instead of
training-data guesses.

This repo contains two [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills):

| Skill | What it is |
| --- | --- |
| [`create-design-system-skill`](create-design-system-skill/) | A **meta-skill**. Interview it about your component library (repo, guidelines, Storybook, icons) and it autonomously builds a design-system skill *for that library* — ingesting the real API into a committed `knowledge/` snapshot, generating audit scanners and workflows. |
| [`tenet-ui-skill`](tenet-ui-skill/) | A **worked example** produced by the meta-skill, grounded in the [`tenet-ui`](https://www.npmjs.com/package/tenet-ui) library ("Editorial Ink"). Use it as a reference for what the generated output looks like — or install it to generate/audit `tenet-ui` React. |

📺 **Watch the walkthrough:** [YouTube](https://www.youtube.com/watch?v=VG_p6kTBWzU)
🖥️ **Slides:** [design-system-skill-slides.vercel.app](https://design-system-skill-slides.vercel.app/1)

---

## The core idea

A design system is a **runtime contract**, not just a token dictionary. Code can cite
every real token and component and still render **completely unstyled** because the
stylesheet was never imported or the provider never mounted. So every skill this repo
builds audits on two axes — *content* (are the right tokens/components used?) and
*runtime* (do they actually resolve?) — and gates on a real render.

---

## Install

### With the GitHub CLI (recommended)

> **Prerequisite:** [GitHub CLI](https://cli.github.com/) installed.

```bash
gh skill install apurvkhare/design-system-skill create-design-system-skill
# swap the last argument for tenet-ui-skill to install the example
```

### Manual

Skills live in a `skills/` directory that your agent reads:

- **Global (all projects):** `~/.claude/skills/`
- **Per-project:** `.claude/skills/` inside a repo

Clone this repo, then either **copy** a skill in (a fixed snapshot) or **symlink** it
(stays in sync as you `git pull`):

```bash
git clone https://github.com/apurvkhare/design-system-skill.git
cd design-system-skill

# Copy the meta-skill into your global skills dir…
cp -R create-design-system-skill ~/.claude/skills/create-design-system-skill

# …or symlink it instead, to track upstream changes:
ln -s "$PWD/create-design-system-skill" ~/.claude/skills/create-design-system-skill
```

Install `tenet-ui-skill` the same way if you want the example.

### Manual-only vs. auto-invoked

By default an agent may auto-invoke a skill when a request matches its description. To
make a skill run **only** when you explicitly call it (`/create-design-system-skill`),
add this to the top of its `SKILL.md` frontmatter:

```yaml
---
name: create-design-system-skill
disable-model-invocation: true   # only runs when invoked by name
description: >-
  ...
---
```

Restart your agent (or reload skills) after installing so it picks up the new skill.

---

## Use

### Build a skill for your design system

Invoke the meta-skill by name:

```
/create-design-system-skill
```

It runs a short **interview** for the four inputs — then works autonomously:

1. **Components** *(required)* — where your components live (GitHub repo is best; also
   an npm package, a generated `components.json`, or TS source).
2. **Guidelines** — usage rules / do's and don'ts (Confluence, Google Docs, markdown,
   a docs site). "None" is valid.
3. **Storybook** — a published URL or repo it can scrape. "None" is valid.
4. **Icons** *(optional)* — a separate icon package/repo, if your DS ships one.

From there it gathers the real API, works out the **runtime contract** (how the DS
bootstraps so styles resolve), writes a `design-system.config.json`, scaffolds the new
skill, ingests the sources into `knowledge/`, and verifies the scanners discriminate
good code from bad. The output is a self-contained skill:

```
<your-ds>-skill/
├── SKILL.md                       # when-to-use + rubric + workflow pointers
├── ARCHITECTURE.md                # how it was built and how it works
├── design-system.config.json      # single source of truth: sources + runtime contract
├── scripts/{ingest,audit,audit-runtime}.mjs
├── reference/{generate,audit,verify}.md
└── knowledge/{tokens,components,runtime,meta,icons}.json + usage/…
```

### Use a generated skill (e.g. `tenet-ui-skill`)

Once a design-system skill is installed, just ask your agent in natural language:

- **Generate** — "build this screenshot with tenet-ui" / "code this screen using our DS".
- **Audit** — "audit this file against the design system" (flags hardcoded hex/px, raw
  `<button>`s, inline `<svg>` where an icon component exists, invented props).
- **Verify** — confirm the rendered output actually wires up and is styled.

### Refresh after your DS changes

The skill's knowledge is a committed snapshot. When your design system ships updates,
re-ingest to bring it current:

```bash
node ~/.claude/skills/<your-ds>-skill/scripts/ingest.mjs
```

---

## Learn more

- 📺 **Video walkthrough:** https://www.youtube.com/watch?v=VG_p6kTBWzU
- 🖥️ **Slides:** https://design-system-skill-slides.vercel.app/1
- 📄 Each skill's own `SKILL.md` and `ARCHITECTURE.md` document its rubric and internals.
