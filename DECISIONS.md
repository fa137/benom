# Benom: decisions

Hand-authored decisions live above and below the generated section. The
generated section (between the `benom:generated` markers) is rewritten by
`npm run build` and lists every color the build lifted, with its before
value, after value and resulting contrast ratio.

## Palette fidelity

The palette is taken from Venom (black-metal-theme-neovim) without
editing values to fix contrast. The build lifts any color below its
contrast target to the nearest lighter shade of the same hue (HSL
lightness stepping, hue and saturation fixed). This keeps the theme
faithful to Venom while making every role readable.

## Variants

Each variant has two backgrounds. The editor-area background is
shifted from the original Venom background: `#1a1a1a` on base
(10% lighter than `#000000`), `#1e1614` on alt (8% darker than
`#211816`, the source's `alt_bg`). The UI chrome (sideBar, panel,
terminal, title bar, status bar, widgets, inputs, dropdowns, menus,
notifications) is shifted the same way (2% lighter on base, 40%
darker on alt): `#050505` on base, `#140e0d` on alt. Every other
color is derived per variant from the background the role sits on,
so nothing is invisible on the brown background.

## Color classes

Each workbench key has a class that says how its color is derived
(round 1 review):

- **text** — foreground colors. Lifted by contrast against the
  surface they sit on (`against`) or the variant background.
  Targets: 4.5 default, 4.0 comments, 3.0 secondary/inactive text
  (line numbers, inactive tabs and titles, placeholders, inlay
  hints, whitespace-free labels).
- **surface** — hover, selection, line highlight, word highlight,
  find match, widget and section header backgrounds, list
  selection/hover/focus, scrollbar sliders, button surfaces, peek
  and merge backgrounds. NEVER lifted by text contrast. Derived as
  mix(background, foreground, t) with t per role (see the generated
  table), where background is the editor-area background for editor
  roles and the UI background for UI roles. Gate: vs its background
  between 1.0:1 and 2.0:1, and editor.foreground on it at least 4.5:1.
- **line** — borders, indent guides, rulers, whitespace dots, tree
  indent stroke. Derived as mix(background, foreground, t), same
  background split. Gate: vs its background between 1.0:1 and 3.0:1.
