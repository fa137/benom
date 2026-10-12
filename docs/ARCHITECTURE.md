# Benom: architecture and plan

Benom is a VS Code color theme with two variants, built from the **Venom** palette of
[black-metal-theme-neovim](https://github.com/metalelf0/black-metal-theme-neovim) (Apache-2.0, see NOTICE).

| Variant | Theme name | Editor background |
|---|---|---|
| Benom | `Benom` | `#000000` (pure black) |
| Benom Alt | `Benom Alt` | `#211816` (the source's `alt_bg`, a warm dark brown) |

Goal: a dark theme that is genuinely good for long coding sessions, and a package that can be published to
the VS Code Marketplace (and Open VSX) with one tag push.

## Principles
1. **Faithful to Venom.** Venom is almost monochrome: greys plus one red (`#fc302e`, used for types) and one
   teal (`#5f8787`). Do not add syntax hues. Distinguish token kinds with the existing greys, the red,
   the teal, and **font style** (italic, bold), not with new colors.
2. **Readable first.** Facts measured on the source palette (contrast ratio against the background):
   - Fine (above 4.5:1 on both backgrounds): fg, string, type, constant/number, keyword, operator, func.
   - Too low: `comment #505050` is 2.6:1 on black and 2.2:1 on `#211816`; `diag_green #6e4c4c` is 2.8:1;
     `alt #5f8787` is 4.4:1 on `#211816`; `visual #222222` (selection) is 1.09:1 on `#211816`, invisible.
   So the build **lifts** any color below its target to the nearest lighter shade of the same hue that
   meets it. Lifts are logged in a generated `DECISIONS.md` section so every change from Venom is visible.
3. **One source of truth, generated output.** Colors live in `src/palette.json`. The theme JSON files are
   generated, committed, and never edited by hand.
4. **Functional colors are the only additions.** Errors, warnings, diff and git need real hues. They are
   listed under `functional_additions` in the palette, desaturated, and used outside syntax only.

## Contrast targets (WCAG ratio against that variant's editor background)
| Role | Minimum |
|---|---|
| Default text, strings, keywords, functions, types, constants, operators, properties | 4.5 |
| Comments | 4.0 (recessive, but readable) |
| Line numbers, inactive tabs, status text | 3.0 |
| Selection and find highlights against text | must keep the selected text at 4.5 |
| Error / warning / info foregrounds | 4.5 |

## Layout
```
src/palette.json            colors (source of truth, Venom + functional additions)
src/tokens.mjs              TextMate and semantic token rules (role -> scopes, font style)
src/workbench.mjs           UI color keys (role -> VS Code workbench color ids)
scripts/build.mjs           reads the above, lifts low-contrast colors, writes themes/*.json and DECISIONS.md
scripts/check.mjs           contrast report, schema and coverage checks (also run by tests)
themes/benom-color-theme.json
themes/benom-alt-color-theme.json
test/*.test.mjs             node:test suites (no dependencies)
samples/                    short real files in py, ts, tsx, rs, go, json, md, sh, css, html, sql, yaml
package.json                extension manifest + npm scripts
README.md  CHANGELOG.md  LICENSE  NOTICE  icon.png  DECISIONS.md  docs/PUBLISHING.md
.github/workflows/          ci.yml (test and package) and release.yml (publish on tag)
```
Toolchain: Node 20+, ES modules, **zero runtime dependencies**. Dev dependencies only for packaging
(`@vscode/vsce`, `ovsx`) and the token coverage audit (`vscode-textmate`, `vscode-oniguruma`, `tm-grammars`).

## What the build produces
- `colors` (workbench): editor, sidebar, activity bar, tabs, status bar, title bar, panel, terminal
  (all 16 ANSI colors from Venom's colormap), input, list, tree, scrollbar, minimap, breadcrumbs, peek,
  merge conflict, diff editor, git decorations, notifications, menus, widgets, bracket pair colors,
  indent guides, find and selection highlights, inlay hints, debug toolbar, chat/agent panels if present.
- `tokenColors` (TextMate): comments, strings, escapes, numbers, constants, keywords, storage, operators,
  punctuation, functions, methods, parameters, variables, properties, types, classes, interfaces, decorators,
  tags and attributes (html, jsx), CSS properties and values, JSON keys, Markdown headings/links/code,
  regex, diff, invalid.
- `semanticTokenColors` + `semanticHighlighting: true`: type, class, interface, enum, function, method,
  parameter, property, variable (readonly, declaration), namespace, decorator, macro, keyword.
- Font style rules: comments italic; keywords and storage plain; types bold only if it helps tell them from
  keywords in the samples; decide by looking at the samples, record the choice in DECISIONS.md.

## Packaging
- `package.json`: `name` benom, `displayName` Benom, `publisher` placeholder `fa137` (must equal the owner's
  Marketplace publisher id; documented), `engines.vscode` `^1.85.0`, `categories` `["Themes"]`,
  `galleryBanner` `{ "color": "#000000", "theme": "dark" }`, `contributes.themes` with both variants
  (`uiTheme` `vs-dark`), `repository`, `bugs`, `homepage`, `license` `Apache-2.0`, `keywords`, `icon`.
- `icon.png` 128x128, generated by a script (no binary editing by hand).
- `.vscodeignore` ships only themes, icon, README, CHANGELOG, LICENSE, NOTICE and package.json.
- `README.md` for the Marketplace page: what it is, both variants, install, credit to Venom, screenshots
  from `docs/images/` (added later), a rule that no remote images are required to read it.
- Scripts: `npm run build`, `npm test`, `npm run check`, `npm run package` (produces the `.vsix`),
  `npm run publish:vsce`, `npm run publish:ovsx`.

## Publishing automation
- `ci.yml`: on push and pull request: install, build, assert the generated themes are committed
  (no drift), test, package, upload the `.vsix` as an artifact.
- `release.yml`: on a tag `v*`: do all of the above, create a GitHub Release with the `.vsix`, then publish
  to the Marketplace if the secret `VSCE_PAT` exists and to Open VSX if `OVSX_PAT` exists. Missing secrets
  skip that step with a clear message, they do not fail the release.
- The owner does these one-time steps by hand (documented in `docs/PUBLISHING.md`): create a Marketplace
  publisher, create the PAT (Azure DevOps, scope Marketplace Manage), add repository secrets, tag `v0.1.0`.

## Quality gates (all automated)
1. Both themes parse as JSON and every color is a valid hex value (6 or 8 digits).
2. Contrast targets above hold for every role on both variants.
3. Every workbench key used is a real VS Code color id (checked against a committed list in
   `test/known-colors.json`); no key appears twice.
4. Token coverage audit: tokenize every file in `samples/` with the real VS Code TextMate grammars
   and assert that no token a human would recolor falls through to the default foreground (keywords,
   strings, numbers, functions, types, comments, properties, tags, attributes, operators).
5. Build is deterministic: running it twice produces identical files.
6. `vsce package` succeeds and the `.vsix` contains exactly the intended files.
7. Visual check by the coordinator: install the `.vsix` in VS Code and review each sample at normal size.

## Work breakdown (each item is one job for the AI stack, pushed to `main`)
1. **Core theme**: palette, token/workbench rules, build script, generated themes, tests 1, 2, 3, 5.
2. **Packaging and docs**: manifest, icon generator, `.vscodeignore`, README, CHANGELOG, PUBLISHING.md,
   samples, `vsce package` check (gate 6).
3. **Coverage audit and polish**: gate 4, fixes found by it, final DECISIONS.md.
Then the coordinator adds the CI and release workflows (the bot's token cannot write workflow files),
reviews the result visually (gate 7), and records screenshots.

## Out of scope
Light variants, icon themes, and any new syntax hue beyond Venom.
