import test from 'node:test';
import assert from 'node:assert/strict';
import qrcode from '../vendor/qrcode.mjs';
import jsQR from '../vendor/test-jsqr.cjs';
import { disclosurePath } from '../public/codec.mjs';
import { createQr } from '../src/qr.mjs';

const codes = ['/1/0', '/1/a', '/1/A', '/1/a_', '/1/Y_3', disclosurePath(Array.from({ length: 99 }, (_, i) => i + 1))];

test('preserves the exact canonical URL and provides accessible physical SVG output', () => {
  const result = createQr('/1/Y_3');
  assert.equal(result.url, 'https://aiused.org/1/Y_3');
  assert.notEqual(result.url, createQr('/1/y_3').url);
  assert.equal(result.mm, 12);
  assert.equal(result.errorCorrection, 'M');
  assert.match(result.svg, /width="12mm" height="12mm"/);
  assert.ok(result.svg.includes(`viewBox="0 0 ${result.totalModules} ${result.totalModules}"`));
  assert.match(result.svg, /role="img" aria-label="AI-use disclosure: https:\/\/aiused\.org\/1\/Y_3"/);
  assert.match(result.svg, /<title>AI-use disclosure: https:\/\/aiused\.org\/1\/Y_3<\/title>/);
  assert.match(result.svg, /<rect width="\d+" height="\d+" fill="#fff"\/>/);
  assert.match(result.svg, /<path d="[^"]+" fill="#000"\/>/);
});

test('renders every matrix module once, with an intact four-module quiet zone', () => {
  for (const code of codes) {
    for (const ecc of ['L', 'M']) {
      const result = createQr(code, { ecc });
      const reference = qrcode(0, ecc);
      reference.addData(result.url, 'Byte');
      reference.make();
      assert.equal(result.moduleCount, reference.getModuleCount());
      assert.equal(result.totalModules, result.moduleCount + 8);
      assert.equal(result.version, (result.moduleCount - 17) / 4);
      assert.equal(result.minimumPrintMm, Math.ceil(result.totalModules * 0.254 * 10) / 10);
      const path = result.svg.match(/<path d="([^"]+)"/)[1];
      const commands = [...path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)];
      assert.equal(commands.map(m => m[0]).join(''), path);
      const dark = new Set(commands.map(([, x, y]) => `${Number(x) - 4},${Number(y) - 4}`));
      assert.equal(dark.size, commands.length);
      for (const [, x, y] of commands) {
        assert.ok(Number(x) >= 4 && Number(x) < result.totalModules - 4);
        assert.ok(Number(y) >= 4 && Number(y) < result.totalModules - 4);
      }
      for (let y = 0; y < result.moduleCount; y++) {
        for (let x = 0; x < result.moduleCount; x++) {
          assert.equal(dark.has(`${x},${y}`), reference.isDark(y, x));
        }
      }
      // Prove the preceding version cannot fit this byte-mode payload.
      if (result.version > 1) {
        const smaller = qrcode(result.version - 1, ecc);
        smaller.addData(result.url, 'Byte');
        assert.throws(() => smaller.make());
      }
    }
  }
});

test('physical size changes do not alter QR data or matrix', () => {
  const small = createQr('/1/Y_3', { mm: 8 });
  const large = createQr('/1/Y_3', { mm: 40 });
  assert.equal(small.svg.replaceAll('8mm', '40mm'), large.svg);
  assert.match(createQr('/1/Y_3', { mm: 12.5 }).svg, /width="12\.5mm"/);
  assert.deepEqual(createQr('/1/Y_3'), createQr('/1/Y_3'));
});

test('an independent decoder recovers the exact URL from rendered SVG geometry', () => {
  assert.equal(codes.at(-1).split('/')[2].length, 17, 'Exercise the maximum canonical payload length');
  for (const code of codes) {
    for (const ecc of ['L', 'M']) {
      const result = createQr(code, { ecc });
      for (const scale of [4, 6, 8]) {
        const width = result.totalModules * scale;
        const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
        const path = result.svg.match(/<path d="([^"]+)"/)[1];
        for (const [, x, y] of path.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              const pixel = ((Number(y) * scale + dy) * width + Number(x) * scale + dx) * 4;
              pixels[pixel] = pixels[pixel + 1] = pixels[pixel + 2] = 0;
            }
          }
        }
        const decoded = jsQR(pixels, width, width, { inversionAttempts: 'dontInvert' });
        assert.ok(decoded, `${code} / ${ecc} / ${scale} pixels per module should decode`);
        assert.equal(decoded.data, result.url);
        assert.equal(decoded.version, result.version);
      }
    }
  }
});

test('rejects legacy paths at the QR module boundary', () => {
  for (const code of ['10', '/10', '1a', '/1a', '1Y_3', '/1Y_3']) {
    assert.throws(() => createQr(code), RangeError);
  }
});

test('rejects malformed, unsupported, noncanonical, out-of-range and injected paths', () => {
  for (const code of [null, undefined, 10, {}, '', '/1', '/1/', '1/Y_3', '//1/Y_3', '/01/Y_3', '/0/Y_3', '/2/Y_3', '/A/Y_3', '/1/00', '/1/zzzzzzzzzzzzzzzzz', '/1/Y_3/', '/1/Y_3?x=1', '/1/Y_3#x', '/1/Y_3\n', '/1/Y_3\r\n', '/1/Y%5F3', '/1/Y_3"><script>', 'https://aiused.org/1/Y_3']) {
    assert.throws(() => createQr(code), undefined, `Expected rejection: ${String(code)}`);
  }
});

test('rejects unsupported error correction and invalid physical dimensions', () => {
  for (const ecc of ['Q', 'H', 'm', '', null, 1]) assert.throws(() => createQr('/1/0', { ecc }), RangeError);
  for (const mm of [7.99, 40.01, NaN, Infinity, -Infinity, '12', null, {}, 0]) {
    assert.throws(() => createQr('/1/0', { mm }), RangeError);
  }
});
