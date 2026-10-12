// Packaging gate (gate 6): the extension packages cleanly and the
// .vsix contains exactly the intended files. Also checks the
// manifest fields the Marketplace requires, the icon, and the
// README's no-remote-images rule.
//
// The test spawns `vsce ls` directly (falling back to
// `npm run package` when vsce is not installed) and asserts:
//   - the exact file list vsce would ship,
//   - required manifest fields,
//   - both themes use uiTheme "vs-dark" and exist on disk,
//   - icon.png is a valid 128x128 PNG,
//   - README.md has no http(s) image links.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = join(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run `vsce ls` from the repo root, or package first if vsce is missing. */
function vsceLs() {
  const vsceBin = join(root, 'node_modules', '.bin', 'vsce');
  if (!existsSync(vsceBin)) {
    execFileSync('npm', ['run', 'package'], { cwd: root, stdio: 'pipe' });
  }
  const bin = existsSync(vsceBin) ? vsceBin : 'vsce';
  const result = spawnSync(bin, ['ls'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, `vsce ls failed: ${result.stderr}`);
  return result.stdout.split('\n').map((l) => l.trim()).filter(Boolean);
}

/** Parse a PNG header and IHDR chunk; returns { width, height }. */
function readPngHeader(buf) {
  assert.equal(buf.subarray(0, 8).toString('hex'), '89504e470d0a1a0a',
    'not a PNG signature');
  assert.equal(buf.subarray(12, 16).toString('ascii'), 'IHDR', 'missing IHDR');
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25];
  assert.equal(bitDepth, 8, 'expected 8-bit depth');
  assert.equal(colorType, 2, 'expected truecolor RGB');
  return { width, height };
}

/** List entry names from a zip central directory (no dependencies). */
function listZipEntries(buf) {
  // Find the end-of-central-directory record (signature 0x06054b50).
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  assert.notEqual(eocd, -1, 'not a zip file: no EOCD record');
  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  const names = [];
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(offset), 0x02014b50, 'bad central directory header');
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    names.push(buf.subarray(offset + 46, offset + 46 + nameLen).toString('utf8'));
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}

// ---------------------------------------------------------------------------
// Gate 6: exact .vsix file list
// ---------------------------------------------------------------------------

test('gate6: vsce ls lists exactly the intended files', () => {
  const files = vsceLs().sort();
  const expected = [
    'LICENSE',
    'NOTICE',
    'README.md',
    'CHANGELOG.md',
    'icon.png',
    'package.json',
    'themes/benom-alt-color-theme.json',
    'themes/benom-color-theme.json',
  ].sort();
  assert.deepEqual(files, expected,
    `vsce ls mismatch:\n  got: ${JSON.stringify(files)}\n  want: ${JSON.stringify(expected)}`);
});

test('gate6: .vsix exists after packaging and contains the same files', () => {
  const vsix = join(root, `benom-${pkg.version}.vsix`);
  // Always repackage so the archive reflects the current working tree.
  execFileSync('npm', ['run', 'package'], { cwd: root, stdio: 'pipe' });
  assert.ok(existsSync(vsix), 'expected benom-<version>.vsix in the repo root');
  assert.ok(statSync(vsix).size > 0, 'empty .vsix');
  // The vsix is a zip; list entries from its central directory.
  // vsce normalizes README.md -> readme.md and LICENSE -> LICENSE.txt
  // inside the archive, so compare case-insensitively.
  const names = listZipEntries(readFileSync(vsix));
  const payload = names
    .map((n) => n.replace(/^extension\//, '').toLowerCase())
    .filter((n) => n && !n.includes('vsixmanifest') && n !== '[content_types].xml');
  for (const required of [
    'package.json', 'themes/benom-color-theme.json',
    'themes/benom-alt-color-theme.json', 'icon.png', 'readme.md',
    'changelog.md', 'license', 'notice',
  ]) {
    assert.ok(
      required === 'license'
        ? payload.some((n) => n === 'license' || n === 'license.txt')
        : payload.includes(required),
      `expected ${required} inside the .vsix (got ${JSON.stringify(payload)})`,
    );
  }
});

// ---------------------------------------------------------------------------
// Manifest fields
// ---------------------------------------------------------------------------

test('manifest: required Marketplace fields', () => {
  assert.equal(pkg.name, 'benom');
  assert.equal(pkg.displayName, 'Benom');
  assert.ok(pkg.publisher, 'publisher is required');
  assert.equal(pkg.publisher, 'fa137', 'publisher must equal the Marketplace publisher id');
  assert.ok(pkg.engines && pkg.engines.vscode, 'engines.vscode is required');
  assert.ok(Array.isArray(pkg.categories) && pkg.categories.includes('Themes'),
    'categories must include Themes');
  assert.ok(pkg.galleryBanner, 'galleryBanner is required');
  assert.ok(pkg.repository, 'repository is required');
  assert.equal(pkg.license, 'Apache-2.0');
  assert.equal(pkg.icon, 'icon.png');
  assert.ok(existsSync(join(root, pkg.icon)), 'icon file must exist');
});

test('manifest: both themes are contributed with uiTheme vs-dark', () => {
  const themes = pkg.contributes.themes;
  assert.equal(themes.length, 2, 'expected exactly two themes');
  for (const theme of themes) {
    assert.equal(theme.uiTheme, 'vs-dark', `${theme.label} uiTheme must be vs-dark`);
    const file = join(root, theme.path);
    assert.ok(existsSync(file), `theme file missing: ${theme.path}`);
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(typeof parsed.name, 'string');
  }
  const labels = themes.map((t) => t.label).sort();
  assert.deepEqual(labels, ['Benom', 'Benom Alt']);
});

// ---------------------------------------------------------------------------
// Icon validity
// ---------------------------------------------------------------------------

test('icon: icon.png is a valid 128x128 PNG', () => {
  const buf = readFileSync(join(root, 'icon.png'));
  const { width, height } = readPngHeader(buf);
  assert.equal(width, 128, 'icon width must be 128');
  assert.equal(height, 128, 'icon height must be 128');
  // The IDAT stream must decompress (valid zlib data).
  const idat = [];
  let pos = 8;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.subarray(pos + 4, pos + 8).toString('ascii');
    if (type === 'IDAT') idat.push(buf.subarray(pos + 8, pos + 8 + len));
    pos += 12 + len;
  }
  assert.ok(idat.length > 0, 'no IDAT chunk');
  const raw = inflateSync(Buffer.concat(idat));
  assert.equal(raw.length, 128 * (128 * 3 + 1), 'unexpected scanline size');
});

// ---------------------------------------------------------------------------
// README rules
// ---------------------------------------------------------------------------

test('readme: no http(s) image links', () => {
  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  const imageRefs = [...readme.matchAll(/!\[[^\]]*\]\([^)]*\)/g)].map((m) => m[0]);
  for (const ref of imageRefs) {
    assert.doesNotMatch(ref, /https?:\/\//,
      `remote image link in README: ${ref}`);
  }
  // Screenshot references use relative paths.
  assert.match(readme, /docs\/images\/benom\.png/);
  assert.match(readme, /docs\/images\/benom-alt\.png/);
});
