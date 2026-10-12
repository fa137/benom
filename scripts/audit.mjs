#!/usr/bin/env node
// Benom: token coverage audit (work item 3, gate 4).
//
// Tokenizes every file in samples/ with the real VS Code TextMate
// grammars (from tm-grammars) and resolves each token through both
// generated themes using VS Code's longest-scope-match rules.
//
// The report is human-readable and deterministic: languages, scopes
// and colors are sorted, counts are stable. For each language it
// prints, per theme:
//   - how many tokens resolve to each theme color (or font style),
//   - the distinct scopes that fall through to the default
//     foreground (no matching rule).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  createTokenizer,
  resolveTokenColors,
  loadTheme,
  effectiveStyle,
  categoriesForToken,
} from './tokenize.mjs';

const root = process.env.BENOM_ROOT
  ? resolve(process.env.BENOM_ROOT)
  : resolve(import.meta.dirname, '..');
import { resolve } from 'node:path';

const SAMPLES_DIR = join(root, 'samples');

// Language label -> grammar scope name. The file extension picks
// the grammar; the label is what the report prints.
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

function listSamples() {
  const files = readdirSync(SAMPLES_DIR)
    .filter((f) => !f.startsWith('.'))
    .sort();
  const samples = [];
  for (const file of files) {
    const ext = file.slice(file.lastIndexOf('.'));
    const language = EXTENSION_TO_LANGUAGE[ext];
    if (!language) {
      throw new Error(`no grammar mapped for sample ${file} (extension ${ext})`);
    }
    samples.push({
      file,
      language: language[0],
      scopeName: language[1],
      text: readFileSync(join(SAMPLES_DIR, file), 'utf8'),
    });
  }
  return samples;
}

/**
 * Audit one sample against one theme. Returns
 * { colorCounts, defaultScopes, categoryColors } where
 * colorCounts maps "color fontStyle" -> token count, defaultScopes
 * is the sorted set of scopes that matched no rule, and
 * categoryColors maps category -> sorted set of "color fontStyle".
 */
function auditSample(sample, theme) {
  const tokenize = sample.tokenize;
  const tokens = tokenize(sample.text);
  const colorCounts = new Map();
  const defaultScopes = new Set();
  const categoryColors = new Map();

  for (const token of tokens) {
    const rule = resolveTokenColors(token.scopes, theme.tokenColors);
    const style = effectiveStyle(rule);
    const key = styleKey(style);
    colorCounts.set(key, (colorCounts.get(key) ?? 0) + 1);

    if (!rule) {
      for (const scope of token.scopes) defaultScopes.add(scope);
    }

    for (const category of categoriesForToken(token.scopes)) {
      if (!categoryColors.has(category)) categoryColors.set(category, new Set());
      categoryColors.get(category).add(key);
    }
  }

  return {
    colorCounts: sortMap(colorCounts),
    defaultScopes: [...defaultScopes].sort(),
    categoryColors: sortMapOfSets(categoryColors),
  };
}

function styleKey(style) {
  const fg = style.foreground ?? 'default';
  const fs = style.fontStyle ?? '';
  return fs ? `${fg} ${fs}` : fg;
}

function sortMap(map) {
  return [...map.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

function sortMapOfSets(map) {
  const out = {};
  for (const [k, v] of sortMap(map)) {
    out[k] = [...v].sort();
  }
  return out;
}

async function main() {
  const samples = listSamples();
  // Load grammars once per language and reuse across themes.
  const tokenizers = new Map();
  for (const sample of samples) {
    if (!tokenizers.has(sample.scopeName)) {
      tokenizers.set(sample.scopeName, await createTokenizer(sample.scopeName));
    }
    sample.tokenize = tokenizers.get(sample.scopeName);
  }

  const out = [];
  out.push('benom token coverage audit');
  out.push('==========================');
  out.push('');
  out.push(`samples: ${samples.length} files in samples/`);
  out.push(`themes:  ${THEME_FILES.map(([name]) => name).join(', ')}`);
  out.push('');

  for (const [themeName, themeRel] of THEME_FILES) {
    const theme = loadTheme(themeRel);
    out.push(`## ${themeName} (${themeRel})`);
    out.push('');
    for (const sample of samples) {
      const result = auditSample(sample, theme);
      out.push(`### ${sample.language} (${sample.file})`);
      out.push('');
      out.push('tokens per theme color / font style:');
      for (const [key, count] of result.colorCounts) {
        out.push(`  ${count.toString().padStart(5)}  ${key}`);
      }
      out.push('');
      if (result.defaultScopes.length) {
        out.push('scopes falling through to the default foreground:');
        for (const scope of result.defaultScopes) {
          out.push(`  ${scope}`);
        }
      } else {
        out.push('no scopes fall through to the default foreground');
      }
      out.push('');
    }
  }

  process.stdout.write(out.join('\n') + '\n');
}

main().catch((e) => {
  process.stderr.write(`audit failed: ${e.stack}\n`);
  process.exit(1);
});
