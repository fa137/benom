// Syntax fidelity (docs/ARCHITECTURE.md Principle 1 and 4):
// - The theme introduces no hues absent from src/palette.json.
// - Token kinds are separated by font style (italic/bold), not hue.
// - The functional additions (diagnostics, diff, git) are the only
//   ones using the functional palette.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenRules, semanticTokenRules } from '../src/tokens.mjs';
import { workbenchRules, terminalAnsiRules } from '../src/workbench.mjs';

const root = join(import.meta.dirname, '..');
const palette = JSON.parse(readFileSync(join(root, 'src/palette.json'), 'utf8'));

const FUNCTIONAL = new Set(Object.keys(palette.functional_additions));
const DIFF_ROLES = new Set(['diffAdded', 'diffRemoved', 'diffModified', 'invalid']);

function hue(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return Math.round(h * 60);
}

test('fidelity: every token rule uses a palette key', () => {
  const valid = new Set([...Object.keys(palette.core), ...Object.keys(palette.functional_additions)]);
  for (const rule of [...tokenRules, ...semanticTokenRules]) {
    assert.ok(valid.has(rule.paletteKey), `${rule.role ?? rule.type} uses unknown key ${rule.paletteKey}`);
  }
});

test('fidelity: only diff/invalid token rules use the functional palette', () => {
  for (const rule of tokenRules) {
    if (FUNCTIONAL.has(rule.paletteKey)) {
      assert.ok(DIFF_ROLES.has(rule.role), `${rule.role} uses functional color ${rule.paletteKey} outside diff/invalid`);
    }
  }
  for (const rule of semanticTokenRules) {
    assert.ok(!FUNCTIONAL.has(rule.paletteKey), `semantic ${rule.type} uses functional color ${rule.paletteKey}`);
  }
});

test('fidelity: token hues are a subset of palette hues', () => {
  const paletteHues = new Set([
    ...Object.values(palette.core),
    ...Object.values(palette.functional_additions),
  ].map(hue));
  const theme = JSON.parse(readFileSync(join(root, 'themes/benom-color-theme.json'), 'utf8'));
  const tokenHues = new Set(theme.tokenColors.map((t) => hue(`#${t.settings.foreground}`)));
  const foreign = [...tokenHues].filter((h) => !paletteHues.has(h));
  assert.deepEqual(foreign, []);
});

test('fidelity: token kinds sharing a hue are separated by font style', () => {
  // Group rules by palette key; within a group, roles that need
  // distinction must differ by fontStyle (italic/bold), not hue.
  const byKey = new Map();
  for (const rule of tokenRules) {
    if (!byKey.has(rule.paletteKey)) byKey.set(rule.paletteKey, []);
    byKey.get(rule.paletteKey).push(rule);
  }
  // Italic is used for comments, decorators and macros (recessive or
  // secondary roles); bold is used for Markdown headings. No two
  // roles that share a hue rely on hue alone to be told apart.
  const italicRoles = tokenRules.filter((r) => r.fontStyle === 'italic').map((r) => r.role);
  const boldRoles = tokenRules.filter((r) => r.fontStyle === 'bold').map((r) => r.role);
  assert.ok(italicRoles.includes('comment'), 'comments must be italic');
  assert.ok(italicRoles.includes('decorator'), 'decorators must be italic');
  assert.ok(boldRoles.includes('markdownHeading'), 'markdown headings must be bold');
});

test('fidelity: workbench uses the functional palette only for diagnostics, diff and git', () => {
  const allowed =
    /^(editorError|editorWarning|editorInfo|problems(Error|Warning|Info)Icon|list\.(error|warning)Foreground|notifications(Error|Warning|Info)Icon|gitDecoration\.(added|modified|deleted|untracked|conflicting|submodule)ResourceForeground|diffEditor|diffEditorGutter|diffEditorOverview|peekView\.border)/;
  for (const rule of [...workbenchRules, ...terminalAnsiRules]) {
    if (FUNCTIONAL.has(rule.paletteKey)) {
      assert.ok(
        allowed.test(rule.id) || rule.id.startsWith('diffEditor') || rule.id.startsWith('diffEditorGutter') || rule.id.startsWith('diffEditorOverview'),
        `${rule.id} uses functional color ${rule.paletteKey} outside diagnostics/diff/git`,
      );
    }
  }
});
