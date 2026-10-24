# AI disclosure codex

AI Used is a public disclosure vocabulary and reversible code for aiused.org.
The first release has 99 numbered categories describing AI contributions and
human involvement. The runtime is a dependency-free ES-module Cloudflare Worker.

Keep category IDs and code versions stable once published. Never silently change
an existing code's meaning. Unselected categories mean unclaimed, not absent.
The empty set means no declarations, not proof that no AI was used. Describe
actual tool use, not features merely present in an application. These are
self-declarations, not provenance verification, certification, or legal compliance.

Use integer arithmetic. `python3 -m unittest -v` verifies the codec. Do not replace
the reversible encoding with truncated hashes or a server-side combination table.
No purchase, deployment, or publication claim without direct evidence.

Before deployment: `python3 scripts/package.py`, `node --test tests/*.test.mjs`,
and `python3 -m unittest -v`. Inspect the diff and browser behavior. Package uses
an explicit module allowlist. Never upload purchase-status.json, private
research/receipts, artifacts, tests, or the test-only jsQR decoder.

Published categories.json and v1 encoding are immutable. Its SHA-256 is pinned
in tests. A vocabulary expansion or semantic correction requires a NEW version.
The legacy preview.html is an offline prototype, not the deployed runtime.

QR defaults: full case-sensitive HTTPS URL, M correction, four-module quiet zone,
12 mm vector SVG, optional 10/16/24 mm sizes. Never promise physical scanning from
digital tests alone. Keep server-rendered citation contents readable without JS.
Canonical citations use `/1/<payload>`; compact first-release links redirect.
When HTML and browser JavaScript must change together, bump their asset URL cache
query and keep the new script compatible with cached older HTML.

Deployment uses project-local Wrangler 4.152.0 and the existing `ashcode` auth
profile, activated specifically for this directory. Account ID is pinned in
wrangler.jsonc. Use `npm run deploy:check` then `npm run deploy`; do not use the
older global Wrangler, which does not understand the named profile. Do not copy
credentials into the repo. Read DEPLOYMENT.md before claiming current source is
the live release, especially while another Codex session is editing this checkout.
