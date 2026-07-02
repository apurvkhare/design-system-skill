# Architecture — `tenet-ui-skill`

How this skill is built and how it works. It turns a design (screenshot, Figma
frame, or mockup) into **`tenet-ui`-compliant React**, audits existing code for
violations, and verifies that the result actually renders — grounded in an *ingested
snapshot* of the real `tenet-ui` API under `knowledge/`, not the model's training-data
memory.

- **Design system:** Tenet UI ("Editorial Ink"), npm package `tenet-ui`
- **Source package:** `demo-design-system/` (this monorepo)
- **Ingested knowledge:** 98 tokens · 36 components · 36 usage guidelines
- **Generated from:** `src/components/**/*.docs.json` (component catalog) + `dist/tokens.json`

## The one idea this skill exists to encode
A design system is a **runtime contract**, not just a token dictionary. Citing real
tokens/components is necessary but **not sufficient**: every `var(--token)` and every
`Tenet-*` component class is undefined until `tenet-ui/styles.css` is imported once at
the app root. Code can reference every token and component correctly and still render
**completely unstyled**. So the skill judges compliance on **two independent axes** —
*content* (are the right tokens/components used?) and *runtime* (do they resolve?) —
and gates on a real render (Verify).

## Directory layout
```
tenet-ui-skill/
├── SKILL.md                     # when-to-use + rubric + workflow pointers (progressive disclosure)
├── ARCHITECTURE.md              # this file
├── design-system.config.json    # single source of truth: sources + runtime contract
├── scripts/
│   ├── ingest.mjs               # DS package → knowledge/ snapshot
│   ├── audit.mjs                # per-file CONTENT audit (tokens/components/API)
│   └── audit-runtime.mjs        # per-project RUNTIME audit (does the DS resolve?)
├── reference/
│   ├── generate.md              # design → tenet-ui React
│   ├── verify.md                # prove it renders (the gate)
│   └── audit.md                 # find & fix violations
└── knowledge/                   # the ingested snapshot the model reads on demand
    ├── tokens.json              # 98 tokens (themed light/dark or shared value)
    ├── components.json          # 36 components (props, subcomponents, importPath)
    ├── runtime.json             # the runtime contract
    ├── meta.json                # counts + provenance
    └── usage/*.md               # 36 per-component guideline docs
```

## Data flow (build time → use time)
```mermaid
graph LR
    subgraph Source["demo-design-system (tenet-ui)"]
        TOK["dist/tokens.json"]
        CAT["generated/components.json<br/>(from *.docs.json)"]
        GUI["guidelines/*.md"]
    end
    CFG["design-system.config.json<br/>(runtime contract)"]

    TOK --> ING["scripts/ingest.mjs"]
    CAT --> ING
    GUI --> ING
    CFG --> ING

    ING --> K["knowledge/<br/>tokens · components · usage · runtime · meta"]

    K --> GEN["Generate<br/>design → React"]
    K --> AUD["Audit<br/>find violations"]
    K --> VER["Verify<br/>render → check"]

    style ING fill:#b5851f,color:#211d17
    style K fill:#c2502e,color:#fff
    style CFG fill:#4f6f3a,color:#fff
```

## Ingest pipeline (`scripts/ingest.mjs`)
Ingest is a dependency-free Node script that copies the *current* API into a committed
snapshot. It resolves the source package in priority order so it works whether the
skill lives next to the repo or is installed globally and pointed at a consumer:

```mermaid
graph TD
    A["node scripts/ingest.mjs [--from &lt;path&gt;]"] --> B{"resolve source"}
    B -->|"1"| F1["--from &lt;path&gt;"]
    B -->|"2"| F2["config.packageDir<br/>(../../../demo-design-system)"]
    B -->|"3"| F3["node_modules/tenet-ui<br/>(a consumer install)"]
    F1 --> R["pkgDir"]
    F2 --> R
    F3 --> R
    R --> T["copy dist/tokens.json → tokens.json"]
    R --> C["flatten generated/components.json → components.json"]
    R --> G["copy guidelines/*.md → usage/"]
    CFG["config.runtime"] --> RT["write runtime.json"]
    T --> M["write meta.json<br/>(counts + provenance)"]
    C --> M
    G --> M
    RT --> M

    style R fill:#b5851f,color:#211d17
    style M fill:#c2502e,color:#fff
```

Notes:
- **Tokens** are copied as-is. Themed entries carry `light` + `dark`; shared entries
  (spacing, radius, sizes) carry a single `value`.
  ```jsonc
  // themed
  "fgColor-default": { "name": "fgColor-default", "cssVar": "--fgColor-default",
                       "type": "color", "themed": true, "light": "#2a241b", "dark": "#f4eee3" }
  // shared
  "base-color-white": { "name": "base-color-white", "cssVar": "--base-color-white",
                        "value": "#ffffff", "type": "color" }
  ```
- **Components** ship as `{ schemaVersion, generatedFrom, components: { <id>: {...} } }`;
  ingest flattens to the inner map so the audit can `Object.values()` it. Each entry:
  `{ id, name, status, a11yReviewed, importPath, source, props[], stories, subcomponents }`.
- **Guidelines** are copied verbatim (one markdown per component).
- **Runtime contract** is copied from `config.runtime` so the workflows/scanners read
  it from the knowledge base.

Re-run `node scripts/ingest.mjs` after rebuilding the package so the skill never drifts
from the real API. `knowledge/meta.json` records counts + `generatedFrom` provenance.

## The three workflows
`SKILL.md` routes to one of three reference docs; all read the same `knowledge/`.

