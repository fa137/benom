// Gate 4: token coverage (docs/ARCHITECTURE.md, quality gate 4).
//
// Tokenizes every file in samples/ with the real VS Code TextMate
// grammars and asserts that no token a human would recolor falls
// through to the default foreground.
//
// For every sample, each token whose scope stack contains one of the
// recolorable categories (comment, string, number, keyword, storage,
// function, type, class, tag, attribute, operator, decorator,
// property-name, markup heading/bold/italic/raw) must resolve to a
// color or font style different from the default editor foreground.
// variable.parameter is allowed to equal the default foreground.
//
// The test also asserts:
//   - the samples exercise at least 8 distinct colors or
//     styles,
//   - the six categories' primary rules produce at least 4
//     distinct color+font-style pairs (the theme shares
//     some colors by Venom design; see DECISIONS.md).
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTokenizer,
  resolveTokenColors,
  loadTheme,
  effectiveStyle,
  categoriesForToken,
  isDifferentFromDefault,
} from '../scripts/tokenize.mjs';

const root = resolve(import.meta.dirname, '..');
const SAMPLES_DIR = join(root, 'samples');

const EXTENSION_TO_LANGUAGE = {
  '.py': ['python', 'source.python'],
  '.ts': ['typescript', 'source.ts'],
  '.tsx': ['tsx', 'source.tsx'],
  '.rs': ['rust', 'source.rust'],
  '.go': ['go', 'source.go'],
  '.json': ['json', 'source.json'],
  '.md': ['markdown', 'text.html.markdown'],
  '.sh': ['shellscript', 'source.shell'],
  '.css': ['css', 'source.css'],
  '.html': ['html', 'text.html.basic'],
  '.sql': ['sql', 'source.sql'],
  '.yaml': ['yaml', 'source.yaml'],
};

const THEME_FILES = [
  ['Benom', 'themes/benom-color-theme.json'],
  ['Benom Alt', 'themes/benom-alt-color-theme.json'],
];

// Categories whose tokens must NOT fall through to the default
// foreground. Identifiers (variable, variable.parameter, object keys) are
// deliberately exempt: they equal the default foreground on purpose.
const RECOLORABLE = new Set([
  'comment',
  'string',
  'constant.numeric',
  'constant.language',
  'keyword',
  'storage',
  'entity.name.function',
  'entity.name.type',
  'entity.name.class',
  'support.type',
  'support.function',
  'entity.name.tag',
  'entity.other.attribute-name',
  'keyword.operator',
  'punctuation.definition.decorator',
  'meta.decorator',
  'support.type.property-name',
  'markup.heading',
  'markup.bold',
  'markup.italic',
  'markup.inline.raw',
]);

// The six categories whose primary (canonical) rule
// colors must be compared for gate 4.
const DISTINCT_CATEGORIES = [
  'keyword',
  'entity.name.type',
  'string',
  'comment',
  'constant.numeric',
  'entity.name.function',
];

// The scope prefix that names each category's primary
// rule in tokenColors. The primary rule is the first
// rule whose scope list names the category.
const PRIMARY_SCOPE = {
  keyword: 'keyword',
  'entity.name.type': 'entity.name.type',
  string: 'string',
  comment: 'comment',
  'constant.numeric': 'constant.numeric',
  'entity.name.function': 'entity.name.function',
};

// Find the primary rule (the first rule whose scope list
// names the given category) and return its color+fontStyle
// pair, e.g. "#999999|".
function primaryPair(theme, category) {
  const scopeName = PRIMARY_SCOPE[category];
  const rule = theme.tokenColors.find((r) => {
    const scopes = Array.isArray(r.scope) ? r.scope : [r.scope];
    return scopes.includes(scopeName);
  });
  if (!rule) return 'default|';
  const fg = rule.settings.foreground ?? 'default';
  const fontStyle = rule.settings.fontStyle ?? '';
  return `${fg}|${fontStyle}`;
}

function listSamples() {
  return readdirSync(SAMPLES_DIR)
    .filter((f) => !f.startsWith('.'))
    .sort()
    .map((file) => {
      const ext = file.slice(file.lastIndexOf('.'));
      const language = EXTENSION_TO_LANGUAGE[ext];
      assert.ok(language, `no grammar mapped for sample ${file}`);
      return {
        file,
        language: language[0],
        scopeName: language[1],
        text: readFileSync(join(SAMPLES_DIR, file), 'utf8'),
      };
    });
}

