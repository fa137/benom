// Gate 3: every workbench key used in src/workbench.mjs is a real VS
// Code color id (checked against the committed allowlist in
// test/known-colors.json), and no key appears twice.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { workbenchRules, terminalAnsiRules } from '../src/workbench.mjs';

const root = join(import.meta.dirname, '..');

test('gate3: known-colors.json is committed and non-empty', () => {
  const known = JSON.parse(readFileSync(join(root, 'test/known-colors.json'), 'utf8'));
  assert.ok(Array.isArray(known.colors));
  assert.ok(known.colors.length > 0, 'allowlist must not be empty');
});

test('gate3: every workbench id is a known VS Code color id', () => {
  const known = new Set(JSON.parse(readFileSync(join(root, 'test/known-colors.json'), 'utf8')).colors);
  const ids = [...workbenchRules.map((r) => r.id), ...terminalAnsiRules.map((r) => r.id)];
  const unknown = ids.filter((id) => !known.has(id));
  assert.deepEqual(unknown, [], `ids not in the VS Code theme color reference: ${unknown.join(', ')}`);
});

test('gate3: no workbench id appears twice', () => {
  const ids = [...workbenchRules.map((r) => r.id), ...terminalAnsiRules.map((r) => r.id)];
  const seen = new Set();
  const dupes = [];
  for (const id of ids) {
    if (seen.has(id)) dupes.push(id);
    seen.add(id);
  }
  assert.deepEqual(dupes, []);
});

test('gate3: every workbench palette key exists in the palette', () => {
  const palette = JSON.parse(readFileSync(join(root, 'src/palette.json'), 'utf8'));
  const valid = new Set([...Object.keys(palette.core), ...Object.keys(palette.functional_additions)]);
  const unknown = [...workbenchRules, ...terminalAnsiRules]
    .map((r) => r.paletteKey)
    .filter((k) => !valid.has(k));
  assert.deepEqual(unknown, []);
});
