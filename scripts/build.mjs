#!/usr/bin/env node
// Benom build: zero-dependency theme generator.
//
// Reads src/palette.json, src/tokens.mjs and src/workbench.mjs, lifts any color
// below its contrast target to the nearest lighter shade of the same hue, and
// writes:
//   themes/benom-color-theme.json       (base variant, editor #191919, UI #050505, terminal #0d0d0d)
//   themes/benom-alt-color-theme.json   (alt variant, editor #251e1d, UI #070504, terminal #141110)
//
// Each variant has three backgrounds: the editor-area background, shifted
// from the original Venom background (10% lighter then 3% darker on
// base, 23% darker
// then 5% lighter on alt) and used for the editor canvas and editor-only
// areas (see
// EDITOR_AREAS); the terminal background, the editor background shifted
// darker (50% on base, 45% on alt) for a distinct terminal
// surface; and the UI background, shifted the same way as the
// editor (2% lighter on base, 80% darker on alt) and used for the
// sidebar, panels, title bar, status bar, widgets and inputs.
//   DECISIONS.md                        (generated section between stable markers)
//
// The build is deterministic: no timestamps, no randomness, fixed iteration
// order. Running it twice produces byte-identical output (gate 5).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenRules, semanticTokenRules } from '../src/tokens.mjs';
import { workbenchRules, terminalAnsiRules, MIX_FOREGROUND, CHROME_T } from '../src/workbench.mjs';

const root = process.env.BENOM_ROOT
  ? resolve(process.env.BENOM_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

/** Parse "#rrggbb" into [r, g, b] (0-255). */
export function parseHex(hex) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
    throw new Error(`invalid hex color: ${hex}`);
  }
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Format [r, g, b] (0-255) as "#rrggbb". */
export function toHex([r, g, b]) {
  const c = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toLowerCase();
}

/** RGB (0-255) to HSL. h in [0,360), s and l in [0,1]. */
export function rgbToHsl([r, g, b]) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
    case gn: h = ((bn - rn) / d + 2); break;
    default: h = ((rn - gn) / d + 4);
  }
  return [h * 60, s, l];
}

