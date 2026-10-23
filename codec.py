"""AI disclosure v1: an injective, offline-decodable subset rank for 99 IDs.

No network, database, hashing, encryption, or third-party dependencies.
"""
from math import comb
import argparse
import json

ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
VERSION = "1"
SIZE = 99


def encode(ids):
    ids = list(ids)
    if any(type(i) is not int or not 1 <= i <= SIZE for i in ids):
        raise ValueError("Category IDs must be integers from 1 through 99")
    ids = sorted(set(ids))
    rank = sum(comb(SIZE, j) for j in range(len(ids)))
    rank += sum(comb(identifier - 1, j) for j, identifier in enumerate(ids, 1))
    out = ""
    while rank:
        rank, digit = divmod(rank, 64)
        out = ALPHABET[digit] + out
    return VERSION + (out or "0")


def decode(code):
    if not isinstance(code, str) or not 2 <= len(code) <= 18 or code[0] != VERSION:
        raise ValueError("Expected a v1 code of 2 through 18 characters")
    payload = code[1:]
    if len(payload) > 1 and payload[0] == "0":
        raise ValueError("Noncanonical leading zero")
    rank = 0
    for character in payload:
        if character not in ALPHABET:
            raise ValueError("Invalid character")
        rank = 64 * rank + ALPHABET.index(character)
    if rank >= 1 << SIZE:
        raise ValueError("Rank outside the v1 universe")
    k = 0
    while rank >= comb(SIZE, k):
        rank -= comb(SIZE, k)
        k += 1
    out = []
    upper = SIZE - 1
    for j in range(k, 0, -1):
        x = upper
        while comb(x, j) > rank:
            x -= 1
        out.append(x + 1)
        rank -= comb(x, j)
        upper = x - 1
    return sorted(out)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    enc = sub.add_parser("encode")
    enc.add_argument("ids", type=int, nargs="*")
    dec = sub.add_parser("decode")
    dec.add_argument("code")
    args = parser.parse_args()
    print(encode(args.ids) if args.command == "encode" else json.dumps(decode(args.code)))
