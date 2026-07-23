# create-design-system-skill

A **meta-skill** for AI coding agents. Interview it about your component library — repo,
guidelines, Storybook, icons — and it autonomously builds a design-system skill *for that
library*: it ingests the real component API, tokens, and icons into a committed
`knowledge/` snapshot, generates content + runtime audit scanners, and wires up
Generate / Audit / Verify workflows. The result grounds UI generation in your *current*
design system instead of the model's training-data guesses.

The one idea it exists to encode: a design system is a **runtime contract**, not just a
token dictionary. Code can cite every real token and component and still render
completely unstyled because the stylesheet was never imported or the provider never
mounted. So every skill it builds audits on two axes — *content* (right tokens/
components?) and *runtime* (do they resolve?) — and gates on a real render.

📺 **Walkthrough:** [YouTube](https://www.youtube.com/watch?v=VG_p6kTBWzU) · 🖥️ **Slides:** [design-system-skill-slides.vercel.app](https://design-system-skill-slides.vercel.app/1)

---

## Install

### With the GitHub CLI (recommended)

> **Prerequisite:** [GitHub CLI](https://cli.github.com/) installed.

```bash
gh skill install apurvkhare/design-system-skill create-design-system-skill
```

### Manual

Clone the repo, then copy (a fixed snapshot) or symlink (tracks upstream) the skill into
your skills dir — `~/.claude/skills/` for all projects, or `.claude/skills/` in one repo:

```bash
git clone https://github.com/apurvkhare/design-system-skill.git
cp -R design-system-skill/create-design-system-skill ~/.claude/skills/create-design-system-skill
# …or: ln -s "$PWD/design-system-skill/create-design-system-skill" ~/.claude/skills/create-design-system-skill
```

Restart your agent (or reload skills) so it picks up the new skill.

---

## Use

Invoke it by name:

```
/create-design-system-skill
```

It runs a short **interview** for four inputs, then works autonomously:

1. **Components** *(required)* — where your components live (GitHub repo is best; also an
   npm package, a generated `components.json`, or TS source).
2. **Guidelines** — usage rules / do's and don'ts (Confluence, Google Docs, markdown, a
   docs site). "None" is valid.
3. **Storybook** — a published URL or repo it can scrape. "None" is valid.
4. **Icons** *(optional)* — a separate icon package/repo, if your DS ships one.

From there it gathers the real API, works out the runtime contract, writes a
`design-system.config.json`, scaffolds the new skill, ingests the sources into
`knowledge/`, and verifies the scanners discriminate good code from bad. The output is a
self-contained skill:

```
<your-ds>-skill/
├── SKILL.md                       # when-to-use + rubric + workflow pointers
├── ARCHITECTURE.md                # how it was built and how it works
├── design-system.config.json      # single source of truth: sources + runtime contract
├── scripts/{ingest,audit,audit-runtime}.mjs
├── reference/{generate,audit,verify}.md
└── knowledge/{tokens,components,runtime,meta,icons}.json + usage/…
```

See [`tenet-ui-skill`](../tenet-ui-skill/) in this repo for a worked example of the
generated output.
