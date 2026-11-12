# Image credits

## Paper texture (licensed, credited in the footer of every page)

| File | What it is | Author | Licence | Source |
| --- | --- | --- | --- | --- |
| `images/parchment.webp` | "Paper 006", a photographed, seamless paper texture (1K colour map). Converted to greyscale, tinted to the parchment colour `#F1E4C6`, scaled to 768 px and saved as WebP (36 KB). Tiled at 512 px as the page background. | ambientCG (Lennart Demes) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [ambientcg.com/a/Paper006](https://ambientcg.com/a/Paper006) |

CC0 needs no credit; the footer credits it anyway.

## Our own screenshots and artwork

- `images/pgl-*.webp`: screenshots of TaleTellers' own Provincial Grand Lodge of Linlithgowshire concept demo
  (12 Nov 2026).
- `images/ab2000-*.webp`: screenshots of TaleTellers' own AB2000 concept demo (see the next section for the
  photographs inside them).
- `images/admin-*.webp`: screenshots of the TaleTellers admin panel (12 Nov 2026), run locally with the Provincial
  Grand Lodge of Linlithgowshire concept demo's sample content and signed in as John Willis (director, named on
  Companies House). The Photos screen's three thumbnails (the Forth Bridge, Hopetoun House, an old county map) are the
  Province's own photos from its current website, as used in the PGL demo; none shows a person.
- `images/hyguns-logo.png`: the HyGuns logo.
- `images/mod-stone.png`, `images/mod-wool.png`, `images/mod-slabs.png`: the project logos of our own Minecraft mods
  as shown on their CurseForge pages (All Stone To Tools, All Wools To String, All Slabs To Blocks), downloaded
  12 Nov 2026 from `media.forgecdn.net`, unaltered, 256 x 256. They show Minecraft items (a stone pickaxe, string, a
  cobblestone slab), which are Mojang's artwork: John to confirm he is happy using them on the company site.
- `images/logo-mark.svg` (header) and `favicon.svg`: the TaleTellers logo, logo v4
  (`brand/logo/rebrand-20261112/logo_v4.svg`, John 12 Nov 2026). Swap these two files to change it everywhere.
- The moon and stars at the top of Chapter II are the sky pieces of the old live site's hero SVG, reused unchanged
  at John's request. The motion preview (12 Nov 2026) uses the same SVG a second time, under the turning page. The
  extra stars, the logo's glints and the card sparkles are small CSS squares, not drawings. Anything that loops only
  runs when the visitor allows motion, and "Pause motion" stops it (`scripts/check_site.py` checks both).

### The AB2000 demo screenshots (12 Nov 2026)

Taken headless from <https://thescar4295.github.io/ab2000-demo/> on 12 Nov 2026 at device pixel ratio 2, scaled down
and saved as WebP. Each keeps the demo's own "Concept demo by TaleTellers Ltd" banner, as the Province screenshots
do. No person or face is in any frame (each photograph was checked at full size).

| File | What it is | Photographs visible in it |
| --- | --- | --- |
| `images/ab2000-desktop.webp` | The demo's home page at 1440 x 900. Used in the home page case study and under the address bar in "Hosting, on your own domain". | Two Kobelco SK130LC tracked excavators; a truck-mounted road sweeper, side view; a SANY SY155U tracked excavator. |
| `images/ab2000-phone.webp` | The home page at 390 x 844, saved at 520 x 1125. | The two Kobelco SK130LC tracked excavators. |
| `images/ab2000-desktop-tall.webp` | The demo's Fleet Vehicles page at 1200 x 1650. Used on `work.html`. | The SANY SY155U; a DX100W wheeled excavator; a Scania eight-wheeler with a Palfinger lorry loader; the road sweeper. |

**Credit: "Photos: AB2000."** Every photograph in these three frames is AB2000's own, taken by AB2000 of its own
fleet and supplied for its website, as the demo's own photo credits page records
(<https://thescar4295.github.io/ab2000-demo/credits/>). They are credited on this site in the `work.html` caption
("Fleet photographs: AB2000.") and in the footer of `index.html`.

None of the Unsplash or Wikimedia Commons stand-in photographs listed in the demo's `docs/IMAGE_PROVENANCE.md` is in
any of these frames, so no Creative Commons attribution is owed here. The one stand-in still used by the demo on
12 Nov 2026 ("MTS - MAN suction excavator" by Cjp24, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/),
via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:MTS_-_MAN_suction_excavator_(1).jpg)) shows workers
and was kept out of frame on purpose. If a screenshot is ever retaken with that photo in view, it needs that
credit and licence link on the page.

### The phone loop in "The app, with notifications" (motion preview, 12 Nov 2026)

Real screenshots of our own Provincial Grand Lodge concept demo, sample data, no faces or portraits in any frame.

| File | What it is | Source |
| --- | --- | --- |
| `images/pgl-phone.webp` | The Province's home screen at phone width. Already on the site; now also the loop's first frame and its still. | As before (12 Nov 2026 screenshot). |
| `images/pgl-app-meeting.webp` | "Next meetings" of Lodge St John Crofthead No. 374 at 375 x 812, saved as WebP (34 KB). The loop's last frame. | `Documents/TaleTellers/website-notes/readiness-20261109/previews/pgl-fix-20261112/final-374-375-scrolled.png` |
| `images/pgl-crest.webp` | The Province's crest, 72 x 72 (3 KB), for the reminder card. | Cropped from `images/pgl-phone.webp` (104 x 104 px at 25, 123). |

The reminder card itself is HTML and CSS, with the demo's own sample meeting as its text.

## Fonts (self-hosted in `fonts/`)

- Alegreya (variable, roman and italic), SIL Open Font License 1.1: `fonts/OFL-Alegreya.txt`. From Fontsource.
- Alegreya Sans (400, 400 italic, 500, 700), SIL Open Font License 1.1: `fonts/OFL-AlegreyaSans.txt`. From Fontsource.
