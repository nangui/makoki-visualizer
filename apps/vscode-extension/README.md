# Makoki Visualizer

View and edit YAML and JSON files as an interactive tree. No more scrolling through huge config files—browse by key, search, and edit values inline.

## Features

- **Tree view** — Structured view of your YAML, JSON, and JSONC documents with expand/collapse.
- **Search** — Filter the tree by key or value in real time.
- **Inline editing** — Double-click a value to edit it; changes are written back to the file with minimal diffs (comments and formatting preserved where possible).
- **Multiple entry points** — Open the visualizer from the editor title bar (**Active MV** button) or from the context menu (**Open with Makoki Visualizer**).

## How to use

1. Open a `.yaml`, `.json`, or `.jsonc` file.
2. Click **Active MV** in the editor title bar, or right-click in the editor and choose **Open with Makoki Visualizer**.
3. In the side panel:
   - Browse the tree and expand/collapse nodes.
   - Use the search box to filter by key or value.
   - Double-click a scalar value to edit it; press Enter to save or Escape to cancel.

## Requirements

- VS Code (or Cursor) **1.75** or newer.

## License

ISC