- **chrome** — activity bar, title bar, status bar. Derived as
  mix(uiBackground, #000000, 0.25). On the base variant this is
  #040404; on the alt variant it is #0f0b0a, so the chrome is a
  step darker than the brown UI instead of pure black beside it.
- **area** — large areas. Editor-only areas (editor canvas, gutter,
  empty editor group, active tab, breadcrumbs, peek editor, inlay
  hints, diff diagonal fill) use the 5%-shifted editor background;
  every other area (sidebar, panel, terminal, inactive tabs,
  widgets) use the UI background.
- **accent** — colored accents (red/teal borders, badges, diff
  markers, terminal ANSI). The palette color, used as-is for
  fidelity; not gated by contrast.

The mix foreground is Venom's `fg` (#c1c1c1). Because the mix
factors are small (0.05-0.26), surfaces and lines stay quiet
(1.0-1.9:1 against the background) instead of the loud grey wall
that lifting them to a text-contrast target produced. The smallest
steps land just above 1.0:1 on the pure-black base variant because
black has zero luminance; that is the first visible step above the
background and is still far below the 3.0:1 loudness threshold.
The base variant uses t=0.09 for the line highlight (about #292929 on
the #1a1a1a editor background): the default t=0.05 yields #222222,
which is nearly invisible on it.
The alt variant keeps t=0.05 for the line highlight.

## Variant layout

The editor canvas and editor-only areas (gutter, empty editor group,
active tab, breadcrumbs, peek editor, inlay hints, diff diagonal fill)
use the shifted editor background (#1a1a1a base, #1e1614 alt).
The sideBar, panel, terminal, inactive tabs and widgets use the UI
background, shifted the same way (2% lighter on base, 40% darker on
alt: #050505 base, #140e0d alt). The activityBar, titleBar and
statusBar use mix(uiBackground, #000000, 0.25): #040404 on base,
#0f0b0a on alt.

## Font style separation

Token kinds are separated by font style, not by hue, per
docs/ARCHITECTURE.md Principle 1. Comments and decorators are italic;
Markdown headings and bold markup are bold; keywords, storage, types,
functions and variables are plain. Types use Venom's single red hue and
are kept plain by default; bold is applied only to Markdown headings
where it aids scanning, and this choice is recorded here per the
architecture's "decide by looking at the samples" rule (samples are
added in work item 2, so the default of plain types stands).

## Functional additions

The only hues added to the palette are the functional additions
(`error`, `warning`, `info`, `added`, `modified`, `removed`), used for
diagnostics, diff and git only, never for syntax. In tokenColors the
diff roles (`diffAdded`, `diffRemoved`, `diffModified`, `invalid`) use
these hues because a diff is a functional surface, not a syntax one.

## Token coverage audit (work item 3, 2026-10-12)

Gate 4 tokenizes every file in `samples/` with the real VS Code
TextMate grammars (tm-grammars) and asserts that no token a human
would recolor falls through to the default foreground. The audit
(`npm run audit`) and the gate-4 test (`test/coverage.test.mjs`)
share one tokenizer module (`scripts/tokenize.mjs`) that also
reimplements VS Code's longest-scope-match rule resolution.

### Identifiers equal plain text; keys and attributes use teal

Identifiers are meant to read as plain text, so the Venom `property` grey
(`#c1c1c1`, the default foreground) is used on purpose for `variable`,
`parameter`, generic `property` (object properties and literal keys) and
`cssValue`. Gate 4 exempts them. An earlier revision recolored them to the
`constant` grey (`#aaaaaa`) to satisfy a too-strict test; that made variables
look identical to numbers and constants, so it was reverted. Instead:

- `jsonKey`, `attribute` (HTML and JSX attribute names) and `cssProperty` use
  the palette's teal accent (`alt`, `#5f8787`, lifted by the build where it is
  below contrast). Keys and attribute names then stand apart from values and
  from plain text without adding a hue.
- CSS units (`px`, `rem`, `%`) use the number grey, so they stay attached to
  their number (`cssUnit`).
- YAML keys stay red because the YAML grammar scopes them as tags.

### Documented exceptions

- **constant and number share `#aaaaaa`.** By Venom design the
  `constant` and `number` palette values are the same grey, so the
  `constant.numeric` primary rule and the `constant` primary rule
  are the same color+font-style pair. The gate-4 distinctness
  assertion therefore checks that the six primary rules produce at
  least 4 distinct pairs, not that all six are unique.
- **"At least 8 distinct colors or styles" is applied to the
  sample set, not to each file.** A minimal language such as JSON
  natively exercises only a few token kinds (keys, strings,
  numbers, punctuation), so a per-file bar of 8 is unreachable for
  it; the sample set as a whole exercises well over 8.
- **Structural `meta.*` / `source.*` scopes may resolve to the
  default foreground.** These are containers, not tokens a human
  would recolor, so they are out of scope for gate 4.

<!-- benom:generated:start -->

## Generated: lifted text colors

This section is generated by `npm run build`. Do not edit by hand.
Every color below was below its contrast target against the variant
background (or the surface it sits on) and was lifted to the nearest
lighter shade of the same hue.

| Role | Variant | Before | After | Contrast ratio |
|---|---|---|---|---|
| editorLineNumber.foreground | base | #505050 | #676767 | 3.08:1 |
| editorBracketHighlight.foreground3 | base | #5f8787 | #618a8a | 4.57:1 |
| editorInlayHint.foreground | base | #505050 | #676767 | 3.08:1 |
| editorInfo.foreground | base | #5f8787 | #618a8a | 4.57:1 |
| problemsInfoIcon.foreground | base | #5f8787 | #618a8a | 4.57:1 |
| activityBar.inactiveForeground | base | #505050 | #676767 | 3.08:1 |
| titleBar.inactiveForeground | base | #505050 | #676767 | 3.08:1 |
| statusBar.noFolderForeground | base | #505050 | #676767 | 3.08:1 |
| tab.inactiveForeground | base | #505050 | #676767 | 3.08:1 |
| tab.unfocusedActiveForeground | base | #505050 | #676767 | 3.08:1 |
| tab.unfocusedInactiveForeground | base | #505050 | #676767 | 3.08:1 |
| panelTitle.inactiveForeground | base | #505050 | #676767 | 3.08:1 |
| input.placeholderForeground | base | #505050 | #676767 | 3.08:1 |
| gitDecoration.ignoredResourceForeground | base | #505050 | #676767 | 3.08:1 |
| gitDecoration.submoduleResourceForeground | base | #5f8787 | #618a8a | 4.57:1 |
| notificationsInfoIcon.foreground | base | #5f8787 | #618a8a | 4.57:1 |
| debugIcon.breakpointDisabledForeground | base | #505050 | #676767 | 3.08:1 |
| descriptionForeground | base | #505050 | #676767 | 3.08:1 |
| comment | base | #505050 | #7b7b7b | 4.11:1 |
| decorator | base | #5f8787 | #618a8a | 4.57:1 |
| macro | base | #5f8787 | #618a8a | 4.57:1 |
| attribute | base | #5f8787 | #618a8a | 4.57:1 |
| cssProperty | base | #5f8787 | #618a8a | 4.57:1 |
| jsonKey | base | #5f8787 | #618a8a | 4.57:1 |
| semantic:decorator | base | #5f8787 | #618a8a | 4.57:1 |
| semantic:macro | base | #5f8787 | #618a8a | 4.57:1 |
| semantic:comment | base | #505050 | #7b7b7b | 4.11:1 |
| editorLineNumber.foreground | alt | #505050 | #646464 | 3.01:1 |
| editorBracketHighlight.foreground3 | alt | #5f8787 | #618a8a | 4.67:1 |
| editorInlayHint.foreground | alt | #505050 | #646464 | 3.01:1 |
| editorInfo.foreground | alt | #5f8787 | #618a8a | 4.67:1 |
| problemsInfoIcon.foreground | alt | #5f8787 | #618a8a | 4.67:1 |
| activityBar.inactiveForeground | alt | #505050 | #646464 | 3.01:1 |
| titleBar.inactiveForeground | alt | #505050 | #646464 | 3.01:1 |
| statusBar.noFolderForeground | alt | #505050 | #646464 | 3.01:1 |
| tab.inactiveForeground | alt | #505050 | #646464 | 3.01:1 |
| tab.unfocusedActiveForeground | alt | #505050 | #646464 | 3.01:1 |
| tab.unfocusedInactiveForeground | alt | #505050 | #646464 | 3.01:1 |
| panelTitle.inactiveForeground | alt | #505050 | #646464 | 3.01:1 |
| input.placeholderForeground | alt | #505050 | #646464 | 3.01:1 |
| gitDecoration.ignoredResourceForeground | alt | #505050 | #646464 | 3.01:1 |
| gitDecoration.submoduleResourceForeground | alt | #5f8787 | #618a8a | 4.67:1 |
| notificationsInfoIcon.foreground | alt | #5f8787 | #618a8a | 4.67:1 |
| debugIcon.breakpointDisabledForeground | alt | #505050 | #646464 | 3.01:1 |
| descriptionForeground | alt | #505050 | #646464 | 3.01:1 |
| comment | alt | #505050 | #797979 | 4.09:1 |
| decorator | alt | #5f8787 | #618a8a | 4.67:1 |
| macro | alt | #5f8787 | #618a8a | 4.67:1 |
| attribute | alt | #5f8787 | #618a8a | 4.67:1 |
| cssProperty | alt | #5f8787 | #618a8a | 4.67:1 |
| jsonKey | alt | #5f8787 | #618a8a | 4.67:1 |
| semantic:decorator | alt | #5f8787 | #618a8a | 4.67:1 |
| semantic:macro | alt | #5f8787 | #618a8a | 4.67:1 |
| semantic:comment | alt | #505050 | #797979 | 4.09:1 |

## Generated: derived surfaces, lines and chrome

Surfaces, lines and chrome are NOT lifted by text contrast. They are
derived as mix(variantBackground, foreground, t) (chrome mixes with
#000000). `t` is the mix factor; the ratio is against the variant
background, and "fg on color" is editor.foreground on that color.

| Role | Class | Variant | t | Color | vs background | fg on color |
|---|---|---|---|---|---|---|
| editor.border | line | base | 0.12 | #2e2e2e | 1.28:1 |  |
| editor.lineHighlightBackground | surface | base | 0.09 | #292929 | 1.20:1 | 8.08:1 |
| editor.lineHighlightBorder | line | base | 0.12 | #2e2e2e | 1.28:1 |  |
| editorRuler.foreground | line | base | 0.10 | #181818 | 1.15:1 |  |
| editorOverviewRuler.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorGroup.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorGroupHeader.tabsBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorGroupHeader.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorBracketMatch.background | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| editorBracketMatch.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editor.selectionBackground | surface | base | 0.16 | #353535 | 1.42:1 | 6.81:1 |
| editor.inactiveSelectionBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.findMatchBackground | surface | base | 0.22 | #3f3f3f | 1.65:1 | 5.85:1 |
| editor.findMatchHighlightBackground | surface | base | 0.12 | #2e2e2e | 1.28:1 | 7.54:1 |
| editor.wordHighlightBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.wordHighlightStrongBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editorWhitespace.foreground | line | base | 0.18 | #272727 | 1.36:1 |  |
| editorIndentGuide.background | line | base | 0.08 | #141414 | 1.11:1 |  |
| editorIndentGuide.activeBackground | line | base | 0.25 | #343434 | 1.64:1 |  |
| editor.foldBackground | surface | base | 0.07 | #262626 | 1.15:1 | 8.41:1 |
| editor.rangeHighlightBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.findRangeHighlightBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.hoverHighlightBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.linkedEditingBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.snippetTabstopHighlightBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editor.snippetFinalTabstopHighlightBackground | surface | base | 0.10 | #2b2b2b | 1.23:1 | 7.87:1 |
| editorWidget.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorHoverWidget.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorSuggestWidget.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorSuggestWidget.selectedBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| editorError.background | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| editorWarning.background | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| editorInfo.background | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| sideBar.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| sideBarSectionHeader.background | surface | base | 0.06 | #101010 | 1.07:1 | 10.57:1 |
| sideBar.dropBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| activityBar.background | chrome | base | 0.25 | #040404 | 1.01:1 |  |
| titleBar.activeBackground | chrome | base | 0.25 | #040404 | 1.01:1 |  |
| titleBar.inactiveBackground | chrome | base | 0.25 | #040404 | 1.01:1 |  |
| statusBar.background | chrome | base | 0.25 | #040404 | 1.01:1 |  |
| statusBar.noFolderBackground | chrome | base | 0.25 | #040404 | 1.01:1 |  |
| statusBar.debuggingBackground | chrome | base | 0.25 | #040404 | 1.01:1 |  |
| statusBarItem.activeBackground | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| statusBarItem.hoverBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| statusBarItem.focusBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| tab.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| tab.activeBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| panel.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| input.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| dropdown.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| list.activeSelectionBackground | surface | base | 0.14 | #1f1f1f | 1.24:1 | 9.16:1 |
| list.inactiveSelectionBackground | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| list.hoverBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| list.focusBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| list.dropBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| tree.indentGuidesStroke | line | base | 0.10 | #181818 | 1.15:1 |  |
| button.background | surface | base | 0.14 | #1f1f1f | 1.24:1 | 9.16:1 |
| button.hoverBackground | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| button.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| checkbox.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| checkbox.selectBackground | surface | base | 0.14 | #1f1f1f | 1.24:1 | 9.16:1 |
| checkbox.selectBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| radio.inactiveBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| radio.activeBackground | surface | base | 0.14 | #1f1f1f | 1.24:1 | 9.16:1 |
| radio.activeBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| scrollbarSlider.background | surface | base | 0.12 | #1c1c1c | 1.20:1 | 9.47:1 |
| scrollbarSlider.hoverBackground | surface | base | 0.18 | #272727 | 1.36:1 | 8.30:1 |
| scrollbarSlider.activeBackground | surface | base | 0.26 | #363636 | 1.69:1 | 6.71:1 |
| minimap.findMatchHighlight | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| minimap.selectionHighlight | surface | base | 0.16 | #232323 | 1.30:1 | 8.73:1 |
| minimap.errorHighlight | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| minimap.warningHighlight | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| minimap.infoHighlight | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| peekViewResult.background | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| peekViewResult.matchHighlightBackground | surface | base | 0.12 | #1c1c1c | 1.20:1 | 9.47:1 |
| peekViewResult.selectionBackground | surface | base | 0.14 | #1f1f1f | 1.24:1 | 9.16:1 |
| peekViewTitle.background | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| merge.currentHeaderBackground | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| merge.currentContentBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| merge.incomingHeaderBackground | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| merge.incomingContentBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| merge.commonHeaderBackground | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| merge.commonContentBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| merge.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorOverviewRuler.findMatchForeground | surface | base | 0.22 | #2e2e2e | 1.50:1 | 7.54:1 |
| editorOverviewRuler.selectionHighlightForeground | surface | base | 0.16 | #232323 | 1.30:1 | 8.73:1 |
| diffEditor.insertedTextBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| diffEditor.removedTextBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| diffEditor.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| notifications.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| menu.selectionBackground | surface | base | 0.14 | #1f1f1f | 1.24:1 | 9.16:1 |
| menu.separatorBackground | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| menu.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| widget.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| toolbar.hoverBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| debugToolBar.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| agentsChatInput.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| chat.requestBackground | surface | base | 0.07 | #121212 | 1.09:1 | 10.41:1 |
| chat.requestBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| focusBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| contrastBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| selection.background | surface | base | 0.16 | #232323 | 1.30:1 | 8.73:1 |
| editor.border | line | alt | 0.12 | #322b29 | 1.28:1 |  |
| editor.lineHighlightBackground | surface | alt | 0.05 | #261f1d | 1.10:1 | 9.00:1 |
| editor.lineHighlightBorder | line | alt | 0.12 | #322b29 | 1.28:1 |  |
| editorRuler.foreground | line | alt | 0.10 | #25201f | 1.19:1 |  |
| editorOverviewRuler.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorGroup.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorGroupHeader.tabsBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorGroupHeader.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorBracketMatch.background | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| editorBracketMatch.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editor.selectionBackground | surface | alt | 0.16 | #383130 | 1.40:1 | 7.07:1 |
| editor.inactiveSelectionBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.findMatchBackground | surface | alt | 0.22 | #423c3a | 1.64:1 | 6.02:1 |
| editor.findMatchHighlightBackground | surface | alt | 0.12 | #322b29 | 1.28:1 | 7.71:1 |
| editor.wordHighlightBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.wordHighlightStrongBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editorWhitespace.foreground | line | alt | 0.18 | #332e2d | 1.43:1 |  |
| editorIndentGuide.background | line | alt | 0.08 | #221c1b | 1.14:1 |  |
| editorIndentGuide.activeBackground | line | alt | 0.25 | #3f3b3a | 1.73:1 |  |
| editor.foldBackground | surface | alt | 0.07 | #292220 | 1.14:1 | 8.68:1 |
| editor.rangeHighlightBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.findRangeHighlightBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.hoverHighlightBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.linkedEditingBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.snippetTabstopHighlightBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editor.snippetFinalTabstopHighlightBackground | surface | alt | 0.10 | #2e2725 | 1.21:1 | 8.14:1 |
| editorWidget.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorHoverWidget.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorSuggestWidget.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorSuggestWidget.selectedBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| editorError.background | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| editorWarning.background | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| editorInfo.background | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| sideBar.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| sideBarSectionHeader.background | surface | alt | 0.06 | #1e1918 | 1.10:1 | 9.66:1 |
| sideBar.dropBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| activityBar.background | chrome | alt | 0.25 | #0f0b0a | 1.02:1 |  |
| titleBar.activeBackground | chrome | alt | 0.25 | #0f0b0a | 1.02:1 |  |
| titleBar.inactiveBackground | chrome | alt | 0.25 | #0f0b0a | 1.02:1 |  |
| statusBar.background | chrome | alt | 0.25 | #0f0b0a | 1.02:1 |  |
| statusBar.noFolderBackground | chrome | alt | 0.25 | #0f0b0a | 1.02:1 |  |
| statusBar.debuggingBackground | chrome | alt | 0.25 | #0f0b0a | 1.02:1 |  |
| statusBarItem.activeBackground | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| statusBarItem.hoverBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| statusBarItem.focusBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| tab.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| tab.activeBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| panel.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| input.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| dropdown.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| list.activeSelectionBackground | surface | alt | 0.14 | #2c2726 | 1.30:1 | 8.18:1 |
| list.inactiveSelectionBackground | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| list.hoverBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| list.focusBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| list.dropBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| tree.indentGuidesStroke | line | alt | 0.10 | #25201f | 1.19:1 |  |
| button.background | surface | alt | 0.14 | #2c2726 | 1.30:1 | 8.18:1 |
| button.hoverBackground | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| button.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| checkbox.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| checkbox.selectBackground | surface | alt | 0.14 | #2c2726 | 1.30:1 | 8.18:1 |
| checkbox.selectBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| radio.inactiveBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| radio.activeBackground | surface | alt | 0.14 | #2c2726 | 1.30:1 | 8.18:1 |
| radio.activeBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| scrollbarSlider.background | surface | alt | 0.12 | #292323 | 1.24:1 | 8.58:1 |
| scrollbarSlider.hoverBackground | surface | alt | 0.18 | #332e2d | 1.43:1 | 7.43:1 |
| scrollbarSlider.activeBackground | surface | alt | 0.26 | #413d3c | 1.78:1 | 5.96:1 |
| minimap.findMatchHighlight | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| minimap.selectionHighlight | surface | alt | 0.16 | #302b2a | 1.37:1 | 7.75:1 |
| minimap.errorHighlight | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| minimap.warningHighlight | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| minimap.infoHighlight | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| peekViewResult.background | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| peekViewResult.matchHighlightBackground | surface | alt | 0.12 | #292323 | 1.24:1 | 8.58:1 |
| peekViewResult.selectionBackground | surface | alt | 0.14 | #2c2726 | 1.30:1 | 8.18:1 |
| peekViewTitle.background | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| merge.currentHeaderBackground | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| merge.currentContentBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| merge.incomingHeaderBackground | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| merge.incomingContentBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| merge.commonHeaderBackground | surface | alt | 0.10 | #25201f | 1.19:1 | 8.94:1 |
| merge.commonContentBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| merge.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| editorOverviewRuler.findMatchForeground | surface | alt | 0.22 | #3a3535 | 1.58:1 | 6.70:1 |
| editorOverviewRuler.selectionHighlightForeground | surface | alt | 0.16 | #302b2a | 1.37:1 | 7.75:1 |
| diffEditor.insertedTextBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| diffEditor.removedTextBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| diffEditor.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| notifications.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| menu.selectionBackground | surface | alt | 0.14 | #2c2726 | 1.30:1 | 8.18:1 |
| menu.separatorBackground | line | alt | 0.12 | #292323 | 1.24:1 |  |
| menu.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| widget.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| toolbar.hoverBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| debugToolBar.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| agentsChatInput.border | line | alt | 0.12 | #292323 | 1.24:1 |  |
| chat.requestBackground | surface | alt | 0.07 | #201b1a | 1.12:1 | 9.46:1 |
| chat.requestBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| focusBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| contrastBorder | line | alt | 0.12 | #292323 | 1.24:1 |  |
| selection.background | surface | alt | 0.16 | #302b2a | 1.37:1 | 7.75:1 |

<!-- benom:generated:end -->