/** HSL (h in [0,360), s and l in [0,1]) to RGB (0-255). */
export function hslToRgb([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rn, gn, bn;
  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return [(rn + m) * 255, (gn + m) * 255, (bn + m) * 255];
}

/** WCAG relative luminance (https://www.w3.org/TR/WCAG20-TECHS/G17.html). */
export function relativeLuminance(hex) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = parseHex(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1-21). */
export function contrast(a, b) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Lift a color to the nearest lighter shade of the same hue that meets the
 * target contrast against `background`.
 *
 * The palette may declare explicit lighter shades for a key under
 * `lighter_shades`; those are preferred (snap to the first that meets the
 * target). Otherwise lightness is raised in small fixed steps (HSL), keeping
 * hue and saturation fixed, until the target is met. Deterministic: fixed step
 * size, fixed cap, no randomness.
 */
export function liftColor(hex, background, target, lighterShades) {
  if (contrast(hex, background) >= target) {
    return { hex, lifted: false, steps: 0 };
  }
  // Prefer an explicit lighter shade from the palette if one meets the target.
  if (lighterShades && lighterShades.length) {
    const snap = lighterShades.find((c) => contrast(c, background) >= target);
    if (snap) return { hex: snap, lifted: true, steps: 1, snapped: true };
  }
  const [h, s, l] = rgbToHsl(parseHex(hex));
  const STEP = 0.01;
  for (let nl = l + STEP; nl <= 1; nl += STEP) {
    const candidate = toHex(hslToRgb([h, s, nl]));
    if (contrast(candidate, background) >= target) {
      return { hex: candidate, lifted: true, steps: Math.round((nl - l) / STEP) };
    }
  }
  // Fall back to white if nothing meets the target (unreachable for our targets).
  return { hex: '#ffffff', lifted: true, steps: Math.round((1 - l) / STEP) };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const VARIANTS = [
  { key: 'base', name: 'Benom', background: mix(mix('#000000', '#ffffff', 0.10), '#000000', 0.03), uiBackground: mix('#000000', '#ffffff', 0.02), terminal: mix(mix(mix('#000000', '#ffffff', 0.10), '#000000', 0.03), '#000000', 0.50) },
  { key: 'alt', name: 'Benom Alt', background: mix(mix('#211816', '#000000', 0.23), '#ffffff', 0.05), uiBackground: mix('#211816', '#000000', 0.80), terminal: mix(mix(mix('#211816', '#000000', 0.23), '#ffffff', 0.05), '#000000', 0.45) },
];

// Roles whose background is the editor-area background. Every other
// 'area' role uses the UI background; the terminal background is its
// own per-variant value (see VARIANTS.terminal).
export const EDITOR_AREAS = new Set([
  'editor.background',
  'editorGutter.background',
  'editorGroup.emptyBackground',
  'tab.activeBackground',
  'breadcrumb.background',
  'peekViewEditor.background',
  'peekViewEditorGutter.background',
  'editorInlayHint.background',
  'diffEditor.diagonalFill',
]);

// Contrast targets (docs/ARCHITECTURE.md). Roles not listed here use the
// default of 4.5 unless a rule sets `target`.
const DEFAULT_TARGET = 4.5;
const COMMENT_TARGET = 4.0;

function loadJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

/** Palette value for a key (core or functional_additions). */
function paletteValue(paletteKey, palette) {
  if (paletteKey in palette.core) return palette.core[paletteKey];
  if (paletteKey in palette.functional_additions) return palette.functional_additions[paletteKey];
  throw new Error(`unknown palette key: ${paletteKey}`);
}

/**
 * Resolve a text color for a variant, applying the lift pass.
 * `against` is the hex color the contrast is measured against (the
 * variant background by default). Returns { hex, lifted, before }.
 */
function resolveTextColor(paletteKey, variant, palette, liftCache, target, against) {
  const bg = against ?? variant.background;
  const cacheKey = `text:${paletteKey}:${variant.key}:${target}:${bg}`;
  if (liftCache.has(cacheKey)) return liftCache.get(cacheKey);
  const hex = paletteValue(paletteKey, palette);
  const before = hex;
  const lighterShades = palette.lighter_shades?.[paletteKey];
  const result = { ...liftColor(hex, bg, target, lighterShades), before };
  liftCache.set(cacheKey, result);
  return result;
}

/** Mix two hex colors in sRGB: mix(a, b, t) = a*(1-t) + b*t. */
export function mix(a, b, t) {
  const pa = parseHex(a), pb = parseHex(b);
  return toHex(pa.map((v, i) => v * (1 - t) + pb[i] * t));
}

/**
 * Build one variant. Every workbench key has a CLASS:
 * - text:    lifted by contrast (target vs the surface it sits on).
 * - surface: mix(background, foreground, t) — never lifted.
 * - line:    mix(background, foreground, t) — never lifted.
 * - chrome:  mix(uiBackground, #000000, 0.25).
 * - area:    the editor-area background for EDITOR_AREAS roles, the UI
 *            background for every other area.
 * - accent:  the palette color, used as-is (fidelity).
 * - tint:    mix(paletteColor, editorBackground, t) — diff text/line
 *            backgrounds, tinted so the editor foreground stays
 *            readable on top.
 *
 * For surface and line roles, `background` is the editor-area background
 * for editor.* and EDITOR_AREAS roles, and the UI background otherwise.
 *
 * Returns { colors, tokenColors, semanticTokenColors, surfaceLog } where
 * surfaceLog lists the derived surface/line roles with their t and ratios.
 */
function buildVariant(variant, palette, textLiftLog, surfaceLog) {
  const liftCache = new Map();
  const colors = {};

  // The mix foreground is the Venom fg, used to derive surfaces/lines.
  const mixFg = palette.core[MIX_FOREGROUND];

  // Pass 1: every role whose contrast is measured against the variant
  // background (the default), plus all non-text classes.
  for (const rule of workbenchRules) {
    if (rule.id in colors) {
      throw new Error(`duplicate workbench id: ${rule.id}`);
    }
    if (rule.against) continue; // resolved in pass 2
    colors[rule.id] = deriveColor(rule, variant, palette, liftCache, mixFg, textLiftLog, surfaceLog);
  }

  // Pass 2: text roles measured against another color (for example
  // the selected text against the selection surface).
  for (const rule of workbenchRules) {
    if (!rule.against) continue;
    const surface = colors[rule.against];
    if (!surface) {
      throw new Error(`${rule.id} references unknown surface ${rule.against}`);
    }
    colors[rule.id] = deriveColor(rule, variant, palette, liftCache, mixFg, textLiftLog, surfaceLog, surface);
  }

  // Terminal ANSI colors from Venom's colormap (accents, as-is), with one
  // exception: ANSI black is derived, because Venom's colormap black
  // (#211816) is nearly invisible on dark terminal backgrounds. Mix the
  // terminal background 35% toward black when it is light (luminance
  // above 0.15) and toward the text color when it is dark (base #0d0d0d →
  // #4c4c4c, alt #141110 → #514f4e), so "black" always reads as a step
  // away from the terminal
  // background.
  const terminalBg = variant.terminal;
  const ansiBlack = mix(terminalBg, relativeLuminance(terminalBg) > 0.15 ? '#000000' : mixFg, 0.35);
  for (const rule of terminalAnsiRules) {
    if (rule.id in colors) {
      throw new Error(`duplicate terminal id: ${rule.id}`);
    }
    colors[rule.id] = rule.id === 'terminal.ansiBlack'
      ? ansiBlack
      : paletteValue(rule.paletteKey, palette);
  }

  // Force the variant's editor background to the documented value.
  colors['editor.background'] = variant.background;

  // Token colors (TextMate): lifted by contrast against the variant
  // background (comments to 4.0, everything else to 4.5).
  // Every foreground carries the leading '#' — VS Code ignores a bare
  // RRGGBB value and the syntax color would fall back to default grey.
  const tokenColors = [];
  for (const rule of tokenRules) {
    const target = rule.paletteKey === 'comment' ? COMMENT_TARGET : DEFAULT_TARGET;
    const resolved = resolveTextColor(rule.paletteKey, variant, palette, liftCache, target);
    // Per-variant accent darkening (see ACCENT_DARKEN): applied after the
    // contrast lift so the tone-down is visible and not re-lifted away.
    const darken = ACCENT_DARKEN[variant.key]?.[rule.role];
    const hex = darken ? mix(resolved.hex, '#000000', darken) : resolved.hex;
    const entry = {
      scope: rule.scopes,
      settings: { foreground: hex.toUpperCase() },
    };
    if (rule.fontStyle) entry.settings.fontStyle = rule.fontStyle;
    tokenColors.push(entry);
    if (resolved.lifted) {
      textLiftLog.add(rule.role, resolved.before, resolved.hex, contrast(resolved.hex, variant.background), variant.key);
    }
  }

  // Semantic token colors: an object mapping a token selector to a style,
  // e.g. "type": { "foreground": "#FC302E" }. An array of {name, scope,
  // settings} entries is the wrong shape and VS Code silently ignores it.
  const semanticTokenColors = {};
  for (const rule of semanticTokenRules) {
    const target = rule.paletteKey === 'comment' ? COMMENT_TARGET : DEFAULT_TARGET;
    const resolved = resolveTextColor(rule.paletteKey, variant, palette, liftCache, target);
    const style = { foreground: resolved.hex.toUpperCase() };
    if (rule.fontStyle) style.fontStyle = rule.fontStyle;
    semanticTokenColors[rule.type] = style;
    if (resolved.lifted) {
      textLiftLog.add(`semantic:${rule.type}`, resolved.before, resolved.hex, contrast(resolved.hex, variant.background), variant.key);
    }
  }

  return { colors, tokenColors, semanticTokenColors };
}

/**
 * Per-variant darkening of accent token colors (mix toward black).
 *
 * Venom's bright red "type" accent (#FC302E, used for HTML/XML tags) reads
 * as a harsh orange on both dark editor backgrounds, so both variants
 * tone the tag role down by 25% (base #BD2423, alt #BD2C2A after the
 * contrast lift).
 */
const ACCENT_DARKEN = {
  base: { tag: 0.25 },
  alt: { tag: 0.25 },
};

/**
 * Per-variant overrides for surface mix factors (t).
 *
 * The base variant's editor background is #191919 (10% lighter, then
 * 3% darker), so the default line-highlight t (0.05) yields #212121,
 * which is nearly invisible on it. The base variant uses t 0.09 (about
 * #282828) instead.
 * The alt variant's editor background is #251e1d, which is dark for the
 * same reason, so it uses t 0.09 (about #332d2c) too.
 */
const SURFACE_T_OVERRIDES = {
  base: { 'editor.lineHighlightBackground': 0.09 },
  alt: { 'editor.lineHighlightBackground': 0.09 },
};

function surfaceT(rule, variant) {
  return SURFACE_T_OVERRIDES[variant.key]?.[rule.id] ?? rule.t;
}

/** Derive the color for a single workbench rule of any class. */
function deriveColor(rule, variant, palette, liftCache, mixFg, textLiftLog, surfaceLog, againstSurface) {
  switch (rule.class) {
    case 'text': {
      const target = rule.target ?? DEFAULT_TARGET;
      const resolved = resolveTextColor(rule.paletteKey, variant, palette, liftCache, target, againstSurface);
      if (resolved.lifted) {
        const bg = againstSurface ?? variant.background;
        textLiftLog.add(rule.id, resolved.before, resolved.hex, contrast(resolved.hex, bg), variant.key);
      }
      return resolved.hex;
    }
    case 'surface': {
      const t = surfaceT(rule, variant);
      const bg = EDITOR_AREAS.has(rule.id) || rule.id.startsWith('editor.') ? variant.background : variant.uiBackground;
      const color = mix(bg, mixFg, t);
      surfaceLog.add(rule.id, 'surface', t, variant.key, color, contrast(color, bg), contrast(palette.core.fg, color));
      return color;
    }
    case 'line': {
      const t = surfaceT(rule, variant);
      const bg = EDITOR_AREAS.has(rule.id) || rule.id.startsWith('editor.') ? variant.background : variant.uiBackground;
      const color = mix(bg, mixFg, t);
      surfaceLog.add(rule.id, 'line', t, variant.key, color, contrast(color, bg), null);
      return color;
    }
    case 'chrome': {
      const color = mix(variant.uiBackground, '#000000', CHROME_T);
      surfaceLog.add(rule.id, 'chrome', CHROME_T, variant.key, color, contrast(color, variant.uiBackground), null);
      return color;
    }
    case 'area':
      if (rule.id === 'terminal.background') return variant.terminal;
      return EDITOR_AREAS.has(rule.id) ? variant.background : variant.uiBackground;
    case 'accent':
      return paletteValue(rule.paletteKey, palette);
    case 'tint': {
      // Diff text/line backgrounds: the palette color mixed with the
      // editor background (t = background share), keeping the editor
      // foreground readable on top.
      const color = mix(paletteValue(rule.paletteKey, palette), variant.background, rule.t);
      surfaceLog.add(rule.id, 'tint', rule.t, variant.key, color, contrast(color, variant.background), contrast(palette.core.fg, color));
      return color;
    }
    default:
      throw new Error(`unknown class ${rule.class} for ${rule.id}`);
  }
}

/** Ordered log of lifted text colors, deduplicated per (name, color, variant). */
class LiftLog {
  constructor() {
    this.entries = [];
    this.seen = new Set();
  }
  add(name, before, after, ratio, variant) {
    const key = `${name}|${before}|${after}|${variant}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    this.entries.push({ name, before, after, ratio, variant });
  }
}

/** Ordered log of derived surface/line/chrome roles. */
class SurfaceLog {
  constructor() {
    this.entries = [];
    this.seen = new Set();
  }
  add(id, kind, t, variant, color, ratio, fgRatio) {
    const key = `${id}|${variant}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    this.entries.push({ id, kind, t, variant, color, ratio, fgRatio });
  }
}

function generateTheme(variant, palette, textLiftLog, surfaceLog) {
  const { colors, tokenColors, semanticTokenColors } = buildVariant(variant, palette, textLiftLog, surfaceLog);
  return {
    name: variant.name,
    type: 'dark',
    colors,
    tokenColors,
    semanticTokenColors,
    semanticHighlighting: true,
  };
}

function writeJson(rel, obj) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2) + '\n');
}

