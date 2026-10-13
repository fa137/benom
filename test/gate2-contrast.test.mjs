// Gate 2: contrast targets for the three classes (text, surface,
// line) plus chrome, area and accent handling.
//
// - text:    lifted against the surface it sits on (`against`) or the
//            variant background. Targets: 4.5 default, 4.0 comments,
//            3.0 secondary/inactive.
// - surface: mix(variantBackground, foreground, t). Gate: vs its
//            variant background between 1.0:1 and 2.0:1, AND
//            editor.foreground on it at least 4.5:1.
// - line:    mix(variantBackground, foreground, t). Gate: vs its
//            variant background between 1.0:1 and 3.0:1.
// - chrome:  mix(variantBackground, #000000, 0.25).
// - area:    the variant background.
// - accent:  the palette color (no contrast gate; decorative).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { workbenchRules, terminalAnsiRules } from '../src/workbench.mjs';
import { EDITOR_AREAS } from '../scripts/build.mjs';

const root = join(import.meta.dirname, '..');

// WCAG relative luminance (https://www.w3.org/TR/WCAG20-TECHS/G17.html).
function relativeLuminance(hex) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = channel(parseInt(hex.slice(1, 3), 16));
  const g = channel(parseInt(hex.slice(3, 5), 16));
  const b = channel(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const VARIANTS = [
  { file: 'themes/benom-color-theme.json', background: '#1a1a1a', uiBackground: '#050505', key: 'base' },
  { file: 'themes/benom-alt-color-theme.json', background: '#1e1614', uiBackground: '#140e0d', key: 'alt' },
];

function loadTheme(variant) {
  return JSON.parse(readFileSync(join(root, variant.file), 'utf8'));
}

// The background a text role is measured against: its `against`
// surface if present, else the variant background.
function textBackground(rule, theme, variant) {
  return rule.against ? theme.colors[rule.against] : variant.background;
}

for (const variant of VARIANTS) {
  test(`gate2: ${variant.file} text roles meet their targets`, () => {
    const theme = loadTheme(variant);
    const textRules = workbenchRules.filter((r) => r.class === 'text');
    const bad = [];
    for (const rule of textRules) {
      const value = theme.colors[rule.id];
      const bg = textBackground(rule, theme, variant);
      if (!value) {
        bad.push(`${rule.id} missing`);
        continue;
      }
      const target = rule.target ?? 4.5;
      const ratio = contrast(value, bg);
      if (ratio < target - 1e-9) {
        bad.push(`${rule.id} ${ratio.toFixed(2)}<${target} against ${bg}`);
      }
    }
    assert.deepEqual(bad, []);
  });

  test(`gate2: ${variant.file} surfaces are quiet (1.0-2.0) with readable fg`, () => {
    const theme = loadTheme(variant);
    const fg = theme.colors['editor.foreground'];
    const bad = [];
    for (const rule of workbenchRules.filter((r) => r.class === 'surface')) {
      const value = theme.colors[rule.id];
      const ratio = contrast(value, variant.background);
      // The bug this gate fixes: surfaces must NOT be loud. A surface
      // above 3.0:1 against its background fails outright.
      if (ratio > 3.0 - 1e-9) {
        bad.push(`${rule.id} ${ratio.toFixed(2)}>3.0 (too loud)`);
        continue;
      }
      if (ratio < 1.0 || ratio > 2.0) {
        bad.push(`${rule.id} ${ratio.toFixed(2)} outside 1.0-2.0`);
      }
      // editor.foreground on the surface must stay readable.
      const fgRatio = contrast(fg, value);
      if (fgRatio < 4.5 - 1e-9) {
        bad.push(`${rule.id} fg ${fgRatio.toFixed(2)}<4.5 on surface`);
      }
    }
    assert.deepEqual(bad, []);
  });

  test(`gate2: ${variant.file} lines are quiet (1.0-3.0)`, () => {
    const theme = loadTheme(variant);
    const bad = [];
    for (const rule of workbenchRules.filter((r) => r.class === 'line')) {
      const value = theme.colors[rule.id];
      const ratio = contrast(value, variant.background);
      if (ratio > 3.0 - 1e-9) {
        bad.push(`${rule.id} ${ratio.toFixed(2)}>3.0 (too loud)`);
        continue;
      }
      if (ratio < 1.0 || ratio > 3.0) {
        bad.push(`${rule.id} ${ratio.toFixed(2)} outside 1.0-3.0`);
      }
    }
    assert.deepEqual(bad, []);
  });

  test(`gate2: ${variant.file} no surface or line exceeds 3.0:1 (the bug)`, () => {
    const theme = loadTheme(variant);
    const offenders = [];
    for (const rule of workbenchRules) {
      if (rule.class !== 'surface' && rule.class !== 'line' && rule.class !== 'chrome') continue;
      const value = theme.colors[rule.id];
      const ratio = contrast(value, variant.background);
      if (ratio > 3.0 - 1e-9) {
        offenders.push(`${rule.id} (${rule.class}) ${ratio.toFixed(2)}:1`);
      }
    }
    assert.deepEqual(offenders, []);
  });

  test(`gate2: ${variant.file} areas use the editor or UI background`, () => {
    const theme = loadTheme(variant);
    const bad = [];
    for (const rule of workbenchRules.filter((r) => r.class === 'area')) {
      const expected = EDITOR_AREAS.has(rule.id) ? variant.background : variant.uiBackground;
      if (theme.colors[rule.id] !== expected) {
        bad.push(`${rule.id} ${theme.colors[rule.id]} != ${expected}`);
      }
    }
    assert.deepEqual(bad, []);
  });

  test(`gate2: ${variant.file} editor areas shift, UI areas keep the original background`, () => {
    const theme = loadTheme(variant);
    // The editor canvas and editor-only areas (gutter, active tab,
    // breadcrumbs) use the 5%-shifted editor background; the sidebar,
    // panel, terminal, inactive tabs and widgets use the UI background
    // (2% lighter on base, 40% darker on alt); activityBar, titleBar and
    // statusBar are chrome.
    for (const id of ['editor.background', 'editorGutter.background', 'tab.activeBackground', 'breadcrumb.background']) {
      assert.equal(theme.colors[id], variant.background, `${id} should be the editor background`);
    }
    for (const id of ['sideBar.background', 'panel.background', 'terminal.background', 'tab.inactiveBackground', 'editorWidget.background', 'input.background', 'dropdown.background']) {
      assert.equal(theme.colors[id], variant.uiBackground, `${id} should be the UI background`);
    }
    if (variant.key === 'alt') {
      // Chrome on alt is mix(#140e0d, #000000, 0.25) = #0f0b0a.
      for (const id of ['activityBar.background', 'titleBar.activeBackground', 'statusBar.background']) {
        assert.equal(theme.colors[id], '#0f0b0a', `${id} should be the chrome mix on alt`);
      }
    }
  });

  test(`gate2: ${variant.file} required keys exist`, () => {
    const theme = loadTheme(variant);
    for (const id of [
      'editorCursor.foreground',
      'editorBracketMatch.background',
      'editorBracketMatch.border',
      'editorGroup.border',
      'editorGroupHeader.tabsBackground',
      'tab.activeBorderTop',
      'focusBorder',
      'editorLink.activeForeground',
      'textLink.foreground',
    ]) {
      assert.ok(theme.colors[id], `missing required key ${id}`);
    }
    assert.equal(theme.colors['editorCursor.foreground'], '#f8f7f2');
    assert.equal(theme.colors['tab.activeBorderTop'], '#fc302e');
  });
}

// Selection and find surfaces: the selected text keeps 4.5 against
// the surface, on both variants.
test('gate2: selected text keeps 4.5 on selection and find surfaces', () => {
  for (const variant of VARIANTS) {
    const theme = loadTheme(variant);
    const pairs = [
      ['editor.selectionForeground', 'editor.selectionBackground'],
      ['editor.findMatchForeground', 'editor.findMatchBackground'],
      ['editor.findMatchHighlightForeground', 'editor.findMatchHighlightBackground'],
      ['list.activeSelectionForeground', 'list.activeSelectionBackground'],
      ['list.inactiveSelectionForeground', 'list.inactiveSelectionBackground'],
      ['menu.selectionForeground', 'menu.selectionBackground'],
      ['button.foreground', 'button.background'],
    ];
    for (const [fgId, bgId] of pairs) {
      const ratio = contrast(theme.colors[fgId], theme.colors[bgId]);
      assert.ok(
        ratio >= 4.5 - 1e-9,
        `${fgId} on ${bgId} is ${ratio.toFixed(2)}:1 against ${variant.background}`,
      );
    }
  }
});

// Diagnostics and git foregrounds keep 4.5 on both variants.
test('gate2: diagnostics and git foregrounds keep 4.5', () => {
  for (const variant of VARIANTS) {
    const theme = loadTheme(variant);
    for (const id of [
      'editorError.foreground',
      'editorWarning.foreground',
      'editorInfo.foreground',
      'problemsErrorIcon.foreground',
      'problemsWarningIcon.foreground',
      'problemsInfoIcon.foreground',
      'gitDecoration.addedResourceForeground',
      'gitDecoration.modifiedResourceForeground',
      'gitDecoration.deletedResourceForeground',
    ]) {
      const ratio = contrast(theme.colors[id], variant.background);
      assert.ok(ratio >= 4.5 - 1e-9, `${id} is ${ratio.toFixed(2)}:1 on ${variant.background}`);
    }
  }
});
