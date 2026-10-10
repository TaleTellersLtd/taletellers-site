# Website decisions for John

Based on `AUDIT_20261010.md`. These items need verified facts or approval before
publishing; no replacement company details, URLs or legal promises have been guessed.
Existing factual claims and unresolved placeholders remain pending these decisions.

| Audit item | Decision / evidence needed | Where to apply it |
| --- | --- | --- |
| F1 / D1: legal identity | Confirm incorporation and exact registered name, number, registration jurisdiction and approved registered office. If unincorporated, supply the trading identity and approve replacing the Ltd references. Do not infer jurisdiction from the founder's university. | Homepage footer/copyright and README company wording. |
| F2 / D2: contact | Supply an approved business mailbox. Supply verified community/profile URLs, or confirm no community exists and approve removing that placeholder item. | Contact section and its hero action. |
| F2 / D2: downloads | Supply verified All Stone To Tools and All Wools To String download URLs and a Hyguns Plugin URL if available. Verify the existing Hyguns CurseForge URL when online. | Project cards. |
| F4 / D4: privacy | Approve a notice based on the actual controller/contact, data categories, purposes, lawful bases, hosting/mail providers, recipients, international transfers/safeguards, retention, rights/complaints and verified cookie/storage behaviour. Include indirect data sources where applicable. | Add a complete privacy page, footer link and sitemap entry together. No unfinished legal scaffold is linked. |
| F5 / D5: statistics | Supply one dated snapshot and sources for mod, plugin, stone, wool and combined downloads without double-counting. The three shown minima add to 335K; rounding/omitted wool could explain 337K, so no automatic correction is justified. Confirm the "most-downloaded release" claim. | Hero, project cards, figures footnote and About paragraph. |
| F5 / D5: product facts and roadmap | Supply verified descriptions of the two Minecraft mods and confirm planned Hytale server/tools, Roblox games and any milestones. The Hytale tile now calls the server/tools planned, matching their existing Coming soon cards. | Project descriptions and About/platform copy. |
| F5: branding | Confirm whether "HyGuns server" and "Hyguns" intentionally use different capitalisation. | Server card title; do not rename the product without approval. |
| F5: founder information | Confirm approval to publish the University of Edinburgh/student affiliation; decide whether to keep it or remove it. Approve any optional photo/bio and suitable alt text. | About section. |
| F6 / D6: social artwork | Approve a 1200 x 630 PNG/JPEG, final artwork and descriptive alt text. Use a compact local asset (aim below 200 KB), then add its absolute OG/Twitter URL, dimensions and alt text and enable the large Twitter card. | Head metadata and new social image asset. Current text summary remains usable. |
| Future service terms/pricing | If sales, subscriptions or server accounts launch, supply the actual offering, pricing and approved terms. There is no checkout/account flow or price to fix now. | Future service pages; no terms or prices invented. |
| Hosting response headers | Decide whether to retain GitHub Pages or use an approved host/proxy with custom response headers. This repository has no GitHub Pages mechanism for those headers. Verify current live headers when online, then configure CSP including `frame-ancestors`, `X-Content-Type-Options: nosniff`, an appropriate framing policy, Referrer-Policy and Permissions-Policy. Approve HSTS only after confirming HTTPS coverage; do not guess subdomain/preload commitments. | Hosting configuration. Meta CSP/referrer protections are already added; meta tags cannot enforce response-only directives or framing restrictions. |

## Verification still needed

- The branch's offline source checker passes. Local headless browser attempts
  produced no DOM output: Chrome exited with `2147483651` (`0x80000003`) and Edge
  with `3221225477` (`0xC0000005`). Layout/zoom and runtime performance are therefore
  unverified; installed executables alone did not provide a usable renderer.
- Browser keyboard navigation, screen reader output, forced colours, zoom and larger
  real emails/addresses after replacing placeholders.
- Live external URLs, DNS/TLS, HTTP status/redirects, deployed headers, compression
  and caching; unavailable offline.
- F9 / D9: profile actual hero/scroll paint cost and Core Web Vitals before changing
  mobile backdrop blur. The audit explicitly makes that change conditional on
  measured benefit. Static artwork already removes continuous animation work.

## Implemented without owner decisions

- F3 / D3: header/nav wrapping, 44 CSS px default navigation targets, corrected
  mobile eyebrow cascade, narrow stats stacking and long-text wrapping. The mobile
  header scrolls normally so a wrapped header cannot cover anchors or focus.
- F7 / D7: static decorative hero artwork; reduced-motion and forced-colours rules
  retained.
- F8 / D8: homepage canonical, root-only sitemap and robots sitemap pointer. The
  error page remains noindex and is excluded from the sitemap.
- Page-level CSP and no-referrer policy for both pages. Platform gradients moved
  unchanged from inline attributes into the stylesheet. The self-contained 404
  uses a hash for its inline CSS; `scripts/check_site.py` checks that hash.
