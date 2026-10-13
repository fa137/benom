// Benom: UI color keys, each with a CLASS that says how its color is
// derived. Pure data module consumed by scripts/build.mjs.
//
// Classes (per the coordinator's design, round 1):
// - text    foreground colors. Lifted by contrast against the surface
//           they sit on (`against`) or the variant background. Targets:
//           4.5 default, 4.0 comments, 3.0 secondary/inactive text.
// - surface hover, selection, line highlight, word highlight, find
//           match, widget and section header backgrounds, list
//           selection/hover/focus, scrollbar sliders, button surfaces,
//           peek and merge backgrounds. NEVER lifted by text contrast.
//           Derived as mix(variantBackground, foreground, t).
// - line    borders, indent guides, rulers, whitespace dots, tree indent
//           stroke. Derived as mix(variantBackground, foreground, t).
// - chrome  activity bar, title bar, status bar. Derived as
//           mix(variantBackground, #000000, 0.25) (base stays black).
// - area    large areas (editor, sidebar, panel, terminal, inactive
//           tab, widgets, active tab, breadcrumbs). The variant
//           background itself.
// - accent  colored accents (red/teal borders, badges, diff markers,
//           terminal ANSI). The palette color, used as-is for fidelity.
// - tint    diff text/line backgrounds inside the editor: the palette
//           color mixed with the editor background (share t), so the
//           text on top keeps its contrast (full-brightness red/green
//           backgrounds made #c1c1c1 text nearly unreadable).
//
// Gate 3 (docs/ARCHITECTURE.md): every `id` must be a real VS Code
// color id, checked against the committed allowlist in
// test/known-colors.json. No key may appear twice.

// Surface mix factors (t) per role.
export const SURFACE_T = {
  lineHighlight: 0.05,
  listHover: 0.07,
  wordHighlight: 0.10,
  inactiveSelection: 0.10,
  selection: 0.16,
  listActiveSelection: 0.14,
  findMatchHighlight: 0.12,
  findMatch: 0.22,
  scrollbarSlider: 0.12,
  scrollbarHover: 0.18,
  scrollbarActive: 0.26,
  sectionHeader: 0.06,
  button: 0.14,
  peekMerge: 0.07,
  mergeHeader: 0.10,
};

// Line mix factors (t) per role.
export const LINE_T = {
  border: 0.12,
  indentGuide: 0.08,
  activeIndentGuide: 0.25,
  ruler: 0.10,
  whitespace: 0.18,
  treeIndent: 0.10,
};

// Chrome mix factor (activity bar, title bar, status bar).
export const CHROME_T = 0.25;

// The foreground used to derive surfaces and lines (Venom fg).
export const MIX_FOREGROUND = 'fg';