```mermaid
graph TD
    Q{"what's asked?"}
    Q -->|"build this screen"| GEN["Generate<br/>reference/generate.md"]
    Q -->|"is this compliant? / find violations"| AUD["Audit<br/>reference/audit.md"]
    Q -->|"does it match / render?"| VER["Verify<br/>reference/verify.md"]

    GEN --> S1["1 read runtime.json FIRST<br/>2 map roles → components<br/>3 tokens-only custom CSS"]
    S1 --> GATE
    AUD --> A1["run both scanners<br/>score the rubric<br/>fix → re-score to 0"]
    A1 --> GATE
    GATE["audit.mjs + audit-runtime.mjs → 0 errors"] --> VER
    VER --> PASS["styled render in light + dark,<br/>tokens resolve, matches target"]

    style GATE fill:#b5851f,color:#211d17
    style PASS fill:#4f6f3a,color:#fff
```

## The compliance rubric & the two-axis gate
The rubric (in `SKILL.md`), in order: **runtime wiring → components → color →
spacing/size → typography/radius/border/shadow → API → guidelines**. Two scanners
enforce it, and neither replaces a real render:

```mermaid
flowchart TD
    START["generated / existing code"] --> RUN["audit-runtime.mjs &lt;project&gt;"]
    RUN -->|"stylesheet NOT imported"| FAILR["✗ renders UNSTYLED<br/>fix first — everything else is moot"]
    RUN -->|"wired"| CONTENT["audit.mjs &lt;file&gt;"]
    CONTENT -->|"hardcoded hex/px,<br/>raw element, invented prop"| FAILC["✗ not compliant<br/>replace with token/component/real prop"]
    CONTENT -->|"0 violations"| VERIFY["Verify: real render"]
    VERIFY -->|"token resolves to ''"| FAILR
    VERIFY -->|"styled, both themes, matches"| DONE["✓ compliant"]

    style FAILR fill:#8a3324,color:#fff
    style FAILC fill:#8a3324,color:#fff
    style DONE fill:#4f6f3a,color:#fff
```

Why both axes exist (the canonical lesson):
- A **hardcoded-palette** reimplementation *looks* perfect but can't theme and fails
  the **content** audit — passes runtime, fails content.
- **Token-perfect code that never imports the stylesheet** audits clean but renders
  blank — passes content, fails **runtime**.

Only running both scanners **and** gating on Verify catches both.

### `scripts/audit.mjs` (content, per file)
Heuristic, dependency-free scanner over one `.tsx`. Builds indexes from `knowledge/`
(hex→token, px→token, valid css vars, component names, per-component prop sets incl.
compound subcomponents) and flags:
- hardcoded colors (`#hex`, `rgb()/hsl()`), off-scale px (the 4px scale; 1/2px allowed),
- unknown `var(--…)` tokens,
- raw `<button>/<input>/<textarea>/<select>/<a>` that have a `tenet-ui` equivalent,
- invented props on `tenet-ui` components (and subcomponents like `Tabs.Tab`).

Each finding carries the concrete fix (the token/component to use). Exits non-zero on
any error; `--json` for aggregation.

### `scripts/audit-runtime.mjs` (runtime, per project)
Walks the project, strips comments (so an import that lives only in a comment doesn't
count), detects whether the project uses `tenet-ui` (a `var(--…)`, an import from
`tenet-ui`, or a `Tenet-*` class), and if so requires the `runtime.json` `cssImports`
(and any `providers`) to actually be imported/mounted. This is the gate for the #1
failure mode.

## The runtime contract (`knowledge/runtime.json`)
`tenet-ui` ships tokens **and** component styles as one stylesheet. There is **no
provider** — theming is an attribute.

```mermaid
graph LR
    ENTRY["app entry (main.tsx)"] -->|"import 'tenet-ui/styles.css'"| STYLES["tokens + Tenet-* styles resolve"]
    HTML["&lt;html data-color-mode='light|dark'&gt;"] --> THEME["theme switch (no provider)"]
    STYLES --> UI["styled UI"]
    THEME --> UI

    style STYLES fill:#b5851f,color:#211d17
    style UI fill:#4f6f3a,color:#fff
```

- `cssImports`: `["tenet-ui/styles.css"]`
- `classPrefix`: `Tenet-`
- `providers`: `[]` (none)
- `themeAttribute`: `data-color-mode` = `light | dark` on the documentElement
- `verifyTokensResolve`: `--bgColor-default`, `--fgColor-default`, `--borderColor-default`,
  `--fontFamily-body`, `--space-3` — Verify checks these are non-empty via `getComputedStyle`.

## How it was built
1. **Config.** `design-system.config.json` points at the repo build
   (`packageDir: ../../../demo-design-system`) and encodes the runtime contract.
2. **Ingest.** `node scripts/ingest.mjs` pulled 98 tokens, 36 components, and 36
   guideline docs into `knowledge/`.
3. **Scanners + workflows.** `audit.mjs` / `audit-runtime.mjs` enforce the rubric;
   `reference/{generate,verify,audit}.md` carry the three workflows.
4. **Verify harness.** `demo-app/` (Vite, port 5180) imports `tenet-ui/styles.css` once
   and aliases `tenet-ui` to the local source for fast iteration.

## Keeping it current
`tenet-ui` changes → `node scripts/ingest.mjs` re-ingests → commit `knowledge/`. The
update is a versioned commit, not an ops task on a drifting server. If a source path
moves, update `design-system.config.json`; `knowledge/meta.json` records provenance so
drift is easy to spot.

## Retargeting to another design system
This skill was hand-built for `tenet-ui`. To generate the same shape for *any* design
system (with the icons axis added), see the sibling **`create-design-system-skill`**
meta-skill, which interviews for sources (components, guidelines, Storybook, icons) and
produces a skill with this exact architecture.
