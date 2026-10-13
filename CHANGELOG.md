# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-10-13

First Marketplace release; `0.1.0` was published to GitHub only.

### Changed

- Editor backgrounds are now `#191919` (Benom) and `#251e1d` (Benom Alt); chrome is darker.
- Diff, gutter, and minimap tints keep editor text readable.
- Per-variant terminal surfaces.

### Fixed

- HTML/XML tag red now meets 4.5:1 contrast in both variants (was about 2.8:1).
- README variant table and screenshots match the shipped colors.
- Tests run serially to avoid a build/read race in CI.

## [0.1.0] - 2026-10-12

### Added

- Initial release: the Benom and Benom Alt themes.
- TextMate `tokenColors`, `semanticTokenColors`, and workbench `colors`.
- Contrast-targeted color lifting with a generated `DECISIONS.md` section.
- Zero-dependency build (`scripts/build.mjs`) and check (`scripts/check.mjs`).
- Quality gates: JSON/hex validity, contrast, known workbench ids, determinism.
- Packaging via `@vscode/vsce` and `ovsx` with a committed `package-lock.json`.
- `.vscodeignore` yielding the exact `.vsix` file list.
- Generated 128x128 `icon.png` (zero-dependency `node:zlib` encoder).
- Realistic sample files in `samples/` for syntax coverage.
- Marketplace-ready `README.md`, this `CHANGELOG.md`, and `docs/PUBLISHING.md`.
- Packaging gate test (`test/package.test.mjs`).
