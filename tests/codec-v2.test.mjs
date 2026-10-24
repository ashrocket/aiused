import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encodeV2, decodeV2, disclosurePathV2, V2_UNIVERSE_SIZE, V2_MAX_DECLARATIONS } from '../public/codec-v2.mjs';

const catalog = JSON.parse(readFileSync(new URL('../categories-v2.json', import.meta.url), 'utf8'));
const context = JSON.parse(readFileSync(new URL('../context-v2.json', import.meta.url), 'utf8'));
const defined = catalog.categories.map(category => category.id);
const contextIds = context.categories.map(category => category.id);

test('v2 draft reserves a stable 999-slot universe with 99 sparse definitions', () => {
  assert.equal(catalog.status, 'draft');
  assert.equal(catalog.version, '2');
  assert.equal(catalog.universe_size, V2_UNIVERSE_SIZE);
  assert.equal(defined.length, 99);
  assert.ok(catalog.categories.every(category => category.kind === 'assist'));
  assert.equal(new Set(defined).size, 99);
  assert.ok(defined.every(id => id >= 1 && id <= 999));
  assert.ok(defined.some((id, i) => i > 0 && id - defined[i - 1] > 1));
  for (let group = 0; group < 9; group++) {
    assert.deepEqual(defined.slice(group * 11, group * 11 + 11),
      Array.from({ length: 11 }, (_, i) => group * 100 + 1 + i * 9));
  }
  assert.equal(defined.at(-1), 891);
  assert.equal(context.categories.length, 11);
  assert.ok(context.categories.every(category => category.kind === 'context'));
  assert.deepEqual(contextIds,Array.from({length:11},(_,i)=>901+i*9));
  assert.equal(new Set([...defined,...contextIds]).size,V2_MAX_DECLARATIONS);
});

test('v2 rank examples and order independent round trips', () => {
  assert.equal(encodeV2([]), '0');
  assert.equal(encodeV2([1]), '1');
  assert.equal(encodeV2([10]), 'A');
  assert.equal(encodeV2([1, 10]), 'GC');
  assert.equal(disclosurePathV2([1, 10]), '/2/GC');
  for (const ids of [[], [891], [1, 10, 101], [237,946,955], defined.slice(0, 5), defined, [...defined,...contextIds]]) {
    const code = encodeV2(ids);
    assert.deepEqual(decodeV2(code), ids);
    assert.equal(encodeV2([...ids].reverse().concat(ids)), code);
  }
});

test('v2 decodes the fixed universe but rejects malformed or excessive codes', () => {
  assert.deepEqual(decodeV2(encodeV2([2])), [2], 'Reserved IDs are syntactically decodable; the catalog controls publication');
  for (const invalid of ['', '00', '01', 'a!', '1/2', 'z'.repeat(168), '_'.repeat(167), null, 12]) {
    assert.throws(() => decodeV2(invalid), undefined, String(invalid));
  }
  assert.throws(() => encodeV2([0]));
  assert.throws(() => encodeV2([1000]));
  assert.throws(() => encodeV2(Array.from({length:111}, (_, i) => i + 1)));
});
