"""Reversible code for the draft 999-slot AI Used vocabulary (URL version 2)."""

from math import comb
import sys

ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
UNIVERSE_SIZE = 999
MAX_SELECTIONS = 110


def encode(ids):
    if not isinstance(ids, (list, tuple, set)):
        raise TypeError("Category IDs must be a collection")
    selected = sorted(set(ids))
    if any(type(item) is not int or item < 1 or item > UNIVERSE_SIZE for item in selected):
        raise ValueError("Choose integer IDs from 1 through 999")
    if len(selected) > MAX_SELECTIONS:
        raise ValueError("Too many declarations for version 2")
    rank = sum(comb(UNIVERSE_SIZE, j) for j in range(len(selected)))
    rank += sum(comb(category - 1, position) if category > position else 0
                for position, category in enumerate(selected, 1))
    out = ""
    while True:
        out = ALPHABET[rank % 64] + out
        rank //= 64
        if rank == 0:
            return out


def decode(payload):
    if (not isinstance(payload, str) or not 1 <= len(payload) <= 167
            or any(character not in ALPHABET for character in payload)
            or len(payload) > 1 and payload[0] == "0"):
        raise ValueError("Enter a canonical version 2 code")
    rank = 0
    for character in payload:
        rank = rank * 64 + ALPHABET.index(character)
    if rank >= 1 << UNIVERSE_SIZE:
        raise ValueError("Version 2 code outside the 999-slot range")

    count = 0
    bucket = 1
    while rank >= bucket:
        rank -= bucket
        count += 1
        if count > MAX_SELECTIONS:
            raise ValueError("Too many declarations for version 2")
        bucket = bucket * (UNIVERSE_SIZE - count + 1) // count

    ids = []
    upper = UNIVERSE_SIZE - 1
    for position in range(count, 0, -1):
        low, high = position - 1, upper
        while low < high:
            middle = (low + high + 1) // 2
            if middle >= position and comb(middle, position) <= rank:
                low = middle
            elif middle < position:
                low = middle
            else:
                high = middle - 1
        ids.append(low + 1)
        rank -= comb(low, position) if low >= position else 0
        upper = low - 1
    if rank:
        raise ValueError("Invalid version 2 code")
    return sorted(ids)


def main(argv):
    if len(argv) < 2 or argv[1] not in ("encode", "decode"):
        raise SystemExit("usage: codec_v2.py encode ID... | decode PAYLOAD")
    if argv[1] == "encode":
        print(encode([int(value) for value in argv[2:]]))
    elif len(argv) == 3:
        print(decode(argv[2]))
    else:
        raise SystemExit("decode expects one payload")


if __name__ == "__main__":
    main(sys.argv)
