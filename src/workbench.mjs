// Benom: UI color keys (role -> VS Code workbench color ids).
//
// Pure data module consumed by scripts/build.mjs. Each entry maps a semantic role
// to the VS Code workbench color id it controls and to a palette key (core or
// functional_additions) that supplies the base color.
//
// Gate 3 (docs/ARCHITECTURE.md): every id in `id` must be a real VS Code color
// id, checked against the committed allowlist in test/known-colors.json. No key
// may appear twice (asserted by the build and by the gate 3 test).
//
// Only the functional_additions palette (error, warning, info, added, modified,
// removed) may supply diagnostic / diff / git colors; every other role uses a
// core Venom color.

export const workbenchRules = [
  // Editor core. editor.background and editor.foreground are overridden per
  // variant by the build (base #000000, alt #211816).
  { role: 'editor.background', id: 'editor.background', paletteKey: 'bg' },
  { role: 'editor.foreground', id: 'editor.foreground', paletteKey: 'fg' },
  { role: 'editorLineNumber.foreground', id: 'editorLineNumber.foreground', paletteKey: 'comment', target: 3.0 },
  { role: 'editorLineNumber.activeForeground', id: 'editorLineNumber.activeForeground', paletteKey: 'fg', target: 3.0 },
  { role: 'editorCursor.foreground', id: 'editorCursor.foreground', paletteKey: 'string' },
  { role: 'editorGutter.background', id: 'editorGutter.background', paletteKey: 'bg' },
  { role: 'editor.lineHighlightBackground', id: 'editor.lineHighlightBackground', paletteKey: 'visual' },
  { role: 'editor.lineHighlightBorder', id: 'editor.lineHighlightBorder', paletteKey: 'visual' },
  { role: 'editorRuler.foreground', id: 'editorRuler.foreground', paletteKey: 'comment' },
  { role: 'editorOverviewRuler.border', id: 'editorOverviewRuler.border', paletteKey: 'comment' },

  // Selection and find highlights. The selected text must keep 4.5:1
  // against the selection surface, so these foreground roles are
  // lifted against their surface (see `against`), and the surface
  // itself is lifted against the editor background.
  { role: 'editor.selectionBackground', id: 'editor.selectionBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'editor.inactiveSelectionBackground', id: 'editor.inactiveSelectionBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'editor.selectionForeground', id: 'editor.selectionForeground', paletteKey: 'fg', target: 4.5, against: 'editor.selectionBackground' },
  { role: 'editor.findMatchBackground', id: 'editor.findMatchBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'editor.findMatchHighlightBackground', id: 'editor.findMatchHighlightBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'editor.findMatchForeground', id: 'editor.findMatchForeground', paletteKey: 'fg', target: 4.5, against: 'editor.findMatchBackground' },
  { role: 'editor.findMatchHighlightForeground', id: 'editor.findMatchHighlightForeground', paletteKey: 'fg', target: 4.5, against: 'editor.findMatchHighlightBackground' },
  { role: 'editor.wordHighlightBackground', id: 'editor.wordHighlightBackground', paletteKey: 'visual' },
  { role: 'editor.wordHighlightStrongBackground', id: 'editor.wordHighlightStrongBackground', paletteKey: 'visual' },
  { role: 'editorWhitespace.foreground', id: 'editorWhitespace.foreground', paletteKey: 'comment' },

  // Bracket pair colors and indent guides. Bracket pair colors cycle through the
  // available core hues; indent guides use the comment grey.
  { role: 'editorBracketHighlight.foreground1', id: 'editorBracketHighlight.foreground1', paletteKey: 'fg' },
  { role: 'editorBracketHighlight.foreground2', id: 'editorBracketHighlight.foreground2', paletteKey: 'property' },
  { role: 'editorBracketHighlight.foreground3', id: 'editorBracketHighlight.foreground3', paletteKey: 'alt' },
  { role: 'editorBracketHighlight.foreground4', id: 'editorBracketHighlight.foreground4', paletteKey: 'keyword' },
  { role: 'editorBracketHighlight.foreground5', id: 'editorBracketHighlight.foreground5', paletteKey: 'constant' },
  { role: 'editorBracketHighlight.foreground6', id: 'editorBracketHighlight.foreground6', paletteKey: 'func' },
  { role: 'editorIndentGuide.background', id: 'editorIndentGuide.background', paletteKey: 'visual' },
  { role: 'editorIndentGuide.activeBackground', id: 'editorIndentGuide.activeBackground', paletteKey: 'comment' },

  // Editor widgets.
  { role: 'editorWidget.background', id: 'editorWidget.background', paletteKey: 'bg' },
  { role: 'editorWidget.foreground', id: 'editorWidget.foreground', paletteKey: 'fg' },
  { role: 'editorWidget.border', id: 'editorWidget.border', paletteKey: 'comment' },
  { role: 'editorHoverWidget.background', id: 'editorHoverWidget.background', paletteKey: 'bg' },
  { role: 'editorHoverWidget.foreground', id: 'editorHoverWidget.foreground', paletteKey: 'fg' },
  { role: 'editorHoverWidget.border', id: 'editorHoverWidget.border', paletteKey: 'comment' },
  { role: 'editorSuggestWidget.background', id: 'editorSuggestWidget.background', paletteKey: 'bg' },
  { role: 'editorSuggestWidget.foreground', id: 'editorSuggestWidget.foreground', paletteKey: 'fg' },
  { role: 'editorSuggestWidget.border', id: 'editorSuggestWidget.border', paletteKey: 'comment' },
  { role: 'editorSuggestWidget.selectedBackground', id: 'editorSuggestWidget.selectedBackground', paletteKey: 'visual' },
  { role: 'editorInlayHint.foreground', id: 'editorInlayHint.foreground', paletteKey: 'comment', target: 3.0 },
  { role: 'editorInlayHint.background', id: 'editorInlayHint.background', paletteKey: 'bg' },

  // Diagnostics (functional palette only).
  { role: 'editorError.foreground', id: 'editorError.foreground', paletteKey: 'error', target: 4.5 },
  { role: 'editorWarning.foreground', id: 'editorWarning.foreground', paletteKey: 'warning', target: 4.5 },
  { role: 'editorInfo.foreground', id: 'editorInfo.foreground', paletteKey: 'info', target: 4.5 },
  { role: 'editorError.background', id: 'editorError.background', paletteKey: 'error' },
  { role: 'editorWarning.background', id: 'editorWarning.background', paletteKey: 'warning' },
  { role: 'editorInfo.background', id: 'editorInfo.background', paletteKey: 'info' },
  { role: 'problemsErrorIcon.foreground', id: 'problemsErrorIcon.foreground', paletteKey: 'error', target: 4.5 },
  { role: 'problemsWarningIcon.foreground', id: 'problemsWarningIcon.foreground', paletteKey: 'warning', target: 4.5 },
  { role: 'problemsInfoIcon.foreground', id: 'problemsInfoIcon.foreground', paletteKey: 'info', target: 4.5 },
  { role: 'list.errorForeground', id: 'list.errorForeground', paletteKey: 'error', target: 4.5 },
  { role: 'list.warningForeground', id: 'list.warningForeground', paletteKey: 'warning', target: 4.5 },

  // Sidebar, activity bar, status bar, title bar, panel.
  { role: 'sideBar.background', id: 'sideBar.background', paletteKey: 'bg' },
  { role: 'sideBar.foreground', id: 'sideBar.foreground', paletteKey: 'fg' },
  { role: 'sideBar.border', id: 'sideBar.border', paletteKey: 'comment' },
  { role: 'sideBarTitle.foreground', id: 'sideBarTitle.foreground', paletteKey: 'fg' },
  { role: 'sideBarSectionHeader.background', id: 'sideBarSectionHeader.background', paletteKey: 'visual' },
  { role: 'activityBar.background', id: 'activityBar.background', paletteKey: 'bg' },
  { role: 'activityBar.foreground', id: 'activityBar.foreground', paletteKey: 'fg' },
  { role: 'activityBar.inactiveForeground', id: 'activityBar.inactiveForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'activityBar.activeBorder', id: 'activityBar.activeBorder', paletteKey: 'type' },
  { role: 'activityBarBadge.background', id: 'activityBarBadge.background', paletteKey: 'type' },
  { role: 'activityBarBadge.foreground', id: 'activityBarBadge.foreground', paletteKey: 'bg' },
  { role: 'titleBar.activeBackground', id: 'titleBar.activeBackground', paletteKey: 'bg' },
  { role: 'titleBar.activeForeground', id: 'titleBar.activeForeground', paletteKey: 'fg' },
  { role: 'titleBar.inactiveBackground', id: 'titleBar.inactiveBackground', paletteKey: 'bg' },
  { role: 'titleBar.inactiveForeground', id: 'titleBar.inactiveForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'statusBar.background', id: 'statusBar.background', paletteKey: 'bg' },
  { role: 'statusBar.foreground', id: 'statusBar.foreground', paletteKey: 'fg' },
  { role: 'statusBar.noFolderBackground', id: 'statusBar.noFolderBackground', paletteKey: 'bg' },
  { role: 'statusBar.noFolderForeground', id: 'statusBar.noFolderForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'statusBar.debuggingBackground', id: 'statusBar.debuggingBackground', paletteKey: 'bg' },
  { role: 'statusBarItem.activeBackground', id: 'statusBarItem.activeBackground', paletteKey: 'visual' },
  { role: 'statusBarItem.hoverBackground', id: 'statusBarItem.hoverBackground', paletteKey: 'visual' },

  // Tabs.
  { role: 'tab.activeBackground', id: 'tab.activeBackground', paletteKey: 'bg' },
  { role: 'tab.activeForeground', id: 'tab.activeForeground', paletteKey: 'fg' },
  { role: 'tab.inactiveBackground', id: 'tab.inactiveBackground', paletteKey: 'bg' },
  { role: 'tab.inactiveForeground', id: 'tab.inactiveForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'tab.border', id: 'tab.border', paletteKey: 'comment' },
  { role: 'tab.activeBorder', id: 'tab.activeBorder', paletteKey: 'type' },
  { role: 'tab.unfocusedActiveBackground', id: 'tab.unfocusedActiveBackground', paletteKey: 'bg' },
  { role: 'tab.unfocusedActiveForeground', id: 'tab.unfocusedActiveForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'tab.unfocusedInactiveBackground', id: 'tab.unfocusedInactiveBackground', paletteKey: 'bg' },
  { role: 'tab.unfocusedInactiveForeground', id: 'tab.unfocusedInactiveForeground', paletteKey: 'comment', target: 3.0 },

  // Panel and terminal.
  { role: 'panel.background', id: 'panel.background', paletteKey: 'bg' },
  { role: 'panel.border', id: 'panel.border', paletteKey: 'comment' },
  { role: 'panelTitle.activeForeground', id: 'panelTitle.activeForeground', paletteKey: 'fg' },
  { role: 'panelTitle.inactiveForeground', id: 'panelTitle.inactiveForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'terminal.background', id: 'terminal.background', paletteKey: 'bg' },
  { role: 'terminal.foreground', id: 'terminal.foreground', paletteKey: 'fg' },

  // Input, dropdown, list, tree.
  { role: 'input.background', id: 'input.background', paletteKey: 'bg' },
  { role: 'input.foreground', id: 'input.foreground', paletteKey: 'fg' },
  { role: 'input.border', id: 'input.border', paletteKey: 'comment' },
  { role: 'input.placeholderForeground', id: 'input.placeholderForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'dropdown.background', id: 'dropdown.background', paletteKey: 'bg' },
  { role: 'dropdown.foreground', id: 'dropdown.foreground', paletteKey: 'fg' },
  { role: 'dropdown.border', id: 'dropdown.border', paletteKey: 'comment' },
  { role: 'list.activeSelectionBackground', id: 'list.activeSelectionBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'list.activeSelectionForeground', id: 'list.activeSelectionForeground', paletteKey: 'fg', target: 4.5, against: 'list.activeSelectionBackground' },
  { role: 'list.inactiveSelectionBackground', id: 'list.inactiveSelectionBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'list.inactiveSelectionForeground', id: 'list.inactiveSelectionForeground', paletteKey: 'fg', target: 4.5, against: 'list.inactiveSelectionBackground' },
  { role: 'list.hoverBackground', id: 'list.hoverBackground', paletteKey: 'visual' },
  { role: 'list.hoverForeground', id: 'list.hoverForeground', paletteKey: 'fg' },
  { role: 'list.focusBackground', id: 'list.focusBackground', paletteKey: 'visual' },
  { role: 'list.focusForeground', id: 'list.focusForeground', paletteKey: 'fg' },
  { role: 'list.highlightForeground', id: 'list.highlightForeground', paletteKey: 'string' },
  { role: 'tree.indentGuidesStroke', id: 'tree.indentGuidesStroke', paletteKey: 'comment' },

  // Buttons, checkbox, radio.
  { role: 'button.background', id: 'button.background', paletteKey: 'visual' },
  { role: 'button.foreground', id: 'button.foreground', paletteKey: 'fg', target: 4.5 },
  { role: 'button.hoverBackground', id: 'button.hoverBackground', paletteKey: 'comment' },
  { role: 'button.border', id: 'button.border', paletteKey: 'comment' },
  { role: 'checkbox.background', id: 'checkbox.background', paletteKey: 'bg' },
  { role: 'checkbox.foreground', id: 'checkbox.foreground', paletteKey: 'fg' },
  { role: 'checkbox.border', id: 'checkbox.border', paletteKey: 'comment' },
  { role: 'radio.inactiveBackground', id: 'radio.inactiveBackground', paletteKey: 'bg' },
  { role: 'radio.inactiveForeground', id: 'radio.inactiveForeground', paletteKey: 'fg' },
  { role: 'radio.inactiveBorder', id: 'radio.inactiveBorder', paletteKey: 'comment' },

  // Scrollbar and minimap.
  { role: 'scrollbar.shadow', id: 'scrollbar.shadow', paletteKey: 'bg' },
  { role: 'scrollbarSlider.background', id: 'scrollbarSlider.background', paletteKey: 'visual' },
  { role: 'scrollbarSlider.hoverBackground', id: 'scrollbarSlider.hoverBackground', paletteKey: 'comment' },
  { role: 'scrollbarSlider.activeBackground', id: 'scrollbarSlider.activeBackground', paletteKey: 'comment' },
  { role: 'minimap.background', id: 'minimap.background', paletteKey: 'bg' },
  { role: 'minimap.findMatchHighlight', id: 'minimap.findMatchHighlight', paletteKey: 'string' },
  { role: 'minimap.selectionHighlight', id: 'minimap.selectionHighlight', paletteKey: 'visual' },

  // Breadcrumbs and peek view.
  { role: 'breadcrumb.background', id: 'breadcrumb.background', paletteKey: 'bg' },
  { role: 'breadcrumb.foreground', id: 'breadcrumb.foreground', paletteKey: 'fg' },
  { role: 'breadcrumb.focusForeground', id: 'breadcrumb.focusForeground', paletteKey: 'string' },
  { role: 'breadcrumb.activeSelectionForeground', id: 'breadcrumb.activeSelectionForeground', paletteKey: 'string' },
  { role: 'breadcrumbPicker.background', id: 'breadcrumbPicker.background', paletteKey: 'bg' },
  { role: 'peekView.border', id: 'peekView.border', paletteKey: 'type' },
  { role: 'peekViewEditor.background', id: 'peekViewEditor.background', paletteKey: 'bg' },
  { role: 'peekViewResult.background', id: 'peekViewResult.background', paletteKey: 'bg' },
  { role: 'peekViewResult.matchHighlightBackground', id: 'peekViewResult.matchHighlightBackground', paletteKey: 'visual' },
  { role: 'peekViewResult.selectionBackground', id: 'peekViewResult.selectionBackground', paletteKey: 'visual' },
  { role: 'peekViewTitle.background', id: 'peekViewTitle.background', paletteKey: 'visual' },

  // Merge conflict.
  { role: 'merge.currentHeaderBackground', id: 'merge.currentHeaderBackground', paletteKey: 'visual' },
  { role: 'merge.currentContentBackground', id: 'merge.currentContentBackground', paletteKey: 'visual' },
  { role: 'merge.incomingHeaderBackground', id: 'merge.incomingHeaderBackground', paletteKey: 'visual' },
  { role: 'merge.incomingContentBackground', id: 'merge.incomingContentBackground', paletteKey: 'visual' },
  { role: 'merge.commonHeaderBackground', id: 'merge.commonHeaderBackground', paletteKey: 'visual' },
  { role: 'merge.commonContentBackground', id: 'merge.commonContentBackground', paletteKey: 'visual' },
  { role: 'merge.border', id: 'merge.border', paletteKey: 'comment' },

  // Diff editor (functional palette only).
  { role: 'diffEditor.insertedTextBackground', id: 'diffEditor.insertedTextBackground', paletteKey: 'added' },
  { role: 'diffEditor.removedTextBackground', id: 'diffEditor.removedTextBackground', paletteKey: 'removed' },
  { role: 'diffEditor.insertedLineBackground', id: 'diffEditor.insertedLineBackground', paletteKey: 'added' },
  { role: 'diffEditor.removedLineBackground', id: 'diffEditor.removedLineBackground', paletteKey: 'removed' },
  { role: 'diffEditorGutter.insertedLineBackground', id: 'diffEditorGutter.insertedLineBackground', paletteKey: 'added' },
  { role: 'diffEditorGutter.removedLineBackground', id: 'diffEditorGutter.removedLineBackground', paletteKey: 'removed' },
  { role: 'diffEditorOverview.insertedForeground', id: 'diffEditorOverview.insertedForeground', paletteKey: 'added' },
  { role: 'diffEditorOverview.removedForeground', id: 'diffEditorOverview.removedForeground', paletteKey: 'removed' },

  // Git decorations (functional palette only).
  { role: 'gitDecoration.addedResourceForeground', id: 'gitDecoration.addedResourceForeground', paletteKey: 'added', target: 4.5 },
  { role: 'gitDecoration.modifiedResourceForeground', id: 'gitDecoration.modifiedResourceForeground', paletteKey: 'modified', target: 4.5 },
  { role: 'gitDecoration.deletedResourceForeground', id: 'gitDecoration.deletedResourceForeground', paletteKey: 'removed', target: 4.5 },
  { role: 'gitDecoration.untrackedResourceForeground', id: 'gitDecoration.untrackedResourceForeground', paletteKey: 'added', target: 4.5 },
  { role: 'gitDecoration.ignoredResourceForeground', id: 'gitDecoration.ignoredResourceForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'gitDecoration.conflictingResourceForeground', id: 'gitDecoration.conflictingResourceForeground', paletteKey: 'warning', target: 4.5 },
  { role: 'gitDecoration.submoduleResourceForeground', id: 'gitDecoration.submoduleResourceForeground', paletteKey: 'info', target: 4.5 },

  // Notifications, menus, widgets.
  { role: 'notifications.background', id: 'notifications.background', paletteKey: 'bg' },
  { role: 'notifications.foreground', id: 'notifications.foreground', paletteKey: 'fg' },
  { role: 'notifications.border', id: 'notifications.border', paletteKey: 'comment' },
  { role: 'notificationsErrorIcon.foreground', id: 'notificationsErrorIcon.foreground', paletteKey: 'error', target: 4.5 },
  { role: 'notificationsWarningIcon.foreground', id: 'notificationsWarningIcon.foreground', paletteKey: 'warning', target: 4.5 },
  { role: 'notificationsInfoIcon.foreground', id: 'notificationsInfoIcon.foreground', paletteKey: 'info', target: 4.5 },
  { role: 'menu.background', id: 'menu.background', paletteKey: 'bg' },
  { role: 'menu.foreground', id: 'menu.foreground', paletteKey: 'fg' },
  { role: 'menu.selectionBackground', id: 'menu.selectionBackground', paletteKey: 'visual', surface: true, target: 3.0 },
  { role: 'menu.selectionForeground', id: 'menu.selectionForeground', paletteKey: 'fg', target: 4.5, against: 'menu.selectionBackground' },
  { role: 'menu.separatorBackground', id: 'menu.separatorBackground', paletteKey: 'comment' },
  { role: 'menu.border', id: 'menu.border', paletteKey: 'comment' },
  { role: 'widget.shadow', id: 'widget.shadow', paletteKey: 'bg' },
  { role: 'widget.border', id: 'widget.border', paletteKey: 'comment' },
  { role: 'toolbar.hoverBackground', id: 'toolbar.hoverBackground', paletteKey: 'visual' },

  // Debug toolbar.
  { role: 'debugToolBar.background', id: 'debugToolBar.background', paletteKey: 'bg' },
  { role: 'debugToolBar.border', id: 'debugToolBar.border', paletteKey: 'comment' },
  { role: 'debugIcon.breakpointForeground', id: 'debugIcon.breakpointForeground', paletteKey: 'type' },
  { role: 'debugIcon.breakpointDisabledForeground', id: 'debugIcon.breakpointDisabledForeground', paletteKey: 'comment', target: 3.0 },

  // Chat / agent panels.
  { role: 'agentsChatInput.background', id: 'agentsChatInput.background', paletteKey: 'bg' },
  { role: 'agentsChatInput.foreground', id: 'agentsChatInput.foreground', paletteKey: 'fg' },
  { role: 'agentsChatInput.border', id: 'agentsChatInput.border', paletteKey: 'comment' },
  { role: 'chat.requestBackground', id: 'chat.requestBackground', paletteKey: 'visual' },
  { role: 'chat.requestBorder', id: 'chat.requestBorder', paletteKey: 'comment' },
  { role: 'activeSessionView.background', id: 'activeSessionView.background', paletteKey: 'bg' },
  { role: 'activeSessionView.foreground', id: 'activeSessionView.foreground', paletteKey: 'fg' },

  // Base colors.
  { role: 'foreground', id: 'foreground', paletteKey: 'fg' },
  { role: 'descriptionForeground', id: 'descriptionForeground', paletteKey: 'comment', target: 3.0 },
  { role: 'focusBorder', id: 'focusBorder', paletteKey: 'type' },
  { role: 'contrastBorder', id: 'contrastBorder', paletteKey: 'comment' },
  { role: 'selection.background', id: 'selection.background', paletteKey: 'visual' },
];

// The 16 ANSI terminal colors, derived from Venom's colormap (docs/ARCHITECTURE.md
// requires all 16 ANSI colors from Venom's colormap). Each maps a terminal color id
// to the palette key it is derived from; the build expands this into the
// terminal.ansi* and terminal.ansiBright* ids.
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
