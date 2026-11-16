# Remove listed prices and replace calculators with quote prompts

Prepared on `codex/tt-prices-off`, based on `22577f4`. Branch only; awaiting John's approval before publication. No staging, commit, push or publication performed; the launcher handles the commit.

## Files changed

- `index.html`: remove both cards' prices and calculators, add quote links, revise the pricing introduction to remove the same-price promise and calculator instructions, and bump asset queries.
- `site.js`: remove calculator functions, their startup call and pricing-only documentation; keep reveals.
- `effects.js`: remove price count-up targeting, price-specific text-node traversal and price documentation; keep download count-ups and all other effects.
- `styles.css`: remove unused price and calculator rules; no other style or layout changes.
- `work.html`, `privacy.html`: cache query updates only.
- `README.md`: replace listed amounts and obsolete slider/price-animation notes with quote-based pricing documentation.
- `final.md`: this review record.

## Every removed amount

References in this table are the original lines at `22577f4`. Repeated amounts on the same line are listed in source order. The deleted amounts appear here only as a review record, outside public site source.

| Original file:line | Removed amounts | Context |
| --- | --- | --- |
| `index.html:288` | £250 | Local business set-up price |
| `index.html:294` | £20 | Local business monthly price |
| `index.html:300` | £490, £250, £20 | Local business twelve-month fallback total and breakdown |
| `index.html:303` | £490 | Local business calculator output |
| `index.html:315` | £250 | Organisations set-up price |
| `index.html:321` | £20 | Organisations monthly price |
| `index.html:327` | £490, £250, £20 | Organisations twelve-month fallback total and breakdown |
| `index.html:330` | £490 | Organisations calculator output |
| `site.js:44` | £490, £490.00 | Calculator comment examples |
| `site.js:56` | currency prefix (computed amount) | Generated currency output expression |
| `effects.js:121` | £250 | Price count-up comment example |
| `README.md:30` | £250, £20, £490, £250, £20, £490 | Historical pricing and starting-price documentation |
| `index.html:301` | `25000`, `2000` pence | Local business calculator set-up/monthly data |
| `index.html:328` | `25000`, `2000` pence | Organisations calculator set-up/monthly data |

No amounts were found in other HTML pages, metadata, JSON-LD, XML/sitemap or other repository documentation. Non-price figures such as download counts, dates and plant weights are preserved.

## Quote prompt additions

Both links use the exact text "Prices depend on what you need. Ask us for a quote." and point to `#contact`, the existing "Send word" section. They are visible plain HTML with no JavaScript dependency.

- `index.html:297`: Local business, existing `btn` style.
- `index.html:316`: Organisations, existing `btn btn-on-green` style.

## Removal inventory

No files or existing tests were deleted. Original line references:

- `index.html:278`: replace the same-price promise and total-calculator instructions because pricing now depends on the client; retain the app-at-no-extra-cost wording.
- `index.html:288`, `index.html:294`, `index.html:315`, `index.html:321`: remove the four listed set-up/monthly price paragraphs.
- `index.html:298` through `index.html:306`, and `index.html:325` through `index.html:333`: replace both totals/calculator blocks, including headings, fallback totals, pence data, labels, outputs and range inputs, with quote rows.
- `site.js:6`: remove the pricing-calculator description because that enhancement is gone.
- `site.js:42` through `site.js:69`, plus `site.js:72`: remove calculator comments, `setUpSum`, `setUpSums` and their startup call because there are no calculators.
- `effects.js:7`, `effects.js:120` through `effects.js:121`, `effects.js:124`, `effects.js:230`: remove the price-animation description/example, price-specific sibling traversal and `.tier-price` count-up target; download numbers remain the first text node and still animate.
- `styles.css:515` through `styles.css:525`: remove `.tier-price` and its variants because all price paragraphs are gone.
- `styles.css:547` through `styles.css:559`: remove calculator output, label and slider styles because no calculator markup remains.
- `README.md:4` through `README.md:5`, `README.md:12`, `README.md:29` through `README.md:31`: replace obsolete slider, price-animation and amount documentation with the current quote-based behavior.
- `index.html:15` through `index.html:17`, `work.html:15` through `work.html:16`, `privacy.html:15` through `privacy.html:16`: replace old cache queries with `styles.css?v=17`, `site.js?v=9`, and (home page only) `effects.js?v=5` so browsers load the changed assets.

## Validation

- PASS: `git diff --check`.
- PASS: `git grep -n "£" -- "*.html" "*.js" "*.json" "*.xml"` returned no matches (exit 1, expected).
- PASS: focused Python source assertions compare inclusion paragraphs, tier names/descriptions, feature lists, app/notifications text, Companies statement and existing email CTAs against `22577f4` verbatim.
- PASS: focused Python checks verify two visible static quote links to Send word, all asset cache versions, removal of calculator references and encoded pound signs, and unchanged non-price CSS/effects (including stars, page turn, dawn and reduced motion).
- PASS: JavaScript syntax compilation of both scripts in an isolated runtime; reveal behavior with loading/loaded documents, IntersectionObserver/fallback paths and printing using DOM mocks.
- PASS: isolated JavaScript count-up checks for all five download figures, including exact text restoration and the paused/reduced-motion gate.
- PASS: CRLF preserved for every edited existing file; existing checker and tests untouched.
- Not run: `scripts/check_site.py`, explicitly reserved for the launcher outside the sandbox. Its result remains pending.
- Not run: real browser preview. JavaScript behavior checks used mocks; they do not verify rendering.
- No dependencies installed or network access attempted. Launcher PYTEST_ADDOPTS and TMP/TEMP settings left unchanged.
- Required modern-web-guidance skill instructions were read; its network-based guide lookup was skipped under the no-network rule.
