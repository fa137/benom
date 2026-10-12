#!/usr/bin/env node
// Benom icon generator: zero-dependency 128x128 PNG writer.
//
// Renders the icon at 8x supersampling (1024x1024) with a polygon
// fill, box-filter downscales to 128x128, and encodes a truecolor
// PNG using node:zlib only (no image libraries).
//
// Icon design (from the theme's own palette):
//   - #000000 background (the Benom editor background)
//   - thin #c1c1c1 frame (Venom's fg grey)
//   - centered downward chevron in #fc302e (Venom's red, used for types)
//
// The geometry is fixed and all math is integer or fixed-point, so
// re-running this script produces byte-identical output.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.env.BENOM_ROOT
  ? resolve(process.env.BENOM_ROOT)
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SIZE = 128;
const SUPERSAMPLE = 8;
const SS = SIZE * SUPERSAMPLE;

const BLACK = [0x00, 0x00, 0x00];
const GREY = [0xc1, 0xc1, 0xc1];
const RED = [0xfc, 0x30, 0x2e];

// Frame thickness in final pixels (2px at 128 -> 16px at 1024).
const FRAME = 2 * SUPERSAMPLE;

// Chevron polygon in final 128x128 coordinates, centered on (64, 64).
// A downward chevron band: the outer V runs (20,34)->(64,78)->(108,34),
// the inner V runs (20,50)->(64,94)->(108,50); the band is 16px thick.
const CHEVRON = [
  [20, 34], [64, 78], [108, 34],
  [108, 50], [64, 94], [20, 50],
].map(([x, y]) => [x * SUPERSAMPLE, y * SUPERSAMPLE]);

// ---------------------------------------------------------------------------
// Supersampled canvas
// ---------------------------------------------------------------------------

const canvas = Buffer.alloc(SS * SS * 3);
for (let i = 0; i < canvas.length; i += 3) {
  canvas[i] = BLACK[0];
  canvas[i + 1] = BLACK[1];
  canvas[i + 2] = BLACK[2];
}

function paint(x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= SS || y >= SS) return;
  const o = (y * SS + x) * 3;
  canvas[o] = r;
  canvas[o + 1] = g;
  canvas[o + 2] = b;
}

function fillRect(x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) paint(x, y, color);
  }
}

// Thin frame around the edge of the icon.
fillRect(0, 0, SS, FRAME, GREY);
fillRect(0, SS - FRAME, SS, FRAME, GREY);
fillRect(0, 0, FRAME, SS, GREY);
fillRect(SS - FRAME, 0, FRAME, SS, GREY);

// Even-odd scanline fill of the chevron polygon.
function fillPolygon(points, color) {
  const n = points.length;
  for (let y = 0; y < SS; y++) {
    const xs = [];
    for (let i = 0; i < n; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % n];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) {
        paint(x, y, color);
      }
    }
  }
}

fillPolygon(CHEVRON, RED);

// ---------------------------------------------------------------------------
// Box-filter downsample to 128x128
// ---------------------------------------------------------------------------

const out = Buffer.alloc(SIZE * SIZE * 3);
const scale = SUPERSAMPLE * SUPERSAMPLE;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let r = 0, g = 0, b = 0;
    for (let dy = 0; dy < SUPERSAMPLE; dy++) {
      for (let dx = 0; dx < SUPERSAMPLE; dx++) {
        const o = ((y * SUPERSAMPLE + dy) * SS + (x * SUPERSAMPLE + dx)) * 3;
        r += canvas[o];
        g += canvas[o + 1];
        b += canvas[o + 2];
      }
    }
    const o = (y * SIZE + x) * 3;
    out[o] = Math.round(r / scale);
    out[o + 1] = Math.round(g / scale);
    out[o + 2] = Math.round(b / scale);
  }
}

// ---------------------------------------------------------------------------
// PNG encoding (node:zlib only)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.slice(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

function encodePng(rgb) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: truecolor RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Each scanline is prefixed with filter byte 0 (None).
  const stride = SIZE * 3;
  const raw = Buffer.alloc((stride + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (stride + 1)] = 0;
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const png = encodePng(out);
const target = join(root, 'icon.png');
writeFileSync(target, png);
process.stdout.write(`benom icon: wrote ${target} (${png.length} bytes)\n`);
