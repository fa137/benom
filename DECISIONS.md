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
shifted from the original Venom background: `#191919` on base
(10% lighter, then 3% darker, than `#000000`), `#251e1d` on alt (23% darker, then 5%
lighter, than `#211816`, the source's `alt_bg`). The terminal
background is the editor-area background shifted darker — 50% on base
(`#0d0d0d`), 45% on alt (`#141110`) — giving the terminal its own
distinct surface. The UI chrome (sideBar, panel,
title bar, status bar, widgets, inputs, dropdowns, menus,
notifications) is shifted the same way (2% lighter on base, 80%
darker on alt): `#050505` on base, `#070504` on alt. Every other
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
  #040404; on the alt variant it is #050403, so the chrome is a
  step darker than the brown UI instead of pure black beside it.
- **area** — large areas. Editor-only areas (editor canvas, gutter,
  empty editor group, active tab, breadcrumbs, peek editor, inlay
  hints, diff diagonal fill) use the 5%-shifted editor background;
  every other area (sidebar, panel, inactive tabs, widgets) use the UI
  background; the terminal uses its own per-variant background.
- **tint** — diff text/line backgrounds inside the editor and the diff
  gutter line markers. The palette color mixed with the editor
  background (text 80% background, lines 90%, gutter 95%) so the editor
  foreground and line numbers keep their contrast on top: full-brightness
  red/green backgrounds made them nearly unreadable.
- **accent** — colored accents (red/teal borders, badges, diff
  markers, terminal ANSI). The palette color, used as-is for
  fidelity; not gated by contrast. Two exceptions: the tag role
  (HTML/XML tags, Venom's red `#FC302E`) is toned down by 25% in both
  variants (base `#BD2423`, alt `#BD2C2A` after the contrast lift) —
  the bright red reads as a harsh orange on the dark editor
  backgrounds; and terminal `ansiBlack` is derived from the variant's
  terminal background mixed 35% toward black when the terminal is light
  and toward the text color when it is dark (base `#4c4c4c` on `#0d0d0d`,
  alt `#514f4e` on `#141110`) — Venom's colormap black
  (`#211816`) is nearly invisible on dark terminal backgrounds. See
  ACCENT_DARKEN and the ANSI loop in build.mjs.

The mix foreground is Venom's `fg` (#c1c1c1). Because the mix
factors are small (0.05-0.26), surfaces and lines stay quiet
(1.0-1.9:1 against the background) instead of the loud grey wall
that lifting them to a text-contrast target produced. The smallest
steps land just above 1.0:1 on the pure-black base variant because
black has zero luminance; that is the first visible step above the
background and is still far below the 3.0:1 loudness threshold.
The base variant uses t=0.09 for the line highlight (about #282828 on
the #191919 editor background): the default t=0.05 yields #212121,
which is nearly invisible on it.
The alt variant uses t=0.09 as well (about #332d2c on the #251e1d
editor background): its dark canvas makes the default t=0.05
invisible there too.

## Variant layout

The editor canvas and editor-only areas (gutter, empty editor group,
active tab, breadcrumbs, peek editor, inlay hints, diff diagonal fill)
use the shifted editor background (#191919 base, #251e1d alt).
The terminal uses its own background, the editor background shifted
darker (50% on base: #0d0d0d, 45% on alt: #141110).
The sideBar, panel, inactive tabs and widgets use the UI
background, shifted the same way (2% lighter on base, 80% darker on
alt: #050505 base, #070504 alt). The activityBar, titleBar and
statusBar use mix(uiBackground, #000000, 0.25): #040404 on base,
#050403 on alt.

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
| editorLineNumber.foreground | base | #505050 | #676767 | 3.1:1 |
| editorBracketHighlight.foreground3 | base | #5f8787 | #618a8a | 4.6:1 |
| editorInlayHint.foreground | base | #505050 | #676767 | 3.1:1 |
| editorInfo.foreground | base | #5f8787 | #618a8a | 4.6:1 |
| problemsInfoIcon.foreground | base | #5f8787 | #618a8a | 4.6:1 |
| activityBar.inactiveForeground | base | #505050 | #676767 | 3.1:1 |
| titleBar.inactiveForeground | base | #505050 | #676767 | 3.1:1 |
| statusBar.noFolderForeground | base | #505050 | #676767 | 3.1:1 |
| tab.inactiveForeground | base | #505050 | #676767 | 3.1:1 |
| tab.unfocusedActiveForeground | base | #505050 | #676767 | 3.1:1 |
| tab.unfocusedInactiveForeground | base | #505050 | #676767 | 3.1:1 |
| panelTitle.inactiveForeground | base | #505050 | #676767 | 3.1:1 |
| input.placeholderForeground | base | #505050 | #676767 | 3.1:1 |
| gitDecoration.ignoredResourceForeground | base | #505050 | #676767 | 3.1:1 |
| gitDecoration.submoduleResourceForeground | base | #5f8787 | #618a8a | 4.6:1 |
| notificationsInfoIcon.foreground | base | #5f8787 | #618a8a | 4.6:1 |
| debugIcon.breakpointDisabledForeground | base | #505050 | #676767 | 3.1:1 |
| descriptionForeground | base | #505050 | #676767 | 3.1:1 |
| comment | base | #505050 | #797979 | 4.0:1 |
| decorator | base | #5f8787 | #618a8a | 4.6:1 |
| macro | base | #5f8787 | #618a8a | 4.6:1 |
| attribute | base | #5f8787 | #618a8a | 4.6:1 |
| cssProperty | base | #5f8787 | #618a8a | 4.6:1 |
| jsonKey | base | #5f8787 | #618a8a | 4.6:1 |
| semantic:decorator | base | #5f8787 | #618a8a | 4.6:1 |
| semantic:macro | base | #5f8787 | #618a8a | 4.6:1 |
| semantic:comment | base | #505050 | #797979 | 4.0:1 |
| editorLineNumber.foreground | alt | #505050 | #6a6a6a | 3.0:1 |
| editorBracketHighlight.foreground3 | alt | #5f8787 | #659090 | 4.6:1 |
| editorInlayHint.foreground | alt | #505050 | #6a6a6a | 3.0:1 |
| editorError.foreground | alt | #fc302e | #fc3a38 | 4.5:1 |
| editorInfo.foreground | alt | #5f8787 | #659090 | 4.6:1 |
| problemsErrorIcon.foreground | alt | #fc302e | #fc3a38 | 4.5:1 |
| problemsInfoIcon.foreground | alt | #5f8787 | #659090 | 4.6:1 |
| list.errorForeground | alt | #fc302e | #fc3a38 | 4.5:1 |
| activityBar.inactiveForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| titleBar.inactiveForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| statusBar.noFolderForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| tab.inactiveForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| tab.unfocusedActiveForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| tab.unfocusedInactiveForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| panelTitle.inactiveForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| input.placeholderForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| gitDecoration.deletedResourceForeground | alt | #fc302e | #fc3a38 | 4.5:1 |
| gitDecoration.ignoredResourceForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| gitDecoration.submoduleResourceForeground | alt | #5f8787 | #659090 | 4.6:1 |
| notificationsErrorIcon.foreground | alt | #fc302e | #fc3a38 | 4.5:1 |
| notificationsInfoIcon.foreground | alt | #5f8787 | #659090 | 4.6:1 |
| debugIcon.breakpointDisabledForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| descriptionForeground | alt | #505050 | #6a6a6a | 3.0:1 |
| errorForeground | alt | #fc302e | #fc3a38 | 4.5:1 |
| comment | alt | #505050 | #7e7e7e | 4.0:1 |
| type | alt | #fc302e | #fc3a38 | 4.5:1 |
| class | alt | #fc302e | #fc3a38 | 4.5:1 |
| interface | alt | #fc302e | #fc3a38 | 4.5:1 |
| enum | alt | #fc302e | #fc3a38 | 4.5:1 |
| namespace | alt | #fc302e | #fc3a38 | 4.5:1 |
| decorator | alt | #5f8787 | #659090 | 4.6:1 |
| macro | alt | #5f8787 | #659090 | 4.6:1 |
| tag | alt | #fc302e | #fc3a38 | 4.5:1 |
| attribute | alt | #5f8787 | #659090 | 4.6:1 |
| cssProperty | alt | #5f8787 | #659090 | 4.6:1 |
| jsonKey | alt | #5f8787 | #659090 | 4.6:1 |
| diffRemoved | alt | #fc302e | #fc3a38 | 4.5:1 |
| invalid | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:namespace | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:type | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:class | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:interface | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:enum | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:typeParameter | alt | #fc302e | #fc3a38 | 4.5:1 |
| semantic:decorator | alt | #5f8787 | #659090 | 4.6:1 |
| semantic:macro | alt | #5f8787 | #659090 | 4.6:1 |
| semantic:comment | alt | #505050 | #7e7e7e | 4.0:1 |

## Generated: derived surfaces, lines and chrome

Surfaces, lines and chrome are NOT lifted by text contrast. They are
derived as mix(variantBackground, foreground, t) (chrome mixes with
#000000). `t` is the mix factor; the ratio is against the variant
background, and "fg on color" is editor.foreground on that color.

| Role | Class | Variant | t | Color | vs background | fg on color |
|---|---|---|---|---|---|---|
| editor.border | line | base | 0.12 | #2d2d2d | 1.28:1 |  |
| editor.lineHighlightBackground | surface | base | 0.09 | #282828 | 1.19:1 | 8.19:1 |
| editor.lineHighlightBorder | line | base | 0.12 | #2d2d2d | 1.28:1 |  |
| editorRuler.foreground | line | base | 0.10 | #181818 | 1.15:1 |  |
| editorOverviewRuler.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorGroup.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorGroupHeader.tabsBorder | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorGroupHeader.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editorBracketMatch.background | surface | base | 0.10 | #181818 | 1.15:1 | 9.86:1 |
| editorBracketMatch.border | line | base | 0.12 | #1c1c1c | 1.20:1 |  |
| editor.selectionBackground | surface | base | 0.16 | #343434 | 1.41:1 | 6.92:1 |
| editor.inactiveSelectionBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.findMatchBackground | surface | base | 0.22 | #3e3e3e | 1.64:1 | 5.94:1 |
| editor.findMatchHighlightBackground | surface | base | 0.12 | #2d2d2d | 1.28:1 | 7.65:1 |
| editor.wordHighlightBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.wordHighlightStrongBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editorWhitespace.foreground | line | base | 0.18 | #272727 | 1.36:1 |  |
| editorIndentGuide.background | line | base | 0.08 | #141414 | 1.11:1 |  |
| editorIndentGuide.activeBackground | line | base | 0.25 | #343434 | 1.64:1 |  |
| editor.foldBackground | surface | base | 0.07 | #252525 | 1.15:1 | 8.51:1 |
| editor.rangeHighlightBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.findRangeHighlightBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.hoverHighlightBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.linkedEditingBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.snippetTabstopHighlightBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
| editor.snippetFinalTabstopHighlightBackground | surface | base | 0.10 | #2a2a2a | 1.22:1 | 7.97:1 |
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
| diffEditor.insertedTextBackground | tint | base | 0.80 | #2a312a | 1.32:1 | 7.42:1 |
| diffEditor.removedTextBackground | tint | base | 0.80 | #461e1d | 1.23:1 | 7.97:1 |
| diffEditor.insertedLineBackground | tint | base | 0.90 | #222522 | 1.14:1 | 8.60:1 |
| diffEditor.removedLineBackground | tint | base | 0.90 | #301b1b | 1.09:1 | 8.99:1 |
| diffEditorGutter.insertedLineBackground | tint | base | 0.95 | #1d1f1d | 1.06:1 | 9.21:1 |
| diffEditorGutter.removedLineBackground | tint | base | 0.95 | #241a1a | 1.04:1 | 9.43:1 |
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
| editor.border | line | alt | 0.12 | #383231 | 1.30:1 |  |
| editor.lineHighlightBackground | surface | alt | 0.09 | #332d2c | 1.21:1 | 7.51:1 |
| editor.lineHighlightBorder | line | alt | 0.12 | #383231 | 1.30:1 |  |
| editorRuler.foreground | line | alt | 0.10 | #1a1817 | 1.15:1 |  |
| editorOverviewRuler.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorGroup.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorGroupHeader.tabsBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorGroupHeader.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorBracketMatch.background | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| editorBracketMatch.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editor.selectionBackground | surface | alt | 0.16 | #3e3837 | 1.42:1 | 6.39:1 |
| editor.inactiveSelectionBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.findMatchBackground | surface | alt | 0.22 | #474241 | 1.66:1 | 5.49:1 |
| editor.findMatchHighlightBackground | surface | alt | 0.12 | #383231 | 1.30:1 | 6.99:1 |
| editor.wordHighlightBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.wordHighlightStrongBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editorWhitespace.foreground | line | alt | 0.18 | #282726 | 1.36:1 |  |
| editorIndentGuide.background | line | alt | 0.08 | #161413 | 1.11:1 |  |
| editorIndentGuide.activeBackground | line | alt | 0.25 | #363433 | 1.64:1 |  |
| editor.foldBackground | surface | alt | 0.07 | #302928 | 1.15:1 | 7.92:1 |
| editor.rangeHighlightBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.findRangeHighlightBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.hoverHighlightBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.linkedEditingBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.snippetTabstopHighlightBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editor.snippetFinalTabstopHighlightBackground | surface | alt | 0.10 | #352e2d | 1.23:1 | 7.38:1 |
| editorWidget.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorHoverWidget.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorSuggestWidget.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorSuggestWidget.selectedBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| editorError.background | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| editorWarning.background | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| editorInfo.background | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| sideBar.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| sideBarSectionHeader.background | surface | alt | 0.06 | #12100f | 1.07:1 | 10.54:1 |
| sideBar.dropBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| activityBar.background | chrome | alt | 0.25 | #050403 | 1.01:1 |  |
| titleBar.activeBackground | chrome | alt | 0.25 | #050403 | 1.01:1 |  |
| titleBar.inactiveBackground | chrome | alt | 0.25 | #050403 | 1.01:1 |  |
| statusBar.background | chrome | alt | 0.25 | #050403 | 1.01:1 |  |
| statusBar.noFolderBackground | chrome | alt | 0.25 | #050403 | 1.01:1 |  |
| statusBar.debuggingBackground | chrome | alt | 0.25 | #050403 | 1.01:1 |  |
| statusBarItem.activeBackground | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| statusBarItem.hoverBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| statusBarItem.focusBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| tab.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| tab.activeBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| panel.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| input.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| dropdown.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| list.activeSelectionBackground | surface | alt | 0.14 | #211f1e | 1.24:1 | 9.12:1 |
| list.inactiveSelectionBackground | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| list.hoverBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| list.focusBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| list.dropBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| tree.indentGuidesStroke | line | alt | 0.10 | #1a1817 | 1.15:1 |  |
| button.background | surface | alt | 0.14 | #211f1e | 1.24:1 | 9.12:1 |
| button.hoverBackground | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| button.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| checkbox.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| checkbox.selectBackground | surface | alt | 0.14 | #211f1e | 1.24:1 | 9.12:1 |
| checkbox.selectBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| radio.inactiveBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| radio.activeBackground | surface | alt | 0.14 | #211f1e | 1.24:1 | 9.12:1 |
| radio.activeBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| scrollbarSlider.background | surface | alt | 0.12 | #1d1c1b | 1.20:1 | 9.45:1 |
| scrollbarSlider.hoverBackground | surface | alt | 0.18 | #282726 | 1.36:1 | 8.28:1 |
| scrollbarSlider.activeBackground | surface | alt | 0.26 | #373635 | 1.69:1 | 6.70:1 |
| minimap.findMatchHighlight | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| minimap.selectionHighlight | surface | alt | 0.16 | #252322 | 1.30:1 | 8.69:1 |
| minimap.errorHighlight | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| minimap.warningHighlight | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| minimap.infoHighlight | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| peekViewResult.background | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| peekViewResult.matchHighlightBackground | surface | alt | 0.12 | #1d1c1b | 1.20:1 | 9.45:1 |
| peekViewResult.selectionBackground | surface | alt | 0.14 | #211f1e | 1.24:1 | 9.12:1 |
| peekViewTitle.background | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| merge.currentHeaderBackground | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| merge.currentContentBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| merge.incomingHeaderBackground | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| merge.incomingContentBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| merge.commonHeaderBackground | surface | alt | 0.10 | #1a1817 | 1.15:1 | 9.83:1 |
| merge.commonContentBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| merge.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| editorOverviewRuler.findMatchForeground | surface | alt | 0.22 | #302e2e | 1.51:1 | 7.50:1 |
| editorOverviewRuler.selectionHighlightForeground | surface | alt | 0.16 | #252322 | 1.30:1 | 8.69:1 |
| diffEditor.insertedTextBackground | tint | alt | 0.80 | #34352d | 1.32:1 | 6.89:1 |
| diffEditor.removedTextBackground | tint | alt | 0.80 | #502220 | 1.24:1 | 7.33:1 |
| diffEditor.insertedLineBackground | tint | alt | 0.90 | #2c2925 | 1.13:1 | 8.04:1 |
| diffEditor.removedLineBackground | tint | alt | 0.90 | #3b201f | 1.10:1 | 8.26:1 |
| diffEditorGutter.insertedLineBackground | tint | alt | 0.95 | #292421 | 1.07:1 | 8.52:1 |
| diffEditorGutter.removedLineBackground | tint | alt | 0.95 | #301f1e | 1.05:1 | 8.70:1 |
| diffEditor.insertedTextBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| diffEditor.removedTextBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| diffEditor.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| notifications.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| menu.selectionBackground | surface | alt | 0.14 | #211f1e | 1.24:1 | 9.12:1 |
| menu.separatorBackground | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| menu.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| widget.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| toolbar.hoverBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| debugToolBar.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| agentsChatInput.border | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| chat.requestBackground | surface | alt | 0.07 | #141211 | 1.09:1 | 10.38:1 |
| chat.requestBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| focusBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| contrastBorder | line | alt | 0.12 | #1d1c1b | 1.20:1 |  |
| selection.background | surface | alt | 0.16 | #252322 | 1.30:1 | 8.69:1 |

<!-- benom:generated:end -->
