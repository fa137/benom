# Developing Benom

Benom is generated from three hand-authored sources:

- `src/palette.json` — the Venom palette (the only place a
  color value is written).
- `src/tokens.mjs` — the TextMate token rules (scope ->
  palette color + font style) and the semantic token rules.
- `src/workbench.mjs` — the workbench (UI) color rules.

`scripts/build.mjs` turns those into
`themes/benom-color-theme.json` and
`themes/benom-alt-color-theme.json`. Never edit the generated
themes directly; edit the sources and rebuild.

## npm scripts

- **`npm run build`** — regenerate both themes from
  `src/palette.json`, `src/tokens.mjs` and `src/workbench.mjs`.
  Also rewrites the generated section of `DECISIONS.md` with
  every lifted color and its contrast ratio.
- **`npm test`** — run the quality gates (`node --test
  test/*.test.mjs`): gate 1 (valid theme JSON), gate 2
  (contrast), gate 3 (known colors), gate 4 (token coverage,
  `test/coverage.test.mjs`), gate 5 (determinism) and the
  packaging/syntax-fidelity checks.
- **`npm run check`** — build, then lint the generated themes
  (`scripts/check.mjs`): JSON validity, hex colors, variant
  backgrounds, workbench ids, contrast and a clean build.
- **`npm run audit`** — the token coverage audit
  (`scripts/audit.mjs`). Tokenizes every file in `samples/`
  with the real grammars and prints, per language and per
  theme, the count of tokens for each color/font style and the
  distinct scopes that fall through to the default foreground.
- **`npm run package`** — build, then `vsce package` to produce
  the `.vsix` extension bundle.

## Token coverage (gate 4)

`scripts/tokenize.mjs` is the single source of truth shared by
the audit and the gate-4 test. It loads grammars from
`tm-grammars`, initializes `vscode-oniguruma` with the WASM
binary from `node_modules/vscode-oniguruma/release/onig.wasm`,
tokenizes a document line by line, and resolves each token's
scope stack through a theme's `tokenColors` with VS Code's
longest-scope-match rules (segment-count comparison, rule-order
tie-breaking).

## Adding a sample

Drop a file into `samples/` with the right extension
(`.py`, `.ts`, `.tsx`, `.rs`, `.go`, `.json`, `.md`, `.sh`,
`.css`, `.html`, `.sql`, `.yaml`). The audit and gate 4 pick it
up automatically by extension. The sample should exercise the
token kinds you care about (comments, strings, numbers, keywords,
functions, types, tags, attributes, operators, decorators).

## Adding a token rule

1. Add a role to the `tokenRules` array in `src/tokens.mjs`:
   `{ role: 'myRole', scopes: ['my.scope'], paletteKey: '...',
   fontStyle: '' }`. `paletteKey` must name an existing key in
   `src/palette.json` (no new hues) and `fontStyle` is one of
   `''`, `'bold'`, `'italic'`.
2. Run `npm run build` to regenerate the themes.
3. Run `npm run audit` to confirm the new scope no longer falls
   through to the default foreground.
4. Run `npm test` to confirm all gates pass.
5. Record the addition (and any exception it needs) in
   `DECISIONS.md` with a dated entry.