export const workbenchRules = [
  // --- Editor core ---
  { role: 'editor.background', id: 'editor.background', class: 'area' },
  { role: 'editor.foreground', id: 'editor.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'editor.border', id: 'editor.border', class: 'line', t: LINE_T.border },
  { role: 'editorLineNumber.foreground', id: 'editorLineNumber.foreground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'editorLineNumber.activeForeground', id: 'editorLineNumber.activeForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'editorCursor.foreground', id: 'editorCursor.foreground', class: 'text', paletteKey: 'string', target: 4.5 },
  { role: 'editorGutter.background', id: 'editorGutter.background', class: 'area' },
  { role: 'editor.lineHighlightBackground', id: 'editor.lineHighlightBackground', class: 'surface', t: SURFACE_T.lineHighlight },
  { role: 'editor.lineHighlightBorder', id: 'editor.lineHighlightBorder', class: 'line', t: LINE_T.border },
  { role: 'editorRuler.foreground', id: 'editorRuler.foreground', class: 'line', t: LINE_T.ruler },
  { role: 'editorOverviewRuler.border', id: 'editorOverviewRuler.border', class: 'line', t: LINE_T.border },

  // Editor groups.
  { role: 'editorGroup.border', id: 'editorGroup.border', class: 'line', t: LINE_T.border },
  { role: 'editorGroupHeader.tabsBackground', id: 'editorGroupHeader.tabsBackground', class: 'area' },
  { role: 'editorGroupHeader.noTabsBackground', id: 'editorGroupHeader.noTabsBackground', class: 'area' },
  { role: 'editorGroupHeader.tabsBorder', id: 'editorGroupHeader.tabsBorder', class: 'line', t: LINE_T.border },
  { role: 'editorGroupHeader.border', id: 'editorGroupHeader.border', class: 'line', t: LINE_T.border },
  { role: 'editorGroup.emptyBackground', id: 'editorGroup.emptyBackground', class: 'area' },

  // Bracket matching and bracket pair colors.
  { role: 'editorBracketMatch.background', id: 'editorBracketMatch.background', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editorBracketMatch.border', id: 'editorBracketMatch.border', class: 'line', t: LINE_T.border },
  { role: 'editorBracketHighlight.foreground1', id: 'editorBracketHighlight.foreground1', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'editorBracketHighlight.foreground2', id: 'editorBracketHighlight.foreground2', class: 'text', paletteKey: 'property', target: 4.5 },
  { role: 'editorBracketHighlight.foreground3', id: 'editorBracketHighlight.foreground3', class: 'text', paletteKey: 'alt', target: 4.5 },
  { role: 'editorBracketHighlight.foreground4', id: 'editorBracketHighlight.foreground4', class: 'text', paletteKey: 'keyword', target: 4.5 },
  { role: 'editorBracketHighlight.foreground5', id: 'editorBracketHighlight.foreground5', class: 'text', paletteKey: 'constant', target: 4.5 },
  { role: 'editorBracketHighlight.foreground6', id: 'editorBracketHighlight.foreground6', class: 'text', paletteKey: 'func', target: 4.5 },

  // Selection and find highlights (surfaces; the selected text is a
  // text role measured against the surface via `against`).
  { role: 'editor.selectionBackground', id: 'editor.selectionBackground', class: 'surface', t: SURFACE_T.selection },
  { role: 'editor.inactiveSelectionBackground', id: 'editor.inactiveSelectionBackground', class: 'surface', t: SURFACE_T.inactiveSelection },
  { role: 'editor.selectionForeground', id: 'editor.selectionForeground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'editor.selectionBackground' },
  { role: 'editor.findMatchBackground', id: 'editor.findMatchBackground', class: 'surface', t: SURFACE_T.findMatch },
  { role: 'editor.findMatchHighlightBackground', id: 'editor.findMatchHighlightBackground', class: 'surface', t: SURFACE_T.findMatchHighlight },
  { role: 'editor.findMatchForeground', id: 'editor.findMatchForeground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'editor.findMatchBackground' },
  { role: 'editor.findMatchHighlightForeground', id: 'editor.findMatchHighlightForeground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'editor.findMatchHighlightBackground' },
  { role: 'editor.wordHighlightBackground', id: 'editor.wordHighlightBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editor.wordHighlightStrongBackground', id: 'editor.wordHighlightStrongBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editorWhitespace.foreground', id: 'editorWhitespace.foreground', class: 'line', t: LINE_T.whitespace },
  { role: 'editorIndentGuide.background', id: 'editorIndentGuide.background', class: 'line', t: LINE_T.indentGuide },
  { role: 'editorIndentGuide.activeBackground', id: 'editorIndentGuide.activeBackground', class: 'line', t: LINE_T.activeIndentGuide },

  // Editor highlights (subtle surfaces).
  { role: 'editor.foldBackground', id: 'editor.foldBackground', class: 'surface', t: SURFACE_T.listHover },
  { role: 'editor.rangeHighlightBackground', id: 'editor.rangeHighlightBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editor.findRangeHighlightBackground', id: 'editor.findRangeHighlightBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editor.hoverHighlightBackground', id: 'editor.hoverHighlightBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editor.linkedEditingBackground', id: 'editor.linkedEditingBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editor.snippetTabstopHighlightBackground', id: 'editor.snippetTabstopHighlightBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editor.snippetFinalTabstopHighlightBackground', id: 'editor.snippetFinalTabstopHighlightBackground', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editorLink.activeForeground', id: 'editorLink.activeForeground', class: 'text', paletteKey: 'string', target: 4.5 },
  { role: 'textLink.foreground', id: 'textLink.foreground', class: 'text', paletteKey: 'string', target: 4.5 },

  // Editor widgets.
  { role: 'editorWidget.background', id: 'editorWidget.background', class: 'area' },
  { role: 'editorWidget.foreground', id: 'editorWidget.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'editorWidget.border', id: 'editorWidget.border', class: 'line', t: LINE_T.border },
  { role: 'editorHoverWidget.background', id: 'editorHoverWidget.background', class: 'area' },
  { role: 'editorHoverWidget.foreground', id: 'editorHoverWidget.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'editorHoverWidget.border', id: 'editorHoverWidget.border', class: 'line', t: LINE_T.border },
  { role: 'editorSuggestWidget.background', id: 'editorSuggestWidget.background', class: 'area' },
  { role: 'editorSuggestWidget.foreground', id: 'editorSuggestWidget.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'editorSuggestWidget.border', id: 'editorSuggestWidget.border', class: 'line', t: LINE_T.border },
  { role: 'editorSuggestWidget.selectedBackground', id: 'editorSuggestWidget.selectedBackground', class: 'surface', t: SURFACE_T.listHover },
  { role: 'editorInlayHint.foreground', id: 'editorInlayHint.foreground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'editorInlayHint.background', id: 'editorInlayHint.background', class: 'area' },

  // Diagnostics (functional palette, text class, lifted to 4.5).
  { role: 'editorError.foreground', id: 'editorError.foreground', class: 'text', paletteKey: 'error', target: 4.5 },
  { role: 'editorWarning.foreground', id: 'editorWarning.foreground', class: 'text', paletteKey: 'warning', target: 4.5 },
  { role: 'editorInfo.foreground', id: 'editorInfo.foreground', class: 'text', paletteKey: 'info', target: 4.5 },
  { role: 'editorError.background', id: 'editorError.background', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editorWarning.background', id: 'editorWarning.background', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'editorInfo.background', id: 'editorInfo.background', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'problemsErrorIcon.foreground', id: 'problemsErrorIcon.foreground', class: 'text', paletteKey: 'error', target: 4.5 },
  { role: 'problemsWarningIcon.foreground', id: 'problemsWarningIcon.foreground', class: 'text', paletteKey: 'warning', target: 4.5 },
  { role: 'problemsInfoIcon.foreground', id: 'problemsInfoIcon.foreground', class: 'text', paletteKey: 'info', target: 4.5 },
  { role: 'list.errorForeground', id: 'list.errorForeground', class: 'text', paletteKey: 'error', target: 4.5 },
  { role: 'list.warningForeground', id: 'list.warningForeground', class: 'text', paletteKey: 'warning', target: 4.5 },

  // Sidebar.
  { role: 'sideBar.background', id: 'sideBar.background', class: 'area' },
  { role: 'sideBar.foreground', id: 'sideBar.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'sideBar.border', id: 'sideBar.border', class: 'line', t: LINE_T.border },
  { role: 'sideBarTitle.foreground', id: 'sideBarTitle.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'sideBarSectionHeader.background', id: 'sideBarSectionHeader.background', class: 'surface', t: SURFACE_T.sectionHeader },
  { role: 'sideBar.dropBackground', id: 'sideBar.dropBackground', class: 'surface', t: SURFACE_T.listHover },

  // Chrome: activity bar, title bar, status bar.
  { role: 'activityBar.background', id: 'activityBar.background', class: 'chrome' },
  { role: 'activityBar.foreground', id: 'activityBar.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'activityBar.inactiveForeground', id: 'activityBar.inactiveForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'activityBar.activeBorder', id: 'activityBar.activeBorder', class: 'accent', paletteKey: 'type' },
  { role: 'activityBarBadge.background', id: 'activityBarBadge.background', class: 'accent', paletteKey: 'type' },
  { role: 'activityBarBadge.foreground', id: 'activityBarBadge.foreground', class: 'text', paletteKey: 'bg', target: 4.5, against: 'activityBarBadge.background' },
  { role: 'titleBar.activeBackground', id: 'titleBar.activeBackground', class: 'chrome' },
  { role: 'titleBar.activeForeground', id: 'titleBar.activeForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'titleBar.inactiveBackground', id: 'titleBar.inactiveBackground', class: 'chrome' },
  { role: 'titleBar.inactiveForeground', id: 'titleBar.inactiveForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'statusBar.background', id: 'statusBar.background', class: 'chrome' },
  { role: 'statusBar.foreground', id: 'statusBar.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'statusBar.noFolderBackground', id: 'statusBar.noFolderBackground', class: 'chrome' },
  { role: 'statusBar.noFolderForeground', id: 'statusBar.noFolderForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'statusBar.debuggingBackground', id: 'statusBar.debuggingBackground', class: 'chrome' },
  { role: 'statusBarItem.activeBackground', id: 'statusBarItem.activeBackground', class: 'surface', t: SURFACE_T.inactiveSelection },
  { role: 'statusBarItem.hoverBackground', id: 'statusBarItem.hoverBackground', class: 'surface', t: SURFACE_T.listHover },
  { role: 'statusBarItem.focusBorder', id: 'statusBarItem.focusBorder', class: 'line', t: LINE_T.border },

  // Tabs.
  { role: 'tab.activeBackground', id: 'tab.activeBackground', class: 'area' },
  { role: 'tab.activeForeground', id: 'tab.activeForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'tab.inactiveBackground', id: 'tab.inactiveBackground', class: 'area' },
  { role: 'tab.inactiveForeground', id: 'tab.inactiveForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'tab.border', id: 'tab.border', class: 'line', t: LINE_T.border },
  { role: 'tab.activeBorder', id: 'tab.activeBorder', class: 'line', t: LINE_T.border },
  { role: 'tab.activeBorderTop', id: 'tab.activeBorderTop', class: 'accent', paletteKey: 'type' },
  { role: 'tab.unfocusedActiveBackground', id: 'tab.unfocusedActiveBackground', class: 'area' },
  { role: 'tab.unfocusedActiveForeground', id: 'tab.unfocusedActiveForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'tab.unfocusedInactiveBackground', id: 'tab.unfocusedInactiveBackground', class: 'area' },
  { role: 'tab.unfocusedInactiveForeground', id: 'tab.unfocusedInactiveForeground', class: 'text', paletteKey: 'comment', target: 3.0 },

  // Panel and terminal.
  { role: 'panel.background', id: 'panel.background', class: 'area' },
  { role: 'panel.border', id: 'panel.border', class: 'line', t: LINE_T.border },
  { role: 'panelTitle.activeForeground', id: 'panelTitle.activeForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'panelTitle.inactiveForeground', id: 'panelTitle.inactiveForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'terminal.background', id: 'terminal.background', class: 'area' },
  { role: 'terminal.foreground', id: 'terminal.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },

  // Input, dropdown, list, tree.
  { role: 'input.background', id: 'input.background', class: 'area' },
  { role: 'input.foreground', id: 'input.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'input.border', id: 'input.border', class: 'line', t: LINE_T.border },
  { role: 'input.placeholderForeground', id: 'input.placeholderForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'dropdown.background', id: 'dropdown.background', class: 'area' },
  { role: 'dropdown.foreground', id: 'dropdown.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'dropdown.border', id: 'dropdown.border', class: 'line', t: LINE_T.border },
  { role: 'list.activeSelectionBackground', id: 'list.activeSelectionBackground', class: 'surface', t: SURFACE_T.listActiveSelection },
  { role: 'list.activeSelectionForeground', id: 'list.activeSelectionForeground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'list.activeSelectionBackground' },
  { role: 'list.inactiveSelectionBackground', id: 'list.inactiveSelectionBackground', class: 'surface', t: SURFACE_T.inactiveSelection },
  { role: 'list.inactiveSelectionForeground', id: 'list.inactiveSelectionForeground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'list.inactiveSelectionBackground' },
  { role: 'list.hoverBackground', id: 'list.hoverBackground', class: 'surface', t: SURFACE_T.listHover },
  { role: 'list.hoverForeground', id: 'list.hoverForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'list.focusBackground', id: 'list.focusBackground', class: 'surface', t: SURFACE_T.listHover },
  { role: 'list.focusForeground', id: 'list.focusForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'list.highlightForeground', id: 'list.highlightForeground', class: 'text', paletteKey: 'string', target: 4.5 },
  { role: 'list.dropBackground', id: 'list.dropBackground', class: 'surface', t: SURFACE_T.listHover },
  { role: 'tree.indentGuidesStroke', id: 'tree.indentGuidesStroke', class: 'line', t: LINE_T.treeIndent },

  // Buttons, checkbox, radio.
  { role: 'button.background', id: 'button.background', class: 'surface', t: SURFACE_T.button },
  { role: 'button.foreground', id: 'button.foreground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'button.background' },
  { role: 'button.hoverBackground', id: 'button.hoverBackground', class: 'surface', t: SURFACE_T.inactiveSelection },
  { role: 'button.border', id: 'button.border', class: 'line', t: LINE_T.border },
  { role: 'checkbox.background', id: 'checkbox.background', class: 'area' },
  { role: 'checkbox.foreground', id: 'checkbox.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'checkbox.border', id: 'checkbox.border', class: 'line', t: LINE_T.border },
  { role: 'checkbox.selectBackground', id: 'checkbox.selectBackground', class: 'surface', t: SURFACE_T.listActiveSelection },
  { role: 'checkbox.selectBorder', id: 'checkbox.selectBorder', class: 'line', t: LINE_T.border },
  { role: 'radio.inactiveBackground', id: 'radio.inactiveBackground', class: 'area' },
  { role: 'radio.inactiveForeground', id: 'radio.inactiveForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'radio.inactiveBorder', id: 'radio.inactiveBorder', class: 'line', t: LINE_T.border },
  { role: 'radio.activeBackground', id: 'radio.activeBackground', class: 'surface', t: SURFACE_T.listActiveSelection },
  { role: 'radio.activeForeground', id: 'radio.activeForeground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'radio.activeBorder', id: 'radio.activeBorder', class: 'line', t: LINE_T.border },

  // Scrollbar and minimap.
  { role: 'scrollbar.shadow', id: 'scrollbar.shadow', class: 'area' },
  { role: 'scrollbarSlider.background', id: 'scrollbarSlider.background', class: 'surface', t: SURFACE_T.scrollbarSlider },
  { role: 'scrollbarSlider.hoverBackground', id: 'scrollbarSlider.hoverBackground', class: 'surface', t: SURFACE_T.scrollbarHover },
  { role: 'scrollbarSlider.activeBackground', id: 'scrollbarSlider.activeBackground', class: 'surface', t: SURFACE_T.scrollbarActive },
  { role: 'minimap.background', id: 'minimap.background', class: 'area' },
  { role: 'minimap.findMatchHighlight', id: 'minimap.findMatchHighlight', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'minimap.selectionHighlight', id: 'minimap.selectionHighlight', class: 'surface', t: SURFACE_T.selection },
  { role: 'minimap.errorHighlight', id: 'minimap.errorHighlight', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'minimap.warningHighlight', id: 'minimap.warningHighlight', class: 'surface', t: SURFACE_T.wordHighlight },
  { role: 'minimap.infoHighlight', id: 'minimap.infoHighlight', class: 'surface', t: SURFACE_T.wordHighlight },

  // Breadcrumbs and peek view.
  { role: 'breadcrumb.background', id: 'breadcrumb.background', class: 'area' },
  { role: 'breadcrumb.foreground', id: 'breadcrumb.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'breadcrumb.focusForeground', id: 'breadcrumb.focusForeground', class: 'text', paletteKey: 'string', target: 4.5 },
  { role: 'breadcrumb.activeSelectionForeground', id: 'breadcrumb.activeSelectionForeground', class: 'text', paletteKey: 'string', target: 4.5 },
  { role: 'breadcrumbPicker.background', id: 'breadcrumbPicker.background', class: 'area' },
  { role: 'peekView.border', id: 'peekView.border', class: 'accent', paletteKey: 'type' },
  { role: 'peekViewEditor.background', id: 'peekViewEditor.background', class: 'area' },
  { role: 'peekViewEditorGutter.background', id: 'peekViewEditorGutter.background', class: 'area' },
  { role: 'peekViewResult.background', id: 'peekViewResult.background', class: 'surface', t: SURFACE_T.peekMerge },
  { role: 'peekViewResult.matchHighlightBackground', id: 'peekViewResult.matchHighlightBackground', class: 'surface', t: SURFACE_T.findMatchHighlight },
  { role: 'peekViewResult.selectionBackground', id: 'peekViewResult.selectionBackground', class: 'surface', t: SURFACE_T.listActiveSelection },
  { role: 'peekViewTitle.background', id: 'peekViewTitle.background', class: 'surface', t: SURFACE_T.peekMerge },

  // Merge conflict (surfaces; headers slightly stronger).
  { role: 'merge.currentHeaderBackground', id: 'merge.currentHeaderBackground', class: 'surface', t: SURFACE_T.mergeHeader },
  { role: 'merge.currentContentBackground', id: 'merge.currentContentBackground', class: 'surface', t: SURFACE_T.peekMerge },
  { role: 'merge.incomingHeaderBackground', id: 'merge.incomingHeaderBackground', class: 'surface', t: SURFACE_T.mergeHeader },
  { role: 'merge.incomingContentBackground', id: 'merge.incomingContentBackground', class: 'surface', t: SURFACE_T.peekMerge },
  { role: 'merge.commonHeaderBackground', id: 'merge.commonHeaderBackground', class: 'surface', t: SURFACE_T.mergeHeader },
  { role: 'merge.commonContentBackground', id: 'merge.commonContentBackground', class: 'surface', t: SURFACE_T.peekMerge },
  { role: 'merge.border', id: 'merge.border', class: 'line', t: LINE_T.border },
  { role: 'editorOverviewRuler.currentContentForeground', id: 'editorOverviewRuler.currentContentForeground', class: 'accent', paletteKey: 'modified' },
  { role: 'editorOverviewRuler.incomingContentForeground', id: 'editorOverviewRuler.incomingContentForeground', class: 'accent', paletteKey: 'info' },
  { role: 'editorOverviewRuler.commonContentForeground', id: 'editorOverviewRuler.commonContentForeground', class: 'accent', paletteKey: 'added' },
  { role: 'editorOverviewRuler.findMatchForeground', id: 'editorOverviewRuler.findMatchForeground', class: 'surface', t: SURFACE_T.findMatch },
  { role: 'editorOverviewRuler.selectionHighlightForeground', id: 'editorOverviewRuler.selectionHighlightForeground', class: 'surface', t: SURFACE_T.selection },

  // Diff editor (functional palette; in-editor text/line backgrounds are
  // tinted so the editor foreground stays readable on them; gutter and
  // overview markers stay as-is accents).
  { role: 'diffEditor.insertedTextBackground', id: 'diffEditor.insertedTextBackground', class: 'tint', paletteKey: 'added', t: 0.8 },
  { role: 'diffEditor.removedTextBackground', id: 'diffEditor.removedTextBackground', class: 'tint', paletteKey: 'removed', t: 0.8 },
  { role: 'diffEditor.insertedLineBackground', id: 'diffEditor.insertedLineBackground', class: 'tint', paletteKey: 'added', t: 0.9 },
  { role: 'diffEditor.removedLineBackground', id: 'diffEditor.removedLineBackground', class: 'tint', paletteKey: 'removed', t: 0.9 },
  { role: 'diffEditorGutter.insertedLineBackground', id: 'diffEditorGutter.insertedLineBackground', class: 'accent', paletteKey: 'added' },
  { role: 'diffEditorGutter.removedLineBackground', id: 'diffEditorGutter.removedLineBackground', class: 'accent', paletteKey: 'removed' },
  { role: 'diffEditorOverview.insertedForeground', id: 'diffEditorOverview.insertedForeground', class: 'accent', paletteKey: 'added' },
  { role: 'diffEditorOverview.removedForeground', id: 'diffEditorOverview.removedForeground', class: 'accent', paletteKey: 'removed' },
  { role: 'diffEditor.insertedTextBorder', id: 'diffEditor.insertedTextBorder', class: 'line', t: LINE_T.border },
  { role: 'diffEditor.removedTextBorder', id: 'diffEditor.removedTextBorder', class: 'line', t: LINE_T.border },
  { role: 'diffEditor.border', id: 'diffEditor.border', class: 'line', t: LINE_T.border },
  { role: 'diffEditor.diagonalFill', id: 'diffEditor.diagonalFill', class: 'area' },

  // Git decorations (functional palette, text class, lifted to 4.5).
  { role: 'gitDecoration.addedResourceForeground', id: 'gitDecoration.addedResourceForeground', class: 'text', paletteKey: 'added', target: 4.5 },
  { role: 'gitDecoration.modifiedResourceForeground', id: 'gitDecoration.modifiedResourceForeground', class: 'text', paletteKey: 'modified', target: 4.5 },
  { role: 'gitDecoration.deletedResourceForeground', id: 'gitDecoration.deletedResourceForeground', class: 'text', paletteKey: 'removed', target: 4.5 },
  { role: 'gitDecoration.untrackedResourceForeground', id: 'gitDecoration.untrackedResourceForeground', class: 'text', paletteKey: 'added', target: 4.5 },
  { role: 'gitDecoration.ignoredResourceForeground', id: 'gitDecoration.ignoredResourceForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'gitDecoration.conflictingResourceForeground', id: 'gitDecoration.conflictingResourceForeground', class: 'text', paletteKey: 'warning', target: 4.5 },
  { role: 'gitDecoration.submoduleResourceForeground', id: 'gitDecoration.submoduleResourceForeground', class: 'text', paletteKey: 'info', target: 4.5 },

  // Notifications, menus, widgets.
  { role: 'notifications.background', id: 'notifications.background', class: 'area' },
  { role: 'notifications.foreground', id: 'notifications.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'notifications.border', id: 'notifications.border', class: 'line', t: LINE_T.border },
  { role: 'notificationsErrorIcon.foreground', id: 'notificationsErrorIcon.foreground', class: 'text', paletteKey: 'error', target: 4.5 },
  { role: 'notificationsWarningIcon.foreground', id: 'notificationsWarningIcon.foreground', class: 'text', paletteKey: 'warning', target: 4.5 },
  { role: 'notificationsInfoIcon.foreground', id: 'notificationsInfoIcon.foreground', class: 'text', paletteKey: 'info', target: 4.5 },
  { role: 'menu.background', id: 'menu.background', class: 'area' },
  { role: 'menu.foreground', id: 'menu.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'menu.selectionBackground', id: 'menu.selectionBackground', class: 'surface', t: SURFACE_T.listActiveSelection },
  { role: 'menu.selectionForeground', id: 'menu.selectionForeground', class: 'text', paletteKey: 'fg', target: 4.5, against: 'menu.selectionBackground' },
  { role: 'menu.separatorBackground', id: 'menu.separatorBackground', class: 'line', t: LINE_T.border },
  { role: 'menu.border', id: 'menu.border', class: 'line', t: LINE_T.border },
  { role: 'widget.shadow', id: 'widget.shadow', class: 'area' },
  { role: 'widget.border', id: 'widget.border', class: 'line', t: LINE_T.border },
  { role: 'toolbar.hoverBackground', id: 'toolbar.hoverBackground', class: 'surface', t: SURFACE_T.listHover },

  // Debug toolbar.
  { role: 'debugToolBar.background', id: 'debugToolBar.background', class: 'area' },
  { role: 'debugToolBar.border', id: 'debugToolBar.border', class: 'line', t: LINE_T.border },
  { role: 'debugIcon.breakpointForeground', id: 'debugIcon.breakpointForeground', class: 'accent', paletteKey: 'type' },
  { role: 'debugIcon.breakpointDisabledForeground', id: 'debugIcon.breakpointDisabledForeground', class: 'text', paletteKey: 'comment', target: 3.0 },

  // Chat / agent panels.
  { role: 'agentsChatInput.background', id: 'agentsChatInput.background', class: 'area' },
  { role: 'agentsChatInput.foreground', id: 'agentsChatInput.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'agentsChatInput.border', id: 'agentsChatInput.border', class: 'line', t: LINE_T.border },
  { role: 'chat.requestBackground', id: 'chat.requestBackground', class: 'surface', t: SURFACE_T.peekMerge },
  { role: 'chat.requestBorder', id: 'chat.requestBorder', class: 'line', t: LINE_T.border },
  { role: 'activeSessionView.background', id: 'activeSessionView.background', class: 'area' },
  { role: 'activeSessionView.foreground', id: 'activeSessionView.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },

  // Base colors.
  { role: 'foreground', id: 'foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'descriptionForeground', id: 'descriptionForeground', class: 'text', paletteKey: 'comment', target: 3.0 },
  { role: 'focusBorder', id: 'focusBorder', class: 'line', t: LINE_T.border },
  { role: 'contrastBorder', id: 'contrastBorder', class: 'line', t: LINE_T.border },
  { role: 'selection.background', id: 'selection.background', class: 'surface', t: SURFACE_T.selection },
  { role: 'icon.foreground', id: 'icon.foreground', class: 'text', paletteKey: 'fg', target: 4.5 },
  { role: 'errorForeground', id: 'errorForeground', class: 'text', paletteKey: 'error', target: 4.5 },
];

// The 16 ANSI terminal colors, derived from Venom's colormap
// (docs/ARCHITECTURE.md requires all 16 ANSI colors from Venom's
// colormap). These are accents: the palette color, used as-is.
export const terminalAnsiRules = [
  { id: 'terminal.ansiBlack', paletteKey: 'alt_bg' },
  { id: 'terminal.ansiRed', paletteKey: 'diag_red' },
  { id: 'terminal.ansiGreen', paletteKey: 'property' },
  { id: 'terminal.ansiYellow', paletteKey: 'func' },
  { id: 'terminal.ansiBlue', paletteKey: 'constant' },
  { id: 'terminal.ansiMagenta', paletteKey: 'type' },
  { id: 'terminal.ansiCyan', paletteKey: 'string' },
  { id: 'terminal.ansiWhite', paletteKey: 'fg' },
  { id: 'terminal.ansiBrightBlack', paletteKey: 'comment' },
  { id: 'terminal.ansiBrightRed', paletteKey: 'diag_red' },
  { id: 'terminal.ansiBrightGreen', paletteKey: 'property' },
  { id: 'terminal.ansiBrightYellow', paletteKey: 'func' },
  { id: 'terminal.ansiBrightBlue', paletteKey: 'constant' },
  { id: 'terminal.ansiBrightMagenta', paletteKey: 'type' },
  { id: 'terminal.ansiBrightCyan', paletteKey: 'string' },
  { id: 'terminal.ansiBrightWhite', paletteKey: 'fg' },
];
