# Ingest strategies — turning each source into the knowledge base

The generated skill reads a canonical `knowledge/` snapshot. `scripts/ingest.mjs`
handles the machine-readable cases automatically (driven by `design-system.config.json`
`mode`s); for anything exotic, you (the model) normalize it by hand and set
`mode: "manual"` so ingest leaves your file alone. Below: per-category, per-source.

## Canonical shapes (what ingest writes / you author)
- **`knowledge/tokens.json`** — `{ "<name>": { name, cssVar, type, description, light, dark } }`
  for themed tokens; shared tokens (space/radius/size) carry `value` instead of light/dark.
- **`knowledge/components.json`** — `{ "<id>": { name, importPath, props:[{name,type,required,
  defaultValue,description}], subcomponents, stories } }`.
- **`knowledge/usage/*.md`** — one markdown per component (or `usage/stories.json` from Storybook).
- **`knowledge/icons.json`** — `{ package, importPath, usage, componentPattern, names:[...] }`.
- **`knowledge/runtime.json`** — the runtime contract (see `runtime-contract.md`).

## Tokens
- **Ships a token JSON** (Style-Dictionary/DTCG build, `dist/tokens.json`): point
  `tokens.mode` at `npm-json`/`repo-file` + `path`. If the shape differs from canonical,
  either massage it in config-free code or ingest with `manual` after transforming.
- **Token CDN / per-theme URLs** (like Primer's functional themes): use `mode: "url"`
  with `urls.themeUrl` + `themes:["light","dark"]` and `urls.nonColorUrl` + `nonColor:[…]`.
  ingest fetches and merges light/dark + non-color.
- **Only CSS custom properties / a Tailwind config / SCSS vars**: no clean JSON exists.
  Read the source, extract every `--token: value` (both themes), and **author
  `knowledge/tokens.json`** in canonical shape; set `tokens.mode: "manual"`.
- Prefer **semantic** tokens (fg/bg/border, status tints) in descriptions so Generate
  reaches for meaning, not raw primitives.

## Components
- **Generated `components.json`** (react-docgen / custom): the happy path — `npm-json`,
  `repo-file`, or `url`. ingest normalizes `{ components: {...} }` or the inner map.
- **No catalog, only TS + source**: generate one. Run the DS's own docgen if it has a
  script; otherwise read the exported components and their prop types and **author
  `knowledge/components.json`** (`manual`). Capture real prop names, unions
  (`variant: 'primary'|'danger'`), defaults, and subcomponents (`Foo.Item`).
- Always set the real **importPath** consumers use — the audit suggests it in fixes.

## Usage / guidelines
- **Markdown in the repo/package**: `mode: "package-md"`/`"repo-md"` + `dir` — ingest
  copies `*.md` into `knowledge/usage/`.
- **Storybook**: `mode: "storybook-url"` + `storybookIndexUrl` (the published
  `index.json`/`stories.json`) — ingest groups stories by component into
  `usage/stories.json`. If Storybook is a GitHub repo, the stories files (`*.stories.tsx`)
  and MDX docs are the source; summarize the guidance into `usage/<name>.md`.
- **Confluence / Google Docs / docs site**: fetch via the connected MCP (Atlassian /
  Google) or WebFetch, then **write concise `knowledge/usage/<name>.md`** per component
  — the rules people get wrong (when to use, accessible-name requirements, do/don't).
  Set `usage.mode: "manual"`. Summarize; don't dump whole pages.
- **Figma / screenshots only**: extract the rules you can see into `usage/*.md` (manual).

## Icons (optional but don't skip if they exist)
The goal: a list of legal icon names + how to import them, so Generate uses them and
audit flags inline `<svg>`.
- **Separate icon repo with SVG files**: `mode: "repo-svgs"` + `path` to the svg dir —
  ingest enumerates `*.svg` → names.
- **A names manifest** (JSON array/object, local or URL): `mode: "json"` + `path`/`url`.
- **npm package of icon components, no manifest**: run a quick probe to enumerate the
  exports, e.g. `node -e "console.log(Object.keys(require('@acme/icons')).join('\n'))"`
  (or read the `.d.ts` export names), write `knowledge/icons.json` yourself, set
  `mode: "manual"`.
- Set `componentPattern` to document the API: `"<Icon name=\"...\" />"` (name-based —
  audit can then flag unknown names) or `"named-export"` (e.g. `<SearchIcon/>`).

## Fetching mechanics
- **GitHub repo**: clone shallow to a temp/scratch dir (`git clone --depth 1`), point
  the relevant `packageDir` at it, run its build/docgen only if needed to produce a
  catalog, then ingest.
- **npm package**: `npm view <pkg> version` to pin, install into a scratch dir or read
  from the consumer's `node_modules`, point `packageDir`/`path` at it.
- **URLs**: prefer the CDN'd published artifacts (jsDelivr/unpkg) so ingest can
  re-fetch on refresh without a checkout.
- Record where each thing came from — `knowledge/meta.json` captures provenance so the
  next refresh (and future you) can see if a source moved.
