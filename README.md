# Makoki Visualizer

Visual reader and editor for YAML and JSON files. Transforms raw config files into a readable, indented, interactive key-value tree.

## Surfaces

- **MV Extension** — VSCode / Cursor extension: floating "Active MV" button in the editor, WebView panel with tree view and inline editing.
- **MV Web** — Standalone web app: open files via File System Access API or drag & drop, all processing local (no server).

## Monorepo

```
makoki-visualizer/
├── packages/
│   └── core/          # Shared types, parsers, serializers, Web Components
├── apps/
│   ├── vscode-extension/
│   └── web/
├── pnpm-workspace.yaml
└── package.json
```

## Requirements

- Node.js 18+
- [pnpm](https://pnpm.io) 9+

## Commands

From the repo root:

```bash
pnpm install
pnpm build          # Build all packages
pnpm --filter core build
pnpm --filter vscode-extension build
pnpm --filter web build
```

## Tech stack

- **Language:** TypeScript
- **Build:** TypeScript compiler (core), esbuild (apps)
- **UI:** Vanilla TS + Web Components, no framework; CSS via Constructable Stylesheets (BEM + custom properties)
- **YAML:** [yaml](https://github.com/eemeli/yaml) (comment-preserving AST)
- **JSON/JSONC:** [jsonc-parser](https://github.com/microsoft/node-jsonc-parser) (comments, trailing commas)

## License

ISC
