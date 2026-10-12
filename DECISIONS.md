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

The base variant uses `editor.background` `#000000`; the alt variant
uses `#211816` (the source's `alt_bg`). Every color is derived per
variant from that variant's background, so nothing is invisible on the
brown background.

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
  mix(variantBackground, foreground, t) with t per role (see the
  generated table). Gate: vs its variant background between 1.0:1
  and 2.0:1, and editor.foreground on it at least 4.5:1.
- **line** — borders, indent guides, rulers, whitespace dots, tree
  indent stroke. Derived as mix(variantBackground, foreground, t).
  Gate: vs its variant background between 1.0:1 and 3.0:1.
- **chrome** — activity bar, title bar, status bar. Derived as
  mix(variantBackground, #000000, 0.25). On the base variant this
  is still #000000; on the alt variant it is #191211, so the
  chrome is a step darker than the brown editor instead of pure
  black beside it.
- **area** — large areas (editor, sidebar, panel, terminal,
  inactive tab, widgets, active tab, breadcrumbs). The variant
  background itself.
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
The base variant uses t=0.09 for the line highlight (about #111111):
the default t=0.05 yields #0a0a0a, which is invisible on black.
The alt variant keeps t=0.05 for the line highlight.

## Alt variant layout

The editor and every large area (sideBar, panel, terminal,
tab.inactive, widgets) use #211816. The activityBar, titleBar and
statusBar use mix(#211816, #000000, 0.25) = #191211. The active
tab and breadcrumbs use the editor color. The base variant keeps
#000000 everywhere and separates areas with line-class borders.

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
| editorLineNumber.foreground | base | #505050 | #5a5a5a | 3.04:1 |
| editorInlayHint.foreground | base | #505050 | #5a5a5a | 3.04:1 |
| activityBar.inactiveForeground | base | #505050 | #5a5a5a | 3.04:1 |
| titleBar.inactiveForeground | base | #505050 | #5a5a5a | 3.04:1 |
| statusBar.noFolderForeground | base | #505050 | #5a5a5a | 3.04:1 |
| tab.inactiveForeground | base | #505050 | #5a5a5a | 3.04:1 |
| tab.unfocusedActiveForeground | base | #505050 | #5a5a5a | 3.04:1 |
| tab.unfocusedInactiveForeground | base | #505050 | #5a5a5a | 3.04:1 |
| panelTitle.inactiveForeground | base | #505050 | #5a5a5a | 3.04:1 |
| input.placeholderForeground | base | #505050 | #5a5a5a | 3.04:1 |
| gitDecoration.ignoredResourceForeground | base | #505050 | #5a5a5a | 3.04:1 |
| debugIcon.breakpointDisabledForeground | base | #505050 | #5a5a5a | 3.04:1 |
| descriptionForeground | base | #505050 | #5a5a5a | 3.04:1 |
| comment | base | #505050 | #6f6f6f | 4.18:1 |
| semantic:comment | base | #505050 | #6f6f6f | 4.18:1 |
| editorLineNumber.foreground | alt | #505050 | #676767 | 3.08:1 |
| editorBracketHighlight.foreground3 | alt | #5f8787 | #618a8a | 4.57:1 |
| editorInlayHint.foreground | alt | #505050 | #676767 | 3.08:1 |
| editorInfo.foreground | alt | #5f8787 | #618a8a | 4.57:1 |
| problemsInfoIcon.foreground | alt | #5f8787 | #618a8a | 4.57:1 |
| activityBar.inactiveForeground | alt | #505050 | #676767 | 3.08:1 |
| titleBar.inactiveForeground | alt | #505050 | #676767 | 3.08:1 |
| statusBar.noFolderForeground | alt | #505050 | #676767 | 3.08:1 |
| tab.inactiveForeground | alt | #505050 | #676767 | 3.08:1 |
| tab.unfocusedActiveForeground | alt | #505050 | #676767 | 3.08:1 |
| tab.unfocusedInactiveForeground | alt | #505050 | #676767 | 3.08:1 |
| panelTitle.inactiveForeground | alt | #505050 | #676767 | 3.08:1 |
| input.placeholderForeground | alt | #505050 | #676767 | 3.08:1 |
| gitDecoration.ignoredResourceForeground | alt | #505050 | #676767 | 3.08:1 |
| gitDecoration.submoduleResourceForeground | alt | #5f8787 | #618a8a | 4.57:1 |
| notificationsInfoIcon.foreground | alt | #5f8787 | #618a8a | 4.57:1 |
| debugIcon.breakpointDisabledForeground | alt | #505050 | #676767 | 3.08:1 |
| descriptionForeground | alt | #505050 | #676767 | 3.08:1 |
| comment | alt | #505050 | #7b7b7b | 4.11:1 |
| decorator | alt | #5f8787 | #618a8a | 4.57:1 |
| macro | alt | #5f8787 | #618a8a | 4.57:1 |
| attribute | alt | #5f8787 | #618a8a | 4.57:1 |
| cssProperty | alt | #5f8787 | #618a8a | 4.57:1 |
| jsonKey | alt | #5f8787 | #618a8a | 4.57:1 |
| semantic:decorator | alt | #5f8787 | #618a8a | 4.57:1 |
| semantic:macro | alt | #5f8787 | #618a8a | 4.57:1 |
| semantic:comment | alt | #505050 | #7b7b7b | 4.11:1 |

## Generated: derived surfaces, lines and chrome

Surfaces, lines and chrome are NOT lifted by text contrast. They are
derived as mix(variantBackground, foreground, t) (chrome mixes with
#000000). `t` is the mix factor; the ratio is against the variant
background, and "fg on color" is editor.foreground on that color.

| Role | Class | Variant | t | Color | vs background | fg on color |
|---|---|---|---|---|---|---|
| editor.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editor.lineHighlightBackground | surface | base | 0.09 | #111111 | 1.11:1 | 10.49:1 |
| editor.lineHighlightBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorRuler.foreground | line | base | 0.10 | #131313 | 1.13:1 |  |
| editorOverviewRuler.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorGroup.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorGroupHeader.tabsBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorGroupHeader.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorBracketMatch.background | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editorBracketMatch.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editor.selectionBackground | surface | base | 0.16 | #1f1f1f | 1.27:1 | 9.16:1 |
| editor.inactiveSelectionBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.findMatchBackground | surface | base | 0.22 | #2a2a2a | 1.46:1 | 7.97:1 |
| editor.findMatchHighlightBackground | surface | base | 0.12 | #171717 | 1.17:1 | 9.96:1 |
| editor.wordHighlightBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.wordHighlightStrongBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editorWhitespace.foreground | line | base | 0.18 | #232323 | 1.34:1 |  |
| editorIndentGuide.background | line | base | 0.08 | #0f0f0f | 1.10:1 |  |
| editorIndentGuide.activeBackground | line | base | 0.25 | #303030 | 1.59:1 |  |
| editor.foldBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| editor.rangeHighlightBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.findRangeHighlightBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.hoverHighlightBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.linkedEditingBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.snippetTabstopHighlightBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editor.snippetFinalTabstopHighlightBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editorWidget.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorHoverWidget.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorSuggestWidget.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorSuggestWidget.selectedBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| editorError.background | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editorWarning.background | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| editorInfo.background | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| sideBar.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| sideBarSectionHeader.background | surface | base | 0.06 | #0c0c0c | 1.07:1 | 10.87:1 |
| sideBar.dropBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| activityBar.background | chrome | base | 0.25 | #000000 | 1.00:1 |  |
| titleBar.activeBackground | chrome | base | 0.25 | #000000 | 1.00:1 |  |
| titleBar.inactiveBackground | chrome | base | 0.25 | #000000 | 1.00:1 |  |
| statusBar.background | chrome | base | 0.25 | #000000 | 1.00:1 |  |
| statusBar.noFolderBackground | chrome | base | 0.25 | #000000 | 1.00:1 |  |
| statusBar.debuggingBackground | chrome | base | 0.25 | #000000 | 1.00:1 |  |
| statusBarItem.activeBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| statusBarItem.hoverBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| statusBarItem.focusBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| tab.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| tab.activeBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| panel.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| input.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| dropdown.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| list.activeSelectionBackground | surface | base | 0.14 | #1b1b1b | 1.22:1 | 9.57:1 |
| list.inactiveSelectionBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| list.hoverBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| list.focusBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| list.dropBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| tree.indentGuidesStroke | line | base | 0.10 | #131313 | 1.13:1 |  |
| button.background | surface | base | 0.14 | #1b1b1b | 1.22:1 | 9.57:1 |
| button.hoverBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| button.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| checkbox.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| checkbox.selectBackground | surface | base | 0.14 | #1b1b1b | 1.22:1 | 9.57:1 |
| checkbox.selectBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| radio.inactiveBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| radio.activeBackground | surface | base | 0.14 | #1b1b1b | 1.22:1 | 9.57:1 |
| radio.activeBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| scrollbarSlider.background | surface | base | 0.12 | #171717 | 1.17:1 | 9.96:1 |
| scrollbarSlider.hoverBackground | surface | base | 0.18 | #232323 | 1.34:1 | 8.73:1 |
| scrollbarSlider.activeBackground | surface | base | 0.26 | #323232 | 1.64:1 | 7.12:1 |
| minimap.findMatchHighlight | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| minimap.selectionHighlight | surface | base | 0.16 | #1f1f1f | 1.27:1 | 9.16:1 |
| minimap.errorHighlight | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| minimap.warningHighlight | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| minimap.infoHighlight | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| peekViewResult.background | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| peekViewResult.matchHighlightBackground | surface | base | 0.12 | #171717 | 1.17:1 | 9.96:1 |
| peekViewResult.selectionBackground | surface | base | 0.14 | #1b1b1b | 1.22:1 | 9.57:1 |
| peekViewTitle.background | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| merge.currentHeaderBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| merge.currentContentBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| merge.incomingHeaderBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| merge.incomingContentBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| merge.commonHeaderBackground | surface | base | 0.10 | #131313 | 1.13:1 | 10.32:1 |
| merge.commonContentBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| merge.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| editorOverviewRuler.findMatchForeground | surface | base | 0.22 | #2a2a2a | 1.46:1 | 7.97:1 |
| editorOverviewRuler.selectionHighlightForeground | surface | base | 0.16 | #1f1f1f | 1.27:1 | 9.16:1 |
| diffEditor.insertedTextBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| diffEditor.removedTextBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| diffEditor.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| notifications.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| menu.selectionBackground | surface | base | 0.14 | #1b1b1b | 1.22:1 | 9.57:1 |
| menu.separatorBackground | line | base | 0.12 | #171717 | 1.17:1 |  |
| menu.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| widget.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| toolbar.hoverBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| debugToolBar.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| agentsChatInput.border | line | base | 0.12 | #171717 | 1.17:1 |  |
| chat.requestBackground | surface | base | 0.07 | #0e0e0e | 1.09:1 | 10.72:1 |
| chat.requestBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| focusBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| contrastBorder | line | base | 0.12 | #171717 | 1.17:1 |  |
| selection.background | surface | base | 0.16 | #1f1f1f | 1.27:1 | 9.16:1 |
| editor.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editor.lineHighlightBackground | surface | alt | 0.05 | #29201f | 1.09:1 | 8.83:1 |
| editor.lineHighlightBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorRuler.foreground | line | alt | 0.10 | #312927 | 1.22:1 |  |
| editorOverviewRuler.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorGroup.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorGroupHeader.tabsBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorGroupHeader.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorBracketMatch.background | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editorBracketMatch.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editor.selectionBackground | surface | alt | 0.16 | #3b3331 | 1.41:1 | 6.85:1 |
| editor.inactiveSelectionBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.findMatchBackground | surface | alt | 0.22 | #443d3c | 1.64:1 | 5.90:1 |
| editor.findMatchHighlightBackground | surface | alt | 0.12 | #342c2b | 1.28:1 | 7.57:1 |
| editor.wordHighlightBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.wordHighlightStrongBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editorWhitespace.foreground | line | alt | 0.18 | #3e3635 | 1.48:1 |  |
| editorIndentGuide.background | line | alt | 0.08 | #2e2624 | 1.18:1 |  |
| editorIndentGuide.activeBackground | line | alt | 0.25 | #494241 | 1.77:1 |  |
| editor.foldBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| editor.rangeHighlightBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.findRangeHighlightBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.hoverHighlightBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.linkedEditingBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.snippetTabstopHighlightBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editor.snippetFinalTabstopHighlightBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editorWidget.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorHoverWidget.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorSuggestWidget.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorSuggestWidget.selectedBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| editorError.background | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editorWarning.background | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| editorInfo.background | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| sideBar.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| sideBarSectionHeader.background | surface | alt | 0.06 | #2b2220 | 1.12:1 | 8.63:1 |
| sideBar.dropBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| activityBar.background | chrome | alt | 0.25 | #191211 | 1.06:1 |  |
| titleBar.activeBackground | chrome | alt | 0.25 | #191211 | 1.06:1 |  |
| titleBar.inactiveBackground | chrome | alt | 0.25 | #191211 | 1.06:1 |  |
| statusBar.background | chrome | alt | 0.25 | #191211 | 1.06:1 |  |
| statusBar.noFolderBackground | chrome | alt | 0.25 | #191211 | 1.06:1 |  |
| statusBar.debuggingBackground | chrome | alt | 0.25 | #191211 | 1.06:1 |  |
| statusBarItem.activeBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| statusBarItem.hoverBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| statusBarItem.focusBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| tab.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| tab.activeBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| panel.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| input.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| dropdown.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| list.activeSelectionBackground | surface | alt | 0.14 | #37302e | 1.35:1 | 7.18:1 |
| list.inactiveSelectionBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| list.hoverBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| list.focusBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| list.dropBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| tree.indentGuidesStroke | line | alt | 0.10 | #312927 | 1.22:1 |  |
| button.background | surface | alt | 0.14 | #37302e | 1.35:1 | 7.18:1 |
| button.hoverBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| button.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| checkbox.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| checkbox.selectBackground | surface | alt | 0.14 | #37302e | 1.35:1 | 7.18:1 |
| checkbox.selectBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| radio.inactiveBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| radio.activeBackground | surface | alt | 0.14 | #37302e | 1.35:1 | 7.18:1 |
| radio.activeBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| scrollbarSlider.background | surface | alt | 0.12 | #342c2b | 1.28:1 | 7.57:1 |
| scrollbarSlider.hoverBackground | surface | alt | 0.18 | #3e3635 | 1.48:1 | 6.54:1 |
| scrollbarSlider.activeBackground | surface | alt | 0.26 | #4b4442 | 1.83:1 | 5.29:1 |
| minimap.findMatchHighlight | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| minimap.selectionHighlight | surface | alt | 0.16 | #3b3331 | 1.41:1 | 6.85:1 |
| minimap.errorHighlight | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| minimap.warningHighlight | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| minimap.infoHighlight | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| peekViewResult.background | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| peekViewResult.matchHighlightBackground | surface | alt | 0.12 | #342c2b | 1.28:1 | 7.57:1 |
| peekViewResult.selectionBackground | surface | alt | 0.14 | #37302e | 1.35:1 | 7.18:1 |
| peekViewTitle.background | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| merge.currentHeaderBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| merge.currentContentBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| merge.incomingHeaderBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| merge.incomingContentBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| merge.commonHeaderBackground | surface | alt | 0.10 | #312927 | 1.22:1 | 7.90:1 |
| merge.commonContentBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| merge.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| editorOverviewRuler.findMatchForeground | surface | alt | 0.22 | #443d3c | 1.64:1 | 5.90:1 |
| editorOverviewRuler.selectionHighlightForeground | surface | alt | 0.16 | #3b3331 | 1.41:1 | 6.85:1 |
| diffEditor.insertedTextBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| diffEditor.removedTextBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| diffEditor.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| notifications.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| menu.selectionBackground | surface | alt | 0.14 | #37302e | 1.35:1 | 7.18:1 |
| menu.separatorBackground | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| menu.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| widget.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| toolbar.hoverBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| debugToolBar.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| agentsChatInput.border | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| chat.requestBackground | surface | alt | 0.07 | #2c2422 | 1.15:1 | 8.44:1 |
| chat.requestBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| focusBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| contrastBorder | line | alt | 0.12 | #342c2b | 1.28:1 |  |
| selection.background | surface | alt | 0.16 | #3b3331 | 1.41:1 | 6.85:1 |

<!-- benom:generated:end -->
