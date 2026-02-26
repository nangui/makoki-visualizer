# Changelog

All notable changes to the Makoki Visualizer extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.2] - 2026-02-26

### Changed

- Bumped extension version to `0.1.2` for the next VSIX/marketplace release.

## [0.1.1] - 2026-02-26

### Fixed

- Fixed activation/runtime packaging so `makoki.openVisualizer` is correctly registered after install.
- Bundled runtime parser dependencies into the extension output to avoid missing module failures in installed VSIX builds.
- Added `vscode:prepublish` build hook to reduce risk of shipping stale/broken bundles.
- Adjusted VS Code engine compatibility to `^1.75.0` for broader support in VS Code and Cursor.

## [0.1.0] - 2025-02-22

### Added

- Tree view for YAML, JSON, and JSONC files.
- Search/filter by key or value with real-time filtering and match highlighting.
- Inline editing of scalar values with minimal document edits (comment- and format-preserving where possible).
- Command **Active MV** and editor title bar button to open the visualizer.
- Context menu entry **Open with Makoki Visualizer** for YAML/JSON/JSONC editors.
- Panel sync with the active document (refresh on change, view state handling).
