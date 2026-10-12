# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Packaging via `@vscode/vsce` and `ovsx` with a committed `package-lock.json`.
- `.vscodeignore` yielding the exact `.vsix` file list.
- Generated 128x128 `icon.png` (zero-dependency `node:zlib` encoder).
- Realistic sample files in `samples/` for syntax coverage.
- Marketplace-ready `README.md`, this `CHANGELOG.md`, and `docs/PUBLISHING.md`.
- Packaging gate test (`test/package.test.mjs`).

## [0.1.0] - 2026-01-01

### Added

- Initial release: the Benom and Benom Alt themes.
- Both variants with `editor.background` `#000000` and `#211816`.
- TextMate `tokenColors`, `semanticTokenColors`, and workbench `colors`.
- Contrast-targeted color lifting with a generated `DECISIONS.md` section.
- Zero-dependency build (`scripts/build.mjs`) and check (`scripts/check.mjs`).
- Quality gates: JSON/hex validity, contrast, known workbench ids, determinism.
