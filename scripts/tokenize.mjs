// Benom: shared tokenizer for the coverage audit (work item 3).
//
// Single source of truth for grammar loading, oniguruma WASM
// initialization and TextMate scope resolution. Imported by both
// scripts/audit.mjs and test/coverage.test.mjs so the audit
// report and the gate-4 assertions always agree.
//
// The scope resolution mirrors VS Code's longest-scope-match rules
// (the same algorithm vscode-textmate uses internally):
//   - a selector matches a scope stack when every selector segment
//     can be matched, in order, by a scope on the stack (a scope
//     matches a segment when it equals the segment or is a
//     descendant, i.e. segment + "." + more);
//   - among matching rules, the one whose matching scope on the
//     stack has the most dot-separated segments wins;
//   - on a tie the rule that appears later in the theme's
//     tokenColors array wins (VS Code sorts the parsed rules and
//     later-index rules are applied last).
//
// Zero dependencies on VS Code internals: the grammar objects are
// loaded from tm-grammars and the theme JSON is read from disk.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import textmate from 'vscode-textmate';
import oniguruma from 'vscode-oniguruma';

const { Registry, INITIAL } = textmate;
const { loadWASM, createOnigScanner, createOnigString } = oniguruma;

const root = process.env.BENOM_ROOT
  ? resolve(process.env.BENOM_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Grammars (tm-grammars)
// ---------------------------------------------------------------------------

// Scope name -> grammar file, for every language the audit covers.
// tm-grammars ships one JSON file per grammar under
// node_modules/tm-grammars/grammars/. The map is built by
// reading each grammar's `scopeName` field, so embedded and
// injected grammars (source.js inside html, css inside
// markdown, ...) resolve to the right file too.
const GRAMMAR_DIR = join(root, 'node_modules/tm-grammars/grammars');

// The languages the audit tokenizes directly, in a stable order.
const AUDIT_LANGUAGES = [
  ['python', 'source.python'],
  ['typescript', 'source.ts'],
  ['tsx', 'source.tsx'],
  ['rust', 'source.rust'],
  ['go', 'source.go'],
  ['json', 'source.json'],
  ['markdown', 'text.html.markdown'],
  ['shellscript', 'source.shell'],
  ['css', 'source.css'],
  ['html', 'text.html.basic'],
  ['sql', 'source.sql'],
  ['yaml', 'source.yaml'],
];

// scopeName -> file name, built once from the grammar files.
let scopeToFileCache = null;

function scopeToFileMap() {
  if (scopeToFileCache) return scopeToFileCache;
  const map = new Map();
  for (const file of readdirSync(GRAMMAR_DIR)) {
    if (!file.endsWith('.json')) continue;
    try {
      const grammar = JSON.parse(readFileSync(join(GRAMMAR_DIR, file), 'utf8'));
      if (grammar.scopeName) map.set(grammar.scopeName, file);
    } catch {
      // skip unreadable grammar files
    }
  }
  scopeToFileCache = map;
  return map;
}

/** Resolve a scope name to its tm-grammars file name. */
function scopeToFileName(scopeName) {
  const map = scopeToFileMap();
  return map.get(scopeName);
}

// ---------------------------------------------------------------------------
// Oniguruma WASM (vscode-oniguruma)
// ---------------------------------------------------------------------------

let onigurumaReady = null;

/**
 * Initialize the oniguruma WASM engine exactly once, reading the
 * wasm binary from the vscode-oniguruma package on disk.
 */
function initOniguruma() {
  if (onigurumaReady) return onigurumaReady;
  const wasmPath = join(root, 'node_modules/vscode-oniguruma/release/onig.wasm');
  const wasmBin = readFileSync(wasmPath);
  onigurumaReady = loadWASM(wasmBin.buffer);
  return onigurumaReady;
}

// ---------------------------------------------------------------------------
// Longest-scope-match resolution (VS Code semantics)
// ---------------------------------------------------------------------------

/**
 * Does a single scope (e.g. "keyword.control") match a selector
 * segment (e.g. "keyword")? A scope matches a segment when it equals
 * the segment or is a descendant of it.
 */
function scopeMatchesSegment(scope, segment) {
  if (scope === segment) return true;
  return scope.startsWith(segment) && scope[segment.length] === '.';
}

/**
 * Does a selector (e.g. "keyword.control") match a scope stack
 * (array of scopes, outermost first)? Every segment of the selector
 * must match a scope on the stack, in order.
 */
function selectorMatchesStack(selectorSegments, scopeStack) {
  let stackIndex = 0;
  for (const segment of selectorSegments) {
    let matched = false;
    for (let i = stackIndex; i < scopeStack.length; i++) {
      if (scopeMatchesSegment(scopeStack[i], segment)) {
        stackIndex = i + 1;
        matched = true;
        break;
      }
    }
    if (!matched) return false;
  }
  return true;
}

/**
 * The number of dot-separated segments in the scope on the stack
 * that the selector's LAST segment matched. This is the specificity
 * VS Code compares: the deepest matching scope wins.
 */
function matchDepth(selectorSegments, scopeStack) {
  let stackIndex = 0;
  let lastMatchIndex = -1;
  for (const segment of selectorSegments) {
    for (let i = stackIndex; i < scopeStack.length; i++) {
      if (scopeMatchesSegment(scopeStack[i], segment)) {
        stackIndex = i + 1;
        lastMatchIndex = i;
        break;
      }
    }
  }
  if (lastMatchIndex === -1) return -1;
  return scopeStack[lastMatchIndex].split('.').length;
}

/**
 * Resolve a scope stack against a theme's tokenColors using VS
 * Code's longest-scope-match rules. Returns the winning
 * { settings, ruleIndex } or null when nothing matches (the
 * default editor foreground applies).
 */
export function resolveTokenColors(scopeStack, tokenColors) {
  let best = null;
  let bestDepth = -1;
  for (let i = 0; i < tokenColors.length; i++) {
    const rule = tokenColors[i];
    const selectors = expandScopes(rule.scope);
    for (const selector of selectors) {
      const selectorSegments = selector.split(' ');
      if (!selectorMatchesStack(selectorSegments, scopeStack)) continue;
      const depth = matchDepth(selectorSegments, scopeStack);
      // Longest match wins; on a tie the later rule wins.
      if (depth > bestDepth || (depth === bestDepth && best !== null)) {
        bestDepth = depth;
        best = { settings: rule.settings, ruleIndex: i };
      }
    }
  }
  return best;
}

/** A theme rule's scope may be a string, an array, or comma-joined. */
function expandScopes(scope) {
  if (typeof scope === 'string') {
    return scope.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(scope)) return scope;
  return [];
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

/**
 * Load a grammar by scope name (and its embedded dependencies) and
 * return a function that tokenizes a full document into
 * { text, scopes } tokens.
 */
export async function createTokenizer(scopeName) {
  await initOniguruma();

  const registry = new Registry({
    onigLib: Promise.resolve({ createOnigScanner, createOnigString }),
    loadGrammar: (requestedScope) => {
      // Resolve the requested scope to a grammar file from
      // tm-grammars. Unknown scopes (injected grammars that
      // are not in the package) resolve to null and are
      // skipped by vscode-textmate.
      const file = scopeToFileName(requestedScope);
      if (!file) return Promise.resolve(null);
      try {
        const text = readFileSync(join(GRAMMAR_DIR, file), 'utf8');
        return Promise.resolve(JSON.parse(text));
      } catch {
        return Promise.resolve(null);
      }
    },
  });

  const grammar = await registry.loadGrammar(scopeName);
  if (!grammar) {
    throw new Error(`could not load grammar for ${scopeName}`);
  }

  return function tokenize(text) {
    const tokens = [];
    let ruleStack = INITIAL;
    const lines = text.split('\n');
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const result = grammar.tokenizeLine(line, ruleStack);
      for (const token of result.tokens) {
        const textPart = line.substring(token.startIndex, token.endIndex);
        if (textPart.length === 0) continue;
        tokens.push({ text: textPart, scopes: token.scopes });
      }
      ruleStack = result.ruleStack;
    }
    return tokens;
  };
}

// ---------------------------------------------------------------------------
// Category mapping (gate 4)
// ---------------------------------------------------------------------------

/**
 * Map a raw TextMate scope stack to a human category for the
 * gate-4 test. The test asserts every token in these categories
 * resolves to a non-default color or font style.
 */
export const CATEGORIES = [
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
];

// A category is satisfied when any scope on the stack contains it
// as a dot-segment (so "keyword.operator" satisfies "keyword").
function scopeStackContains(scopeStack, category) {
  for (const scope of scopeStack) {
    for (const segment of scope.split('.')) {
      // Match the full dotted path of the category against the
      // scope's segments from the start.
      const categorySegments = category.split('.');
      const scopeSegments = scope.split('.');
      if (scopeSegments.length < categorySegments.length) continue;
      let ok = true;
      for (let i = 0; i < categorySegments.length; i++) {
        if (scopeSegments[i] !== categorySegments[i]) { ok = false; break; }
      }
      if (ok) return true;
    }
  }
  return false;
}

/**
 * The category (or categories) a token belongs to. Returns an
 * array of category names that the token's scope stack satisfies.
 */
export function categoriesForToken(scopes) {
  const result = [];
  for (const category of CATEGORIES) {
    if (scopeStackContains(scopes, category)) result.push(category);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Theme loading
// ---------------------------------------------------------------------------

/**
 * Load a generated theme's tokenColors from the repo. Returns the
 * parsed theme object.
 */
export function loadTheme(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

/** The default editor foreground for a theme (editor.foreground). */
export function defaultForeground(theme) {
  return theme.colors['editor.foreground'];
}

/**
 * The effective style of a resolved token rule: its foreground
 * color (or null when the rule does not set one) and its font
 * style (or null when unset).
 */
export function effectiveStyle(rule) {
  if (!rule) return { foreground: null, fontStyle: null };
  const foreground = rule.settings.foreground ?? null;
  const fontStyle = rule.settings.fontStyle ?? null;
  return { foreground, fontStyle };
}

/**
 * Is a resolved style different from the default editor foreground?
 * A style counts as different when its foreground color differs from
 * the default OR its font style is set (italic/bold/underline/...).
 */
export function isDifferentFromDefault(rule, defaultFg) {
  const { foreground, fontStyle } = effectiveStyle(rule);
  if (fontStyle) return true;
  if (foreground && foreground.toUpperCase() !== defaultFg.toUpperCase()) return true;
  return false;
}
