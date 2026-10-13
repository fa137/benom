// Gate 1: both themes parse as JSON and every color value is a valid
// hex value (6 or 8 digits).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(import.meta.dirname, '..');
const HEX = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

function walk(value, path, colors) {
  if (typeof value === 'string') {
    if (/^#[0-9a-fA-F]+$/i.test(value)) colors.push({ path, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${path}[${i}]`, colors));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, colors);
  }
}

for (const file of ['themes/benom-color-theme.json', 'themes/benom-alt-color-theme.json']) {
  test(`gate1: ${file} parses as JSON`, () => {
    const theme = JSON.parse(readFileSync(join(root, file), 'utf8'));
    assert.equal(typeof theme, 'object');
    assert.equal(typeof theme.name, 'string');
  });

  test(`gate1: ${file} every color is valid hex`, () => {
    const theme = JSON.parse(readFileSync(join(root, file), 'utf8'));
    const colors = [];
    walk(theme, '$', colors);
    assert.ok(colors.length > 0, 'expected to find color values');
    for (const { path, value } of colors) {
      assert.match(value, HEX, `invalid hex at ${path}: ${value}`);
    }
  });
}

test('gate1: base theme editor.background is #191919 (10% lighter, then 3% darker, than the original #000000)', () => {
  const theme = JSON.parse(readFileSync(join(root, 'themes/benom-color-theme.json'), 'utf8'));
  assert.equal(theme.colors['editor.background'], '#191919');
  assert.equal(theme.colors['sideBar.background'], '#050505');
});

test('gate1: alt theme editor.background is #251e1d (23% darker, then 5% lighter, than the original #211816)', () => {
  const theme = JSON.parse(readFileSync(join(root, 'themes/benom-alt-color-theme.json'), 'utf8'));
  assert.equal(theme.colors['editor.background'], '#251e1d');
  assert.equal(theme.colors['sideBar.background'], '#070504');
});
