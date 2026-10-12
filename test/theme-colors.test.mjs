// Regression tests for the theme JSON color shapes that VS Code
// silently ignores when wrong (review round 1):
//   1. every tokenColors settings.foreground and every
//      semanticTokenColors foreground must match
//      /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/ (a bare RRGGBB value
//      is ignored by VS Code and syntax falls back to default grey).
//   2. semanticTokenColors must be a plain OBJECT mapping a token
//      selector to a style, not an array of {name, scope, settings}.
//   3. tokenColors scopes are strings or arrays of non-empty
//      strings, and settings only contain foreground and fontStyle.
//   4. the theme JSON has top-level name, type "dark", colors
//      (object), tokenColors (array), semanticTokenColors (object).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(import.meta.dirname, '..');

const THEME_FILES = [
  'themes/benom-color-theme.json',
  'themes/benom-alt-color-theme.json',
];

const FOREGROUND_RE = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;

function loadTheme(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

for (const rel of THEME_FILES) {
  test(`${rel}: top-level shape`, () => {
    const theme = loadTheme(rel);
    assert.equal(typeof theme.name, 'string', 'name must be a string');
    assert.equal(theme.type, 'dark', 'type must be "dark"');
    assert.equal(typeof theme.colors, 'object', 'colors must be an object');
    assert.ok(!Array.isArray(theme.colors), 'colors must not be an array');
    assert.ok(Array.isArray(theme.tokenColors), 'tokenColors must be an array');
    assert.equal(
      typeof theme.semanticTokenColors,
      'object',
      'semanticTokenColors must be an object',
    );
    assert.ok(
      !Array.isArray(theme.semanticTokenColors),
      'semanticTokenColors must be an object, not an array',
    );
    assert.equal(theme.semanticHighlighting, true,
      'semanticHighlighting must be true');
  });

  test(`${rel}: every tokenColors foreground is "#RRGGBB"`, () => {
    const theme = loadTheme(rel);
    for (const entry of theme.tokenColors) {
      assert.ok(entry.settings && typeof entry.settings.foreground === 'string',
        `missing foreground in ${JSON.stringify(entry)}`);
      assert.match(entry.settings.foreground, FOREGROUND_RE,
        `foreground must match #RRGGBB: ${entry.settings.foreground}`);
    }
  });

  test(`${rel}: tokenColors scopes are strings or arrays of non-empty strings`, () => {
    const theme = loadTheme(rel);
    for (const entry of theme.tokenColors) {
      const scope = entry.scope;
      if (typeof scope === 'string') {
        assert.ok(scope.length > 0, 'string scope must be non-empty');
      } else {
        assert.ok(Array.isArray(scope), 'scope must be a string or array');
        assert.ok(scope.length > 0, 'scope array must be non-empty');
        for (const s of scope) {
          assert.equal(typeof s, 'string', 'scope entries must be strings');
          assert.ok(s.length > 0, 'scope entries must be non-empty');
        }
      }
    }
  });

  test(`${rel}: tokenColors settings only contain foreground and fontStyle`, () => {
    const theme = loadTheme(rel);
    for (const entry of theme.tokenColors) {
      for (const key of Object.keys(entry.settings)) {
        assert.ok(key === 'foreground' || key === 'fontStyle',
          `unexpected settings key ${key}`);
      }
    }
  });

  test(`${rel}: semanticTokenColors values are objects with only foreground/fontStyle`, () => {
    const theme = loadTheme(rel);
    const semantic = theme.semanticTokenColors;
    for (const [selector, style] of Object.entries(semantic)) {
      assert.ok(selector.length > 0, 'selector must be non-empty');
      assert.equal(typeof style, 'object', `style for ${selector} must be an object`);
      assert.ok(style !== null && !Array.isArray(style),
        `style for ${selector} must be a plain object`);
      for (const key of Object.keys(style)) {
        assert.ok(key === 'foreground' || key === 'fontStyle',
          `unexpected style key ${key} for ${selector}`);
      }
      assert.match(style.foreground, FOREGROUND_RE,
        `foreground for ${selector} must match #RRGGBB: ${style.foreground}`);
    }
  });
}
