# Contributing to AI Used

AI Used is an open source vocabulary and citation tool. You can propose new
declarations, clearer wording, accessibility fixes, code changes, documentation,
and translations through a GitHub pull request. Please open an issue first for a
large vocabulary change so its scope can be discussed before implementation.

## The link is a promise

Every disclosure URL contains a version segment and a short, case-sensitive code:
`/1/Y_3` is version 1 with code `Y_3`. The code reversibly encodes the selected
category IDs. A code does **not** identify a
particular creator, work, date, or edit history.

Version tokens use the URL-safe base-64 alphabet
`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_` as positive
integers, with no leading zero. Tokens such as `1`, `z`, and `FE` fit in one or
two characters; three or four characters are available as needed. Two characters
can represent values up to 4095. Each released version needs a permanent catalog
and decoder. The runtime currently supports version `1`; a syntactically valid
future version token does not yet resolve to a disclosure.

Version 1's `categories.json`, IDs, meanings, and encoding are frozen. A PR may
explain an ambiguity in documentation or improve the UI, but must not silently
change the meaning of an existing code. If a declaration needs new wording that
changes what it asserts, or a declaration needs to be added or retired, propose a
new vocabulary version. Existing version 1 URLs must continue to decode to their
original text. Do not redirect an old code to a new meaning. A new version must
have its own frozen catalog, version marker, routes, tests, and compatibility
vectors before release. The current runtime supports version 1; a PR introducing
version 2 must implement and test that support, not merely edit the v1 file.

For changes to a particular creator's disclosure, choose the corrected set in the
picker and replace the link attached to that work. The same set always has the
same code, so a repository PR cannot modify one creator's page independently.
The creator controls where their link appears. Metadata such as creator identity,
tool names, model versions, and evidence belongs alongside the work, outside the
short code.

## Submit a PR

1. Fork the repository and create a branch for one focused change.
2. Describe the problem, proposed wording or behavior, and an example work or
   workflow. For a vocabulary change, say whether it changes the truth conditions
   of an existing declaration and which version should carry it.
3. Add focused tests for code or route changes. Keep the v1 digest test intact.
4. Run `npm test` (Node 22+ and Python 3). For a UI change, inspect the rendered
   home and citation pages in a browser.
5. Open a PR using the template. A maintainer reviews scope, compatibility,
   wording, accessibility, and the test results before merging.

The source and original text are MIT licensed (see `LICENSE`). Vendored packages
retain their own notices in `vendor/`. By submitting a PR, you agree that your
contribution can be distributed under the project's license. Please submit only
content you have the right to share. A merged PR changes the source repository;
deployment to aiused.org is a separate maintainer action.
