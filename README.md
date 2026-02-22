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

## Install & build

From the repo root:

```bash
pnpm install
pnpm build          # Build all packages (core + apps)
pnpm --filter core run test   # Run core tests
```

To build only the extension:

```bash
pnpm --filter makoki-visualizer build
# or from apps/vscode-extension: pnpm run build
```

## Development (VS Code extension)

1. Build the project: `pnpm run build`
2. Open the repo in VS Code (or Cursor).
3. Press **F5** (or **Run > Start Debugging**) to launch an Extension Development Host window.
4. In the new window, open a `.yaml`, `.json` or `.jsonc` file.
5. Open the visualizer:
   - **Editor title bar:** click the **Active MV** (preview) button, or  
   - **Context menu:** right‑click in the editor → **Open with Makoki Visualizer**.

In the panel you can browse the tree, **search** (filter by key or value), and **double‑click** a scalar value to edit it inline (saves back to the document).

## Tech stack

- **Language:** TypeScript
- **Build:** TypeScript compiler (core), esbuild (apps)
- **UI:** Vanilla TS + Web Components, no framework; CSS via Constructable Stylesheets (BEM + custom properties)
- **YAML:** [yaml](https://github.com/eemeli/yaml) (comment-preserving AST)
- **JSON/JSONC:** [jsonc-parser](https://github.com/microsoft/node-jsonc-parser) (comments, trailing commas)

## License

ISC
