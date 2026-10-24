// Draft sparse vocabulary codec. Version 2 reserves IDs 1..999, even though
// the initial catalog defines only 99 of those slots. This fixed universe keeps
// a previously issued code stable when a reserved slot is defined later.
import { choose } from './codec.mjs';

export const V2_UNIVERSE_SIZE = 999;
export const V2_MAX_DECLARATIONS = 110;
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const maxRank = 1n << 999n;

function digits(rank) {
  let out = '';
  do {
    out = alphabet[Number(rank % 64n)] + out;
    rank /= 64n;
  } while (rank);
  return out;
}

export function encodeV2(ids) {
  if (!Array.isArray(ids)) throw new TypeError('Choose an array of category IDs.');
  const selected = [...new Set(ids)].sort((a, b) => a - b);
  if (selected.some(id => !Number.isInteger(id) || id < 1 || id > V2_UNIVERSE_SIZE)) {
    throw new RangeError('Choose category IDs from 1 through 999.');
  }
  if (selected.length > V2_MAX_DECLARATIONS) throw new RangeError('Too many declarations for version 2.');
  let rank = 0n;
  let bucket = 1n;
  for (let j = 0; j < selected.length; j++) {
    rank += bucket;
    bucket = bucket * BigInt(V2_UNIVERSE_SIZE - j) / BigInt(j + 1);
  }
  for (let i = 0; i < selected.length; i++) rank += choose(selected[i] - 1, i + 1);
  return digits(rank);
}

export function decodeV2(payload) {
  if (typeof payload !== 'string' || !/^[0-9A-Za-z_-]{1,167}$/.test(payload) ||
      (payload.length > 1 && payload[0] === '0')) {
    throw new RangeError('Enter a canonical version 2 code.');
  }
  let rank = 0n;
  for (const digit of payload) rank = rank * 64n + BigInt(alphabet.indexOf(digit));
  if (rank >= maxRank) throw new RangeError('The version 2 code is outside its range.');

  let cardinality = 0;
  let bucket = 1n;
  while (rank >= bucket) {
    rank -= bucket;
    cardinality++;
    // The draft defines 99 AI actions and 11 separate context statements.
    // A later reviewed release can raise this cap without changing old ranks.
    if (cardinality > V2_MAX_DECLARATIONS) throw new RangeError('Too many declarations for version 2.');
    bucket = bucket * BigInt(V2_UNIVERSE_SIZE - cardinality + 1) / BigInt(cardinality);
  }

  const ids = [];
  let upper = V2_UNIVERSE_SIZE - 1;
  for (let j = cardinality; j > 0; j--) {
    let low = j - 1;
    let high = upper;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (choose(mid, j) <= rank) low = mid;
      else high = mid - 1;
    }
    ids.push(low + 1);
    rank -= choose(low, j);
    upper = low - 1;
  }
  if (rank !== 0n) throw new RangeError('The version 2 code is invalid.');
  return ids.sort((a, b) => a - b);
}

export function disclosurePathV2(ids) {
  return `/2/${encodeV2(ids)}`;
}
