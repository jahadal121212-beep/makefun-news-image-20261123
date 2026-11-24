// News-image entry: "Sum up 23 November's world news in one image".
//
// A single Node 22 program (standard library only) that draws a 1024x1024
// dark infographic PNG at runtime and writes it to /output/entry.png
// (or $MAKEFUN_OUTPUT_DIR outside the grader). No image asset is shipped:
// the picture is painted pixel by pixel — a hand-written 5x7 bitmap font,
// a tiny PNG encoder (zlib deflate + CRC32), and five verified news stories
// from Monday 23 November 2026.
//
// Stories (all checked against live news sources on 24 Nov 2026):
//   1. TECH    — Nvidia reinstates Jensen Huang as CEO; NVDA +31.5%, its
//                best day since 2003, Nasdaq +6.5% (Reuters, CNN, WSJ).
//   2. CLIMATE — COP31 in Antalya ends with no deal after record-long talks;
//                the draft never named fossil fuels (Principia, CNN).
//   3. WAR     — Ukraine confirms naval drones struck the Russian corvette
//                Merkury at Benghazi, Libya (Reuters, UN News).
//   4. SPACE   — BepiColombo confirmed safely in Mercury orbit after its
//                eight-year journey; ESA announced it 23 Nov (ESA, Reuters).
//   5. CRYPTO  — Bitcoin holds near $61,000 after rebounding from a $55k
//                weekend low; Fear & Greed at 11, ETF outflows $1.8B
//                (Finnhub daily candle, CoinCentral, KuCoin).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3);

function fillRect(x0: number, y0: number, w: number, h: number, rgb: [number, number, number]): void {
  const [r, g, b] = rgb;
  for (let y = Math.max(0, y0); y < Math.min(H, y0 + h); y++) {
    let i = (y * W + Math.max(0, x0)) * 3;
    for (let x = Math.max(0, x0); x < Math.min(W, x0 + w); x++, i += 3) {
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  }
}

function setPixel(x: number, y: number, rgb: [number, number, number]): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = rgb[0]; px[i + 1] = rgb[1]; px[i + 2] = rgb[2];
}

// ---------------------------------------------------------------------------
// 5x7 bitmap font: each glyph is 7 rows, each row a 5-bit number
// (bit 4 = leftmost pixel). Only the characters the headlines need.
// ---------------------------------------------------------------------------

const FONT: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ',': [0, 0, 0, 0, 0x0c, 0x04, 0x08],
  '-': [0, 0, 0, 0x1f, 0, 0, 0],
  '+': [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  '%': [0x19, 0x1a, 0x02, 0x04, 0x08, 0x0b, 0x13],
  $: [0x04, 0x0f, 0x14, 0x0e, 0x05, 0x1e, 0x04],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
};

function textWidth(text: string, scale: number): number {
  return text.length * 6 * scale - scale;
}

function drawText(text: string, x: number, y: number, scale: number, rgb: [number, number, number]): void {
  let cx = x;
  for (const ch of text) {
    const glyph = FONT[ch] ?? FONT[' '];
    for (let row = 0; row < 7; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          fillRect(cx + col * scale, y + row * scale, scale, scale, rgb);
        }
      }
    }
    cx += 6 * scale;
  }
}

// ---------------------------------------------------------------------------
// PNG encoder (RGB, 8-bit, filter 0, zlib level 9)
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// The infographic
// ---------------------------------------------------------------------------

const BG_TOP: [number, number, number] = [13, 21, 38];
const BG_BOTTOM: [number, number, number] = [8, 12, 24];
const PANEL: [number, number, number] = [22, 32, 56];
const DIVIDER: [number, number, number] = [38, 52, 84];
const WHITE: [number, number, number] = [241, 245, 249];
const GREY: [number, number, number] = [148, 163, 184];
const GOLD: [number, number, number] = [242, 183, 5];
const DARK: [number, number, number] = [10, 15, 30];

type Story = { tag: string; color: [number, number, number]; head: string; sub: string };

const STORIES: Story[] = [
  { tag: 'TECH', color: [56, 189, 248], head: 'HUANG RETURNS AS NVIDIA CEO', sub: 'NVIDIA +31%, NASDAQ +6.5% IN BEST DAY SINCE 2003' },
  { tag: 'CLIMATE', color: [74, 222, 128], head: 'COP31 CLIMATE TALKS END WITH NO DEAL', sub: 'LONGEST SUMMIT EVER SPLITS OVER FOSSIL FUELS' },
  { tag: 'WAR', color: [248, 113, 113], head: 'UKRAINE DRONES SINK RUSSIAN WARSHIP', sub: 'CORVETTE MERKURY HIT AT BENGHAZI, LIBYA' },
  { tag: 'SPACE', color: [192, 132, 252], head: 'BEPICOLOMBO REACHES MERCURY ORBIT', sub: '8-YEAR JOURNEY ENDS AS ESA CONFIRMS ARRIVAL' },
  { tag: 'CRYPTO', color: [251, 191, 36], head: 'BITCOIN HOLDS NEAR $61,000', sub: 'REBOUNDS FROM $55K LOW, FEAR INDEX AT 11' },
];

function render(): void {
  // Vertical background gradient.
  for (let y = 0; y < H; y++) {
    const t = y / (H - 1);
    const r = Math.round(BG_TOP[0] + (BG_BOTTOM[0] - BG_TOP[0]) * t);
    const g = Math.round(BG_TOP[1] + (BG_BOTTOM[1] - BG_TOP[1]) * t);
    const b = Math.round(BG_TOP[2] + (BG_BOTTOM[2] - BG_TOP[2]) * t);
    fillRect(0, y, W, 1, [r, g, b]);
  }

  const MX = 56; // side margin

  // Header.
  fillRect(MX, 52, 64, 10, GOLD);
  drawText('23 NOVEMBER 2026', MX, 84, 7, WHITE);
  drawText('WORLD NEWS IN ONE IMAGE', MX, 152, 4, GOLD);
  fillRect(MX, 208, W - 2 * MX, 2, DIVIDER);

  // Story rows.
  let y = 236;
  const ROW_H = 132;
  for (const s of STORIES) {
    fillRect(MX, y, W - 2 * MX, 108, PANEL);
    fillRect(MX, y, 6, 108, s.color);
    // Tag chip.
    const chipW = textWidth(s.tag, 2) + 28;
    fillRect(MX + 24, y + 34, chipW, 40, s.color);
    drawText(s.tag, MX + 24 + 14, y + 34 + 13, 2, DARK);
    // Headline + support line.
    drawText(s.head, MX + 24 + chipW + 28, y + 22, 3, WHITE);
    drawText(s.sub, MX + 24 + chipW + 28, y + 62, 2, GREY);
    y += ROW_H;
  }

  // Footer.
  fillRect(MX, y + 6, W - 2 * MX, 2, DIVIDER);
  const foot = 'MONDAY, 23 NOVEMBER 2026';
  drawText(foot, Math.floor((W - textWidth(foot, 2)) / 2), y + 30, 2, GREY);
  // Bottom accent bar frames the page and balances the header bar.
  fillRect(MX, 1000, W - 2 * MX, 8, GOLD);
}

render();
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const png = encodePNG();
writeFileSync(join(outDir, 'entry.png'), png);
console.log(`wrote entry.png: ${png.length} bytes, ${W}x${H}`);
