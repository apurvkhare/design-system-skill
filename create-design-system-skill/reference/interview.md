# Interview — collect the sources (ask, don't guess)

The whole skill is only as good as the sources it's grounded in, so **collect them
with a real structured question**, not by inferring from the repo you happen to be in.
Ask up front, in one consolidated round, then work autonomously.

## Ask with the host's question tool — on ANY host
Use whatever interactive question mechanism the current host provides. The intent is
the same everywhere: present clear, specific questions and let the user answer.

- **Claude Code / Claude.ai** → the `AskUserQuestion` tool. One call, multiple
  questions; each option should be a concrete choice, and the user can always type a
  custom answer ("Other"). Prefer this.
- **Cursor** → its ask/followup question mechanism (e.g. an ask-followup-question
  tool). Same questions, same options.
- **Codex / other agent runtimes** → whatever "ask the user" / clarifying-question
  facility exists.
- **No structured tool available** → ask in plain prose, but still as an explicit,
  numbered list of the same questions, and wait for the answers before building.

Do not skip the interview because a tool is missing — degrade to prose, never to
guessing. The sources decide correctness.

## The four inputs (ask all four)

### 1. Components — REQUIRED
Where do your components live? Best case is a **GitHub repo** (the source is always
there, even if the team ships no catalog). Also accept: an **npm package** (installed
or by name), a generated **`components.json`** URL/path, or "just the TypeScript
types / source". Capture:
- repo URL or npm package name (+ version if pinned),
- the import path consumers use (e.g. `@acme/ui`),
- a path hint if you know it (`generated/components.json`, `packages/react/src`, …).

### 2. Guidelines — REQUIRED (accept "none")
Where are the usage rules / do's and don'ts? Accept **Confluence**, **Google Docs**,
**markdown in the repo**, a **docs site**, or a Figma spec. Capture the URL(s) or repo
path. If there's an Atlassian/Google MCP connected, note it — you can pull the pages
directly. "None" is a valid answer (the skill still works from tokens + component API).

### 3. Storybook — REQUIRED (accept "none")
Where is Storybook? Preferably a **GitHub link** or the deployed URL — anything the
agent can scrape (the published `index.json` / `stories.json` is ideal). If they only
have it running locally or behind auth, note that. Even a **screen share / screenshots
of stories** is usable — check whether you can fetch/read it before assuming you can't.
"None" is valid.

### 4. Icons — OPTIONAL (this is the one teams forget)
Does the design system ship its **own iconography**, often as a **separate npm
package** (e.g. `@acme/icons`)? Many companies do, and code should use those icons —
never inline `<svg>` or a random icon font. Capture:
- the icon package name / repo,
- how icons are consumed (named component exports like `<SearchIcon/>`, or a single
  `<Icon name="search"/>` component),
- where the icon set can be enumerated (a repo `*.svg` dir, a names JSON, or an export
  probe). If there are no separate icons, answer "none".

## Suggested AskUserQuestion shape (Claude Code)
One call, four questions. Make options concrete and let the user override via "Other":

- **Components** — options like: "GitHub repo (I'll paste the URL)", "npm package",
  "Generated components.json", "TypeScript source only".
- **Guidelines** — "Confluence", "Google Docs", "Markdown in the repo", "Docs site",
  "None".
- **Storybook** — "Published URL / index.json", "GitHub repo", "Local only /
  screenshots", "None".
- **Icons** — "Separate icon package", "Icons in the main package", "SVG files in a
  repo", "None".

After the multiple-choice round, ask for the concrete URLs/paths/package names for
whichever options they picked (a short follow-up, or capture them from the "Other"
free-text). You need the actual pointers before you can ingest.

## After the interview
Record the answers, then proceed autonomously through `reference/build.md`. Only come
back to the user if a source is unreachable or genuinely ambiguous.
