# AI Used — aiused.org

First release deployed, 23 October 2026. Domain: `aiused.org` (AI used).
Cloudflare registration is active through 23 October 2027. Checkout total: $8.50;
auto-renewal is off; the current advertised renewal price is $11.20/year.
Domain checkout and ownership status are recorded separately in `purchase-status.json`.
The citation site is live at https://aiused.org. Public source and contribution
guide: https://github.com/ashrocket/aiused. Initial Worker version:
`d1d5c280-e193-4925-a3c5-0450c879acb7`; current verified version is
`dfe95dd7-0a24-4a35-8967-a769841baac3`. HTTPS pages, legacy redirects,
JSON, the frozen vocabulary hash, QR SVG output, and browser interactions were
verified against this release. See `DEPLOYMENT.md` for the release boundary.

The mark is a compact link to a readable declaration of what AI contributed.
Each of 99 numbered categories describes an actual action, human involvement,
or uncertainty. Multiple categories may apply. There is no implied AI percentage,
quality score, certification, or ranking of creators.

## Examples

Canonical version 1 URLs use `/1/<payload>`. The first release's compact URLs
continue to work and redirect to these versioned paths.

| Example | Selected IDs | Code / URL |
| --- | --- | --- |
| AI expanded artwork beyond its original bounds | 27 | `aiused.org/1/R` |
| AI expanded artwork; a human materially revised it and reviewed all AI-affected parts | 27, 94, 95 | `aiused.org/1/Y_3` |
| AI-capable software used, but no known AI feature use | 89 | `aiused.org/1/1P` |
| AI generated functions and tests; an agent ran commands; a human reviewed all affected output and test results | 57, 62, 83, 95, 97 | `aiused.org/1/447_h` |

Adobe documents Generative Expand in Illustrator as generating artwork beyond its
original bounds. That is category 27 when actually used. Merely having Illustrator
installed or using its ordinary drawing tools does not establish that category.
Source: https://helpx.adobe.com/uk/illustrator/desktop/use-generative-ai/expand-artwork-with-generative-expand.html

The catalog is in `categories.tsv` (readable) and `categories.json`
(machine-readable). Version 1 is frozen for release, with its digest pinned in
tests: `b7a9416e5a019c09d5c2a5619c716fad0170809704da679ff33b8468271d96c5`.
All 99 original definitions and IDs are preserved. The standalone `preview.html`
is the earlier offline prototype; the current site lives in `src/` and `public/`.

## Site and QR codes

The site provides a searchable picker, reusable server-rendered citation pages,
link/citation/Markdown copying, code lookup, an open vocabulary, and JSON exports.
No account, combination database, cookies, analytics SDK, or model inference is
needed. The selection stays in the browser; QR preview requests send its public
code to the server. Hosting request logs may still exist.

Routes: `/`, `/1/<payload>`, `/1/<payload>.json`, `/qr/1/<payload>.svg`, `/v1`,
`/v1/categories.json`, `/about`, and `/health`. Citation content works without JS.
The first release's `/<code>` and `/qr/<code>.svg` routes redirect permanently.
Empty or conflicting combinations remain readable, but the UI disables sharing
until the selection is clarified. Their QR API routes still exist.

QR downloads use the complete case-sensitive HTTPS URL, standard M correction,
the smallest byte-mode symbol, and a four-module white border. The SVG has physical
dimensions (12 mm by default; UI offers 10/12/16/24 mm). Never crop the border.
The `1/Y_3` example is 25 modules plus the border, 33 total. Independent raster
decoding proves the encoded URL, not the reliability of a physical print; test
the final material, size and phone. The generator also accepts `ecc=L` and numeric
`mm=8..40` through its API. DENSO sizing reference:
https://www.qrcode.com/en/howto/code.html

## Encoding

The first path segment, `1`, selects the v1 algorithm and its fixed 99-category
dictionary. The second segment represents a nonnegative integer in base 64,
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

The canonical empty-set URL is `/1/0`; it means no declarations, NOT no AI.
Duplicate input IDs are deduplicated and order is irrelevant. Reject invalid IDs,
unknown versions, invalid alphabet characters, ranks >= 2^99, and leading zeros
in a multi-character payload. Reject malformed input rather than guessing.

| Number of selected categories | Maximum payload length |
| --- | --- |
| 1 | 2 |
| 2 or 3 | 3 |
| 4 | 4 |
| 5 | 5 |
| 6 or 7 | 6 |
| Any subset | 17 |

The `/1/` prefix adds three characters to the URL path. The version token is a
canonical positive base-64 integer of one to four characters; only version 1 is
currently published. The Python CLI still emits the original compact form
`1Y_3`; its equivalent public URL is `/1/Y_3`.

There are `2^99` possible combinations, so a fixed six-character code cannot cover
every combination. Even without a version marker, a 64-symbol alphabet requires
at least `ceil(99/6) = 17` characters in the worst case. Short codes are achieved
by assigning small integers to small subsets, not by losing information.

## Meaning and stability

- Unselected means unclaimed, not false. Declarations describe the identified work,
  not every prior use of the creator's software or every property of a model.
- Scope the mark to a specific artifact or clearly identified portion and release.
  Reusing a code says the same things happened; it does not identify the artifact.
- Do not silently revise published definitions. Version 1 is frozen for release.
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
npm test
npm run deploy:check
# Deployment uses the project-local ashcode Wrangler profile:
npm run deploy
```

Six tests pass: all 4,096 subsets of a reduced universe, every v1 singleton and
pair, 2,500 seeded samples across all cardinalities, fixed vectors, length bounds,
and invalid-input rejection. Sixteen Node tests cover routes, SSR, canonical
input validation, semantic conflicts, immutable vocabulary, and QR output. The
QR suite independently decodes 36 raster cases using test-only jsQR, including
case-sensitive codes, underscores and the maximum length. Independent Haikrew
source review passed. Project-local Wrangler 4.152.0 dry run packaged nine modules,
121.44 KiB total (31.20 KiB gzip), with no storage bindings.

`scripts/package.py` regenerates `src/catalog.mjs`, `src/assets.mjs`, the nine-file
allowlisted staging directory and a connector multipart payload. Deployment never
includes purchase records, tests, browser fixtures, the jsQR test decoder or other
workspace files. The runtime QR library is vendored qrcode-generator 2.0.4 (MIT);
the test decoder is jsQR 1.4.0 (Apache-2.0). Notices are in `vendor/`.

The live browser check and exact Worker version are recorded in `DEPLOYMENT.md`.
Digital QR decoding does not establish physical print scanning reliability.
