# taletellers-site

Our main page for TaleTellers.co.uk - the website of TaleTellers Ltd, a small UK games studio.

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
