# Built with AI: a disclosure codex

Draft, 23 October 2026. Registered domain: `aiused.org` (AI used).
Cloudflare registration is active through 23 October 2027. Checkout total: $8.50;
auto-renewal is off; the current advertised renewal price is $11.20/year.
Domain checkout and ownership status are recorded separately in `purchase-status.json`.
No public disclosure service has been deployed by this work.

The mark is a compact link to a readable declaration of what AI contributed.
Each of 99 numbered categories describes an actual action, human involvement,
or uncertainty. Multiple categories may apply. There is no implied AI percentage,
quality score, certification, or ranking of creators.

## Examples

These are proposed URLs, not deployed pages:

| Example | Selected IDs | Code / proposed URL |
| --- | --- | --- |
| AI expanded artwork beyond its original bounds | 27 | `aiused.org/1R` |
| AI expanded artwork; a human materially revised it and reviewed all AI-affected parts | 27, 94, 95 | `aiused.org/1Y_3` |
| AI-capable software used, but no known AI feature use | 89 | `aiused.org/11P` |
| AI generated functions and tests; an agent ran commands; a human reviewed all affected output and test results | 57, 62, 83, 95, 97 | `aiused.org/1447_h` |

Adobe documents Generative Expand in Illustrator as generating artwork beyond its
original bounds. That is category 27 when actually used. Merely having Illustrator
installed or using its ordinary drawing tools does not establish that category.
Source: https://helpx.adobe.com/uk/illustrator/desktop/use-generative-ai/expand-artwork-with-generative-expand.html

The catalog is in `categories.tsv` (readable/editable) and `categories.json`
(machine-readable). Both are drafts. No category meaning is externally frozen yet.
The standalone `preview.html` lets you select categories, inspect the combined
description, and decode a code entirely offline.

## Encoding

The first character, `1`, selects both the v1 algorithm and its fixed 99-category
dictionary. The remaining characters represent a nonnegative integer in base 64,
using this exact, case-sensitive alphabet, most-significant digit first:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_`

This is integer notation with a URL-safe alphabet, not RFC 4648 byte encoding.
Use arbitrary-precision integers (`int` in Python, `BigInt` in JavaScript).

For sorted unique category IDs `1 <= a1 < ... < ak <= 99`, define:

`R = sum(C(99, j), j=0..k-1) + sum(C(ai - 1, i), i=1..k)`

Here `C(n,k)` is the binomial coefficient, and is zero when `k > n`.
The second sum is the combinatorial number system's colexicographic subset rank.
The first sum allocates a disjoint interval to each possible cardinality.

Every subset receives exactly one integer in `[0, 2^99 - 1]`. To decode, find the
cardinality interval containing R, subtract its offset, and greedily unrank the
remaining colex rank from the largest chosen ID downward. This is a bijection:
no hashing, no collisions, no secret, and no server-side combination registry.
Anyone with the published algorithm and versioned dictionary can decode a mark.

The canonical empty-set code is `10`; it means no declarations, NOT no AI.
Duplicate input IDs are deduplicated and order is irrelevant. Reject invalid IDs,
unknown versions, invalid alphabet characters, ranks >= 2^99, and leading zeros
in a multi-character payload. Reject malformed input rather than guessing.

| Number of selected categories | Maximum code length, including version |
| --- | --- |
| 1 | 3 |
| 2 or 3 | 4 |
| 4 | 5 |
| 5 | 6 |
| 6 or 7 | 7 |
| Any subset | 18 |

There are `2^99` possible combinations, so a fixed six-character code cannot cover
every combination. Even without a version marker, a 64-symbol alphabet requires
at least `ceil(99/6) = 17` characters in the worst case. Short codes are achieved
by assigning small integers to small subsets, not by losing information.

## Meaning and stability

- Unselected means unclaimed, not false. Declarations describe the identified work,
  not every prior use of the creator's software or every property of a model.
- Scope the mark to a specific artifact or clearly identified portion and release.
  Reusing a code says the same things happened; it does not identify the artifact.
- Do not silently revise published definitions. Freeze version 1 before launch.
  A future 999-category dictionary must use a new version; old codes retain meaning.
- Category 89 conflicts with reported known AI actions in 1-88. Category 95
  (full review) conflicts with 98 (partial review) and 99 (no review) when applied
  to the same scope. Categories 98 and 99 also conflict. Show these conflicts.
- This is self-disclosure, not evidence of truth, a signature, authorship proof,
  consent, copyright status, or legal compliance. There is no checksum: a typo
  may form another valid code. A separate integrity mechanism could be added later.
- Product names, model versions, dates, detailed evidence, proportions, and
  artifact-specific narratives belong in optional metadata. Do not imply the
  category-only code carries details it cannot encode.

## Use and verification

```sh
python3 codec.py encode 27 94 95
# 1Y_3
python3 codec.py decode 1Y_3
# [27, 94, 95]
python3 -m unittest -v
```

Six tests pass: all 4,096 subsets of a reduced universe, every v1 singleton and
pair, 2,500 seeded samples across all cardinalities, fixed vectors, length bounds,
and invalid-input rejection. These are algorithm checks, not ownership or
deployment evidence. Preview verification is recorded separately.
