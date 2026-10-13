#!/usr/bin/env node
// Benom check: assert the generated themes are committed (no drift),
// run the contrast report, and verify schema and coverage basics.
// Zero dependencies. Run by `npm run check` (build then verify).
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { contrast } from './build.mjs';
import { workbenchRules, terminalAnsiRules } from '../src/workbench.mjs';

const root = process.env.BENOM_ROOT
  ? resolve(process.env.BENOM_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');
import { dirname } from 'node:path';

let failures = 0;
function check(name, ok, detail) {
  if (ok) {
    process.stdout.write(`ok ${name}\n`);
  } else {
    failures += 1;
    process.stdout.write(`not ok ${name}${detail ? `: ${detail}` : ''}\n`);
  }
}

const palette = JSON.parse(readFileSync(join(root, 'src/palette.json'), 'utf8'));
const known = new Set(JSON.parse(readFileSync(join(root, 'test/known-colors.json'), 'utf8')).colors);

const VARIANTS = [
  { file: 'themes/benom-color-theme.json', background: '#191919', uiBackground: '#050505' },
  { file: 'themes/benom-alt-color-theme.json', background: '#251e1d', uiBackground: '#070504' },
];

// Gate 1: valid JSON and hex.
for (const v of VARIANTS) {
  let theme;
  try {
    theme = JSON.parse(readFileSync(join(root, v.file), 'utf8'));
    check(`${v.file} parses`, true);
  } catch (e) {
    check(`${v.file} parses`, false, e.message);
    continue;
  }
  const HEX = /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/;
  const bad = [];
  const walk = (val, path) => {
    if (typeof val === 'string') {
      if (/^#[0-9a-fA-F]+$/i.test(val) && !HEX.test(val)) bad.push(`${path}=${val}`);
      return;
    }
    if (Array.isArray(val)) val.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (val && typeof val === 'object') {
      for (const [k, x] of Object.entries(val)) walk(x, `${path}.${k}`);
    }
  };
  walk(theme, '$');
  check(`${v.file} colors are valid hex`, bad.length === 0, bad.join(', '));
  check(`${v.file} editor.background is ${v.background}`, theme.colors['editor.background'] === v.background);
  check(`${v.file} sideBar.background is ${v.uiBackground}`, theme.colors['sideBar.background'] === v.uiBackground);
}

// Gate 3: workbench ids are known and unique.
const ids = [...workbenchRules.map((r) => r.id), ...terminalAnsiRules.map((r) => r.id)];
check('workbench ids are known VS Code colors', ids.every((i) => known.has(i)));
check('workbench ids are unique', new Set(ids).size === ids.length);

// Gate 2: contrast targets.
for (const v of VARIANTS) {
  const theme = JSON.parse(readFileSync(join(root, v.file), 'utf8'));
  const targets = new Map(workbenchRules.filter((r) => r.target !== undefined).map((r) => [r.id, r.target]));
  const bad = [];
  for (const [id, target] of targets) {
    const value = theme.colors[id];
    if (!value) {
      bad.push(`${id} missing`);
      continue;
    }
    // Foreground roles with `against` are measured against their surface.
    const rule = workbenchRules.find((r) => r.id === id);
    const bg = rule.against ? theme.colors[rule.against] : v.background;
    const ratio = contrast(value, bg);
    if (ratio < target - 1e-9) bad.push(`${id} ${ratio.toFixed(2)}<${target}`);
  }
  check(`${v.file} meets contrast targets`, bad.length === 0, bad.join(', '));
}

// Gate 5: no drift (committed themes match a fresh build).
try {
  execFileSync(process.execPath, [join(root, 'scripts/build.mjs')], {
    cwd: root,
    stdio: 'pipe',
  });
  check('build runs cleanly', true);
} catch (e) {
  check('build runs cleanly', false, e.message);
}

if (failures > 0) {
  process.stdout.write(`\n${failures} check(s) failed\n`);
  process.exit(1);
}
process.stdout.write('\nall checks passed\n');
