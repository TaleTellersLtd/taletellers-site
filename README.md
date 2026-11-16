# taletellers-site

> **Live site since 12 Nov 2026: "One book, two chapters".** Pages: `index.html` (Chapter I Websites, Chapter II
> Worlds), `work.html` (case studies), `privacy.html`, `404.html`. `site.js` adds the reveals; the pages work
> without it. Fonts are self-hosted in `fonts/` (Alegreya, Alegreya Sans). Logo: swap
> `images/logo-mark.svg` (header) and `favicon.svg`. Credits: `IMAGE_CREDITS.md`. Older notes below describe the
> previous site.
>
> **Motion preview (branch `effects-preview-20261112`, not live).** `effects.js` (home page only, deferred, about
> 3.9 KB gzipped) and the "Effects" part of `styles.css` add: drifting and twinkling stars and a glinting logo on
> the cover, a phone that plays a 10-second loop of the Province demo, a page turn into Chapter II's night sky,
> count-up download figures, and tilting cards with pixel sparkles. Rules the check enforces: every
> `@keyframes` and every looping animation sits inside `@media (prefers-reduced-motion: no-preference)`, loops only
> run on `.is-live` (on screen), and the "Pause motion" button (`.motion-toggle`) stops them. The page turn and the
> parallax are CSS scroll-driven animations inside `@supports (animation-timeline: view())`; other browsers get the
> plain page.
>
> **Motion tweaks (branch `effects-tweaks-20261112`, 12 Nov 2026, not live).** The page turn's runway is one screen
> plus `--turn-run` (36lvh; it was 75svh) and the stage's `perspective` is 200vw (it was 320vw). The leaf carries a
> shade and a sheen (`.chapter-page::after` and `::before`) and throws a shadow on what lies beneath (`.turn-cast`);
> all three are still gradients that only fade and slide. Chapter II is pulled up under the stage, so its heading is
> uncovered by the turn, with `--turn-breath` of sky above it. The `page-turn` angles belong to that perspective:
> they keep the page's edge crossing the screen at an even pace, so work them out again if the perspective changes.
> The hero's "The app" screen plays the same `.phone-loop` as the "app, with notifications" plate, cut to the hero's
> frame; the check fails a `.phone-loop` without `data-live`.
>
> **Content round (same branch, 12 Nov 2026, not live).** Cover line: "A Scottish creative studio building websites,
> apps and video game mods." Two showcases only: the Provincial Grand Lodge of Linlithgowshire and AB2000 (a Scottish
> plant hire firm), each a concept demo; the "Coming soon" slot stays. Services: no price list and no
> plans (John, 16 Nov 2026). The old pricing section is one short block, "We create websites for large businesses,
> small businesses and organisations", with a "Get in touch" button to the contact section; it keeps the id `pricing`
> so older links still work, and the nav calls it "Services" (branch only; awaiting John's approval before publication).
>
> **Book round (branch `pricing-app-optional-20261112`, 12 Nov 2026, not live).** This replaces what the two motion
> notes above say about the page turn and the cover's stars.
> 1. In one column (up to 62rem wide) every picture sits below its heading and text; the HTML order is unchanged
>    (`order` in `styles.css`).
> 2. The page turn is a real leaf: the bottom outer corner lifts, the fold travels across and the back of the paper
>    shows. It is still CSS only, on the scroll timeline, inside `@supports (animation-timeline: view())`:
>    `.turn-clip` (a rotated clip whose edge is the fold), `.turn-flat` (the opposite move, so the page stays put),
>    `.turn-flap` (the page mirrored in the fold) and `.turn-cast` (the shadow beneath). The three `turn-*`
>    keyframe sets must keep identical stops. How and why: `docs/PAGE_TURN_REFERENCES.md`. The runway
>    (`--turn-run`) is now 50lvh.
> 3. Chapter II's lead has no drop cap. Chapter I's is exactly two lines deep.
> 4. The cover's sky has three layers that move 12, 24 and 40 px (`data-drift`): with the mouse anywhere over the
>    night header and the cover, or with an Android phone's tilt (about 9 degrees is the full lean; https only). A
>    phone that reports no tilt gets `.fx-ambient`, a slow CSS drift. "Pause motion" stops all three. Never use
>    `DeviceOrientationEvent.requestPermission` to detect an iPhone: Chrome has that function too.
>
> **Gentle round (branch `gentle-dawn-20261112`, 12 Nov 2026, not live).**
> 1. `prefers-reduced-motion: reduce` gets a gentle version, not a bare one: "The gentle version", the last block of
>    `styles.css`. Reveals are 260 ms fades, hover only changes colour, and the page turn is a 400 ms fade from the
>    paper chapter page into night: `effects.js` sets `.is-night` on `.chapter-turn` once the word "Worlds" is above
>    45% of the screen and takes it off on the way back up. Nothing moves or loops, so "Pause motion" stays hidden.
>    `site.js` now sets `.js` and the reveal classes for everyone; the stylesheet decides what they do.
> 2. The check has a fourth motion rule: inside a `prefers-reduced-motion: reduce` block there is no animation, and
>    a transition may only name opacity or a colour.
> 3. `.dawn`, between `.worlds` and `.contact` on the home page: a gradient from the night's colour to see-through
>    over the page's own paper, with stars that thin out. Its height is in `svh`, so it never changes. Hidden in
>    print and in forced colours.

Our main page for TaleTellers.co.uk - the website of TaleTellers Ltd, a Scottish creative studio that builds
websites and apps and makes video game mods.

Plain static HTML/CSS served by GitHub Pages. No build step, no JavaScript, no external fonts,
CDNs, trackers or analytics. Do not change or delete `CNAME` (it sets the custom domain).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, projects, about, contact, footer |
| `styles.css` | All styles (dark theme, CSS/SVG art, responsive, reduced-motion) |
| `privacy.html` | Short privacy page (no cookies/analytics, GitHub Pages logs, contact). Linked from the footer of `index.html` and itself; not on `404.html` (see below) |
| `404.html` | "Page not found" page. Self-contained (inline CSS, data-URI favicon) because GitHub Pages serves it at any missing path, however deep |
| `favicon.svg` | Site icon |
| `CNAME` | Custom domain for GitHub Pages - leave alone |
| `robots.txt`, `sitemap.xml` | Search discovery for the homepage (404 excluded) |
| `SITE_DECISIONS.md` | Audit items requiring John's facts or approval and remaining verification |
| `scripts/check_site.py` | Offline source checks, including the 404 inline CSS CSP hash |

`404.html` has no footer and its inline CSS is pinned by a CSP hash, so it has no Privacy link;
adding one means editing that CSS and recalculating the hash (see below).

## Preview locally

Either open `index.html` directly in a browser (double-click it), or run a local server from this folder:

```
python -m http.server 8000
```

then visit http://localhost:8000/ (and http://localhost:8000/404.html for the error page).
The 404 page's "Back" button links to `/`, which only goes home when served from the site root.

## Check locally

There are no build/lint tools or dependencies. Run the offline source checks with
Python's standard library:

```
python scripts/check_site.py
```

Both pages declare Content Security Policy and a no-referrer policy in their head.
The homepage allows same-origin CSS; platform colour gradients live in `styles.css`.
The 404 stays self-contained and allows only its hashed inline style block. If that
CSS changes, recalculate its SHA-256 hash over the exact text between `<style>` and
`</style>` (including whitespace, with HTML line endings normalised to LF) and update
the CSP meta tag; the checker detects a stale hash.

GitHub Pages cannot apply custom response headers from a repository `_headers` file.
Response-only protections and live header checks are tracked in `SITE_DECISIONS.md`.
The audit's mobile backdrop-blur change awaits performance profiling; decorative
hero animation is disabled for all visitors. No scripts, trackers or analytics added.

## TODO before publishing

See `SITE_DECISIONS.md` for the audit's owner decisions, including privacy notice
facts and approved social artwork. Keep unresolved company claims under review.

Placeholders are marked with `TODO` in the HTML (visible ones use a dashed amber `.todo` box, so they are
hard to miss). Search for `TODO` to find them all.

- Contact email (index.html, Contact section).
- Social / community links: Discord, YouTube, X/Bluesky, CurseForge profile - only real ones.
- Footer legal details: Company No., place of registration (Scotland or England & Wales), registered office address.
  UK companies must show these on their website.
- Verify the Hyguns CurseForge URL (`https://www.curseforge.com/hytale/mods/hyguns`).
- Download links for All Stone To Tools and All Wools To String.
- One-line descriptions for All Stone To Tools and All Wools To String; download count for All Wools To String.
- Download figures verified on CurseForge 16 Oct 2026: Hyguns 87.1K, Hyguns Plugin 65.1K, All Stone To Tools 188.9K, All Slabs To Blocks 80.8K, All Wools To String 3.1K (combined 425K+). Update them now and then.
- `og:image`: add a 1200x630 PNG and an absolute `og:image` URL (commented out in `<head>`); then switch
  `twitter:card` to `summary_large_image`.
- Optional: team/founder photo and short bio (About section).
- Update the copyright year when needed (it is static text, no JavaScript).
