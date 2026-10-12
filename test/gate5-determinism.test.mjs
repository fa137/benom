// Gate 5: the build is deterministic. Running the build into a temp
// directory twice produces byte-identical theme files and an identical
// generated DECISIONS.md section.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(import.meta.dirname, '..');
const buildScript = join(root, 'scripts/build.mjs');

function runBuild(targetRoot) {
  // Run the build with the repo root redirected to a temp dir.
  execFileSync(process.execPath, [buildScript], {
    cwd: targetRoot,
    stdio: 'pipe',
    env: { ...process.env, BENOM_ROOT: targetRoot },
  });
}

function snapshot(dir) {
  return {
    base: readFileSync(join(dir, 'themes/benom-color-theme.json'), 'utf8'),
    alt: readFileSync(join(dir, 'themes/benom-alt-color-theme.json'), 'utf8'),
    decisions: readFileSync(join(dir, 'DECISIONS.md'), 'utf8'),
  };
}

function withTempRepo(fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'benom-build-'));
  try {
    // Copy the build inputs into the temp repo.
    for (const p of ['src', 'scripts', 'package.json']) {
      execFileSync('cp', ['-r', join(root, p), join(tmp, p)]);
    }
    // DECISIONS.md may exist with a hand-authored part; copy it so the
    // generated section is rewritten in place.
    try {
      execFileSync('cp', [join(root, 'DECISIONS.md'), join(tmp, 'DECISIONS.md')]);
    } catch {
      // no DECISIONS.md yet; the build will create one.
    }
    mkdirSync(join(tmp, 'themes'), { recursive: true });
    fn(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

test('gate5: build is deterministic across runs', () => {
  withTempRepo((dir) => {
    runBuild(dir);
    const first = snapshot(dir);
    runBuild(dir);
    const second = snapshot(dir);
    assert.equal(first.base, second.base, 'base theme differs between runs');
    assert.equal(first.alt, second.alt, 'alt theme differs between runs');
    assert.equal(first.decisions, second.decisions, 'DECISIONS.md differs between runs');
  });
});

test('gate5: committed themes match a fresh build', () => {
  withTempRepo((dir) => {
    runBuild(dir);
    const built = snapshot(dir);
    const committed = {
      base: readFileSync(join(root, 'themes/benom-color-theme.json'), 'utf8'),
      alt: readFileSync(join(root, 'themes/benom-alt-color-theme.json'), 'utf8'),
      decisions: readFileSync(join(root, 'DECISIONS.md'), 'utf8'),
    };
    assert.equal(built.base, committed.base, 'committed base theme is stale');
    assert.equal(built.alt, committed.alt, 'committed alt theme is stale');
    assert.equal(built.decisions, committed.decisions, 'committed DECISIONS.md is stale');
  });
});