const GEN_START = '<!-- benom:generated:start -->';
const GEN_END = '<!-- benom:generated:end -->';

function renderDecisionsSection(textLiftLog, surfaceLog) {
  const lines = [];
  lines.push(GEN_START);
  lines.push('');
  lines.push('## Generated: lifted text colors');
  lines.push('');
  lines.push('This section is generated by `npm run build`. Do not edit by hand.');
  lines.push('Every color below was below its contrast target against the variant');
  lines.push('background (or the surface it sits on) and was lifted to the nearest');
  lines.push('lighter shade of the same hue.');
  lines.push('');
  lines.push('| Role | Variant | Before | After | Contrast ratio |');
  lines.push('|---|---|---|---|---|');
  for (const e of textLiftLog.entries) {
    // One-decimal ratios: 2nd-decimal shifts (e.g. 3.08:1 → 3.11:1) would
    // otherwise mark every row as changed in git diffs of this file.
    lines.push(`| ${e.name} | ${e.variant} | ${e.before} | ${e.after} | ${e.ratio.toFixed(1)}:1 |`);
  }
  lines.push('');
  lines.push('## Generated: derived surfaces, lines and chrome');
  lines.push('');
  lines.push('Surfaces, lines and chrome are NOT lifted by text contrast. They are');
  lines.push('derived as mix(variantBackground, foreground, t) (chrome mixes with');
  lines.push('#000000). `t` is the mix factor; the ratio is against the variant');
  lines.push('background, and "fg on color" is editor.foreground on that color.');
  lines.push('');
  lines.push('| Role | Class | Variant | t | Color | vs background | fg on color |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const e of surfaceLog.entries) {
    const fg = e.fgRatio === null ? '' : `${e.fgRatio.toFixed(2)}:1`;
    lines.push(`| ${e.id} | ${e.kind} | ${e.variant} | ${e.t.toFixed(2)} | ${e.color} | ${e.ratio.toFixed(2)}:1 | ${fg} |`);
  }
  lines.push('');
  lines.push(GEN_END);
  return lines.join('\n') + '\n';
}

