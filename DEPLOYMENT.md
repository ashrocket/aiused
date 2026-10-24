# AI Used release record

## Versioned citations — 23 October 2026

Current verified Worker version: `dfe95dd7-0a24-4a35-8967-a769841baac3`.
The canonical example is https://aiused.org/1/Y_3. The first-release
`/1Y_3` citation and `/qr/1Y_3.svg` routes return 308 redirects to the
versioned paths while preserving the published 99 meanings.
Public source: https://github.com/ashrocket/aiused, commit `28d91c6`.
The contribution links returned HTTP 200 after publication, and the GitHub
Verify workflow passed at https://github.com/ashrocket/aiused/actions/runs/40055964264.

The release uses the intentional version-path source from the shared checkout.
Before deployment, the QR generator and tests were updated for the new full URL;
the home query parser rejects extra path segments; citation pages display the
complete `1/Y_3` identifier; and browser assets use `?v=2` so cached old and
new page generations cannot silently mix. The new app also decodes old cached
compact citation pages. The working tree's draft `categories-v2.json` was not
included in the explicit package allowlist or this release.

- `npm test`: 16 Node and six Python tests passed. The QR suite independently
  decoded 36 exact URL cases using jsQR; the v1 catalog SHA-256 remained
  `b7a9416e5a019c09d5c2a5619c716fad0170809704da679ff33b8468271d96c5`.
- The Haikrew independent reviewer passed the final cache compatibility and
  complete-identifier review after an earlier review found both issues.
- `npm run deploy:check` with project-local Wrangler 4.152.0 packaged nine
  modules, 121.44 KiB / 31.20 KiB gzip, with no bindings. The `ashcode`
  profile and pinned Cloudflare account were verified before deployment.
- Nine live HTTP checks passed for the new page, old redirects, JSON, exact
  served app/codec assets, 10 mm QR URL, catalog digest, and invalid-code 404.
- Live Intel Chrome job `j-6cbfce0a7d3643f698642141d9c93cbe` completed
  all 21 steps in 4.336 seconds: builder selection and QR preview, citation,
  old-link redirect, and conflict handling. All 38 retrieved files passed
  checksum verification. Home, builder, citation, and conflict screenshots
  were inspected in `artifacts/live-browser-v2/`.

Mobile layout and physical print/phone scans remain unverified. Test the final
print material at its intended size. This receipt covers the deployed v1 site,
not any later draft vocabulary or concurrent source edits.

## Initial AI Used release — 23 October 2026

Public site: https://aiused.org

Worker: `aiused`; account is pinned in `wrangler.jsonc`.
Prior corrected version: `ef797b55-cb78-4a24-a4cd-84a259602c81`.
Initial version: `d1d5c280-e193-4925-a3c5-0450c879acb7`.
Alternate endpoint: https://aiused.ashleyraiteri.workers.dev

The deployment succeeded through project-local Wrangler 4.152.0 using the
existing `ashcode` profile. This directory has an explicit profile binding.
The global 4.85.0 CLI checked an expired default login because it did not support
the existing profile setup. No new credential or broader grant was required.

The first accepted package contains nine ES modules, 119.54 KiB total / 30.70 KiB
gzip, with no storage bindings. A root `worker.mjs` shim preserves the imported
module paths in Wrangler's no-bundle upload. Cloudflare reported 2 ms startup.

That prior version corrected an incomplete helper imported by the parallel work:
the downloadable `disclosurePath([27,94,95])` now returns the working `/1Y_3`
route. This was deployed from `artifacts/release-fix/wrangler.jsonc`, an isolated
copy of the accepted snapshot, without altering the ongoing shared-source edits.
Its source review passed and the final served codec was compared byte-for-byte.

## Evidence

- Six Python codec tests passed, including all 4096 subsets of a reduced universe,
  every v1 singleton/pair, and 2500 seeded samples across every cardinality.
- Thirteen Node tests passed, including 30 independent jsQR decoding cases.
- Haikrew independent source review passed; the published vocabulary digest is
  pinned to `b7a9416e5a019c09d5c2a5619c716fad0170809704da679ff33b8468271d96c5`.
- Intel Chrome fixture job `j-f07aa52b58f84ca4bc01ad0332b88ce6` completed all 21
  UI steps in 2.816 seconds. Retrieval verified all 33 files by checksum. Home,
  citation and conflict screenshots were inspected. This is fixture UI evidence,
  not a claim of live or physical-phone testing.
- `artifacts/live-http.json` records HTTPS route checks, matching served browser
  assets, exact 10 mm QR output, immutable catalog hash, and invalid-code 404.
- `artifacts/deployed-d1d5c280.json` and its extracted directory preserve the
  exact accepted module snapshot. Private purchasing information was excluded.
- Live Chrome job `j-6fcd6fd88a974e05a5e36f1fef140fa7` then completed all 21
  interaction steps against HTTPS aiused.org in 3.404 seconds, exit 0. All 34
  retrieved files passed checksum verification; the live homepage screenshot was
  inspected. `artifacts/live-browser-qa/` contains the evidence.
- `artifacts/release-report.json` records five final live checks for the current
  corrected release. Desktop browser interaction is verified. Mobile layout and
  physical print/phone scanning have not been visually tested.

## Concurrent work boundary

The owner confirmed another Codex session is intentionally adding blog, license,
contribution and version-path work. The first accepted release includes the blog
route and initial version helper exports. Subsequent shared-source changes were
preserved and are not automatically covered by this deployment receipt. Do not
claim a later URL-format implementation is live from this receipt alone. Read
the current source, run its checks, and verify the next deployed version.

The first-release citations used `/1Y_3`, and QR downloads used
`/qr/1Y_3.svg?mm=10&download=1`. Future routing changes must preserve existing
code meanings and links. SVG sizes are 12 mm by default with 10/16/24 mm UI options;
the four-module white border must remain. Actual print scanning is unverified.

The blog's GitHub contribution links returned 404 during this initial release's
checks. The source repository was published with the versioned citation release.