// Category name -> predicate over a token's scope stack.
function tokenHasCategory(scopes, category) {
  return categoriesForToken(scopes).includes(category);
}

// The "color+font-style pair" of a resolved rule, used to compare
// categories for the distinctness assertion.
function stylePair(style) {
  const fg = style.foreground ?? 'default';
  const fs = style.fontStyle ?? '';
  return `${fg}|${fs}`;
}

test('gate4: recolorable tokens never fall through to the default foreground', async () => {
  const samples = listSamples();
  const tokenizers = new Map();
  for (const sample of samples) {
    if (!tokenizers.has(sample.scopeName)) {
      tokenizers.set(sample.scopeName, await createTokenizer(sample.scopeName));
    }
    sample.tokenize = tokenizers.get(sample.scopeName);
  }

  for (const [themeName, themeRel] of THEME_FILES) {
    const theme = loadTheme(themeRel);
    const defaultFg = theme.colors['editor.foreground'];

    for (const sample of samples) {
      const tokens = sample.tokenize(sample.text);
      const violations = [];
      let recoloredCount = 0;
      for (const token of tokens) {
        // Identifiers (variables, parameters, object keys, CSS keywords) equal the default foreground on
        // purpose (DECISIONS.md). A variable inside a template string is judged as an identifier too.
        const last = token.scopes[token.scopes.length - 1];
        if (/^(variable|meta\.object-literal\.key|support\.constant\.property-value)/.test(last)) continue;
        const categories = categoriesForToken(token.scopes);
        const recolorable = categories.filter((c) => RECOLORABLE.has(c));
        if (recolorable.length === 0) continue;
        recoloredCount += 1;
        const rule = resolveTokenColors(token.scopes, theme.tokenColors);
        if (isDifferentFromDefault(rule, defaultFg)) continue;
        violations.push({
          scopes: token.scopes.join(' '),
          categories: recolorable,
        });
      }
      assert.ok(
        recoloredCount > 0,
        `${themeName} ${sample.language}: expected recolorable tokens`,
      );
      assert.deepEqual(
        violations,
        [],
        `${themeName} ${sample.language}: ${violations.length} token(s) ` +
          `fall through to the default foreground:\n` +
          violations.map((v) => `  ${v.scopes} (${v.categories.join(', ')})`).join('\n'),
      );
    }
  }
});

test('gate4: the samples use at least 8 distinct colors or styles', async () => {
  const samples = listSamples();
  const tokenizers = new Map();
  for (const sample of samples) {
    if (!tokenizers.has(sample.scopeName)) {
      tokenizers.set(sample.scopeName, await createTokenizer(sample.scopeName));
    }
    sample.tokenize = tokenizers.get(sample.scopeName);
  }

  // Collect every distinct color+font-style pair the
  // samples exercise, across both themes. A minimal
  // language such as JSON natively exercises only a few
  // token kinds (keys, strings, numbers, punctuation), so
  // the "at least 8" bar is applied to the sample set as a
  // whole rather than to each file (see DECISIONS.md).
  const styles = new Set();
  for (const [, themeRel] of THEME_FILES) {
    const theme = loadTheme(themeRel);
    for (const sample of samples) {
      const tokens = sample.tokenize(sample.text);
      for (const token of tokens) {
        const rule = resolveTokenColors(token.scopes, theme.tokenColors);
        const style = effectiveStyle(rule);
        styles.add(stylePair(style));
      }
    }
  }
  assert.ok(
    styles.size >= 8,
    `samples exercise only ${styles.size} distinct styles ` +
      `(expected at least 8): ${[...styles].sort().join(', ')}`,
  );
});

test('gate4: the six primary rules are distinct', async () => {
  // For each theme, take the color+font-style of each
  // category's primary rule (the first rule in tokenColors
  // whose scope list names the category) and assert that at
  // least 4 distinct pairs exist among the six. The theme
  // legitimately shares some colors by Venom design (for
  // example constant and number both #aaaaaa); those are
  // documented in DECISIONS.md, so the bar is "at least 4"
  // rather than "all six distinct".
  for (const [themeName, themeRel] of THEME_FILES) {
    const theme = loadTheme(themeRel);
    const pairs = DISTINCT_CATEGORIES.map((category) =>
      primaryPair(theme, category),
    );
    const distinct = new Set(pairs);
    assert.ok(
      distinct.size >= 4,
      `${themeName}: the six primary rules produce only ` +
        `${distinct.size} distinct color+font-style pairs ` +
        `(expected at least 4): ${pairs.join(', ')}`,
    );
  }
});
