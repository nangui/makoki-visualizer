# Contributing to Makoki Visualizer — Core

This package contains shared types, parsers, serializers, and Web Components used by both the VSCode extension and the web app. When adding or modifying components or styles, follow the conventions below.

---

## CSS: BEM + Custom Properties

### Scope

All styling is **inside the Shadow DOM** of each Web Component. There are no global stylesheets for component internals. CSS is authored as TypeScript strings and attached via the **Constructable Stylesheets API** (`CSSStyleSheet` + `adoptedStyleSheets`). See ADR-2 in `docs/architecture-decisions.md`.

### BEM Convention

We use **BEM adapted to Web Components**:

- **Block** = the custom element name (e.g. `mv-tree`, `mv-node`, `mv-value-editor`). The host or a single root element carries the block class.
- **Element** = `{block}__{element}` (e.g. `mv-node__key`, `mv-node__value`, `mv-tree__list`).
- **Modifier** = `{block}--{modifier}` or `{block}__{element}--{modifier}` (e.g. `mv-node--collapsed`, `mv-node__value--editing`).

Examples:

```html
<mv-node class="mv-node mv-node--collapsed">
  <span class="mv-node__key">server</span>
  <span class="mv-node__value mv-node__value--editing">localhost</span>
</mv-node>
```

- Use a single block class per component; elements and modifiers are nested or on the host as needed.
- Avoid deep nesting in selectors; prefer `.mv-node__key`, not `.mv-tree .mv-node .mv-node__key` (Shadow DOM already scopes).

### Custom Properties (Design Tokens)

Components must not rely on ad-hoc hex/rgba values. Use custom properties so theming works in both the extension (VSCode theme bridge) and the web app (light/dark).

**Naming convention:**

| Prefix       | Usage              | Examples                                      |
|-------------|--------------------|-----------------------------------------------|
| `--mv-color-*`  | Colors             | `--mv-color-surface`, `--mv-color-text`, `--mv-color-text-muted`, `--mv-color-accent`, `--mv-color-error` |
| `--mv-spacing-*` | Spacing / layout   | `--mv-spacing-xs`, `--mv-spacing-sm`, `--mv-spacing-md`, `--mv-spacing-row` |
| `--mv-font-*`   | Typography         | `--mv-font-family`, `--mv-font-size-base`, `--mv-font-size-sm`, `--mv-font-mono` |

- **Define** tokens at the app/WebView root (or in the extension’s theme bridge). In `core`, **consume** them only; do not define global tokens in shared components unless they are clearly documented as shared defaults.
- Components may define **local** custom properties for internal variants (e.g. `--mv-node-indent-step`) as long as they are prefixed with `--mv-` and documented in the component.

### File and Code Location

- No separate `.css` files. CSS lives as template literal(s) or string(s) in the same TypeScript file as the component, then:

  ```ts
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(styles);
  this.shadowRoot!.adoptedStyleSheets = [sheet];
  ```

- Keep selectors flat and class-based; avoid IDs and deep nesting.

---

## Component Naming

- Tag names: `mv-{feature}` (e.g. `mv-tree`, `mv-node`, `mv-search`, `mv-breadcrumb`, `mv-value-editor`, `mv-doc-selector`).
- All public components are registered in the core package entry so that the extension and web app can import them without touching internal class names.

---

## References

- **Architecture decisions:** `docs/architecture-decisions.md` (ADR-1, ADR-2, ADR-3).
- **Product scope and behaviour:** `docs/makoki-visualizer-prd.md`.
