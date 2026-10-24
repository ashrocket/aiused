# “Made with AI” leaves too much out

When someone puts “made with AI” beside a piece of work, I still want to know
what happened. Did a spelling checker suggest a comma? Did a model extend an
image? Did an agent edit code and run the tests? Those are different kinds of
help. One label shouldn't have to carry all of them.

AI Used is a small way to be more specific. Pick the statements that describe
the work in front of you, including what a person directed, changed, or
reviewed. You get a link that a reader can open without an account.

Say AI extended the edge of an illustration, then a person revised and fully
reviewed the result. The selected statements are 27, 94, and 95. Their link is
[`aiused.org/1/Y_3`](https://aiused.org/1/Y_3). The page spells out each
statement, and a QR code can carry the same URL on a printed piece.

The first path segment is the vocabulary version. In `/1/Y_3`, `1` is the
published version of the statements, and `Y_3` is a reversible code for the
selection. There is no database of possible combinations. The source explains
the calculation, so anyone can read a code independently of this website. Most
small selections produce a short link; even the largest possible selection
fits in 17 code characters.

That version number matters. If we quietly changed what a published statement
means, an old link could tell a new story. The original 99 statements are
therefore fixed. We can improve wording or add ideas in a future vocabulary
version and keep the old links readable. The full application, vocabulary, and
tests are [open source](https://github.com/ashrocket/aiused). If a definition
is unclear, [send a pull request](https://github.com/ashrocket/aiused/blob/main/CONTRIBUTING.md).

A code describes selected actions. It does not name the creator or identify a
particular work. If you need to correct your own disclosure, make a new link
from the corrected selection and replace the link beside your work. A PR cannot
edit only your page because the same selection has the same code for everyone.
Names of tools, dates, model versions, and supporting evidence can live with
the work itself.

This is a self-declaration. It does not detect AI, prove a claim, certify a
work, or measure its quality. Unselected statements are unclaimed. Even an empty
code does not say “no AI.” I would rather give a reader a precise claim they
can ask about than a badge that seems to settle a question it cannot answer.

You can [read the vocabulary](https://aiused.org/v1),
[make a disclosure](https://aiused.org/#builder), or
[look at the source](https://github.com/ashrocket/aiused).
