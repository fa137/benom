// Gate 2: every color in both themes that has a contrast target in
// src/palette.json / src/workbench.mjs meets or exceeds that target
// against its documented background, using WCAG relative luminance.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { workbenchRules, terminalAnsiRules } from '../src/workbench.mjs';

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
  { file: 'themes/benom-color-theme.json', background: '#000000' },
  { file: 'themes/benom-alt-color-theme.json', background: '#211816' },
];

// Roles with an explicit target. The build lifts these against the
// variant background; the test asserts the target is met.
const TARGETS = new Map(
  workbenchRules
    .filter((r) => r.target !== undefined)
    .map((r) => [r.id, r.target]),
);

for (const variant of VARIANTS) {
  test(`gate2: ${variant.file} meets contrast targets`, () => {
    const theme = JSON.parse(readFileSync(join(root, variant.file), 'utf8'));
    const colors = theme.colors;
    let checked = 0;
    for (const [id, target] of TARGETS) {
      const value = colors[id];
      assert.ok(value, `missing color ${id}`);
      const ratio = contrast(value, variant.background);
      assert.ok(
        ratio >= target - 1e-9,
        `${id} ${value} has contrast ${ratio.toFixed(2)}:1 against ${variant.background}, target ${target}`,
      );
      checked += 1;
    }
    assert.ok(checked > 0, 'expected at least one targeted color');
  });
}

// The architecture's documented facts must hold: comment, diag_green,
// alt and visual are lifted so they are readable on both backgrounds.
test('gate2: lifted roles meet their targets on both backgrounds', () => {
  for (const variant of VARIANTS) {
    const theme = JSON.parse(readFileSync(join(root, variant.file), 'utf8'));
    // editorLineNumber uses comment grey with a 3.0 target.
    const lineNumber = theme.colors['editorLineNumber.foreground'];
    assert.ok(contrast(lineNumber, variant.background) >= 3.0, `editorLineNumber on ${variant.background}`);
    // Selection foreground must keep 4.5 against the selection surface.
    const selectionFg = theme.colors['editor.selectionForeground'];
    const selectionBg = theme.colors['editor.selectionBackground'];
    assert.ok(contrast(selectionFg, selectionBg) >= 4.5, `selection text on ${variant.background}`);
    // Error / warning / info foregrounds must keep 4.5.
    for (const id of ['editorError.foreground', 'editorWarning.foreground', 'editorInfo.foreground']) {
      assert.ok(contrast(theme.colors[id], variant.background) >= 4.5, `${id} on ${variant.background}`);
    }
  }
});