export function updateDecisions(textLiftLog, surfaceLog) {
  const path = join(root, 'DECISIONS.md');
  let text = '';
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    text = '';
  }
  const generated = renderDecisionsSection(textLiftLog, surfaceLog);
  if (!text.includes(GEN_START) || !text.includes(GEN_END)) {
    const base = text.endsWith('\n') ? text : text + '\n';
    const handAuthored = base.trim() ? base + '\n' : '';
    writeFileSync(path, handAuthored + generated);
    return;
  }
  const before = text.slice(0, text.indexOf(GEN_START));
  const after = text.slice(text.indexOf(GEN_END) + GEN_END.length);
  const tail = after.replace(/^\s*\n/, '').replace(/\s*$/, '');
  writeFileSync(path, before + generated + (tail ? '\n' + tail + '\n' : ''));
}

function main() {
  const palette = loadJson('src/palette.json');

  const textLiftLog = new LiftLog();
  const surfaceLog = new SurfaceLog();
  const themes = {};
  for (const variant of VARIANTS) {
    themes[variant.key] = generateTheme(variant, palette, textLiftLog, surfaceLog);
  }

  writeJson('themes/benom-color-theme.json', themes.base);
  writeJson('themes/benom-alt-color-theme.json', themes.alt);
  updateDecisions(textLiftLog, surfaceLog);

  process.stdout.write(
    `benom build: wrote themes/benom-color-theme.json, themes/benom-alt-color-theme.json (${textLiftLog.entries.length} text lifts, ${surfaceLog.entries.length} derived surfaces/lines/chrome)\n`,
  );
}

main();
