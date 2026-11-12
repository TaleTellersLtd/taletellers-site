# The page turn: references and the approach taken

**Approach taken:** a flat page peel in the style of turn.js (a rotated clip hides the lifted part of the page and a
mirrored sheet is the back of the paper), driven by plain CSS keyframes on the page's existing scroll timeline, with
no script, because that moves only `transform` and `opacity` and so stays smooth on a phone.

Studied on 12 November 2026, before building. No code was copied from any of these; the notes record how each one
fakes the curl.

| Reference | What it does | What we took from it |
| --- | --- | --- |
| [StPageFlip / page-flip](https://github.com/Nodlik/StPageFlip) (Nodlik, MIT) | JavaScript works out the fold on every frame from where the corner has been dragged: the corner is kept within one page-width of the foot of the spine (so the paper cannot tear), the fold is the line half-way between the corner's old and new places, and the page and its back are cut out with `clip-path: polygon()`. Two gradient strips are turned to lie along the fold: an outer shadow on the page beneath and an inner one on the back of the paper. | The geometry: the back of the page is the page mirrored in the fold, the fold must never cross the spine, and the shading is two strips that follow the fold. Not its method: a new polygon on every frame repaints a full-screen page. |
| [turn.js](http://www.turnjs.com/) (Emmanuel Garcia; version 4 is not free for commercial use) | The older trick, from before `clip-path`: a wrapper with `overflow: hidden` is rotated so one of its edges is the fold, and the page inside is rotated back by the same angle so it stays still. Gradients give the fold its shading. | The method: rotated clips need only `transform`, which the browser can animate without repainting. |
| ["CSS 3D Bending Effect - Page Flip"](https://codepen.io/_fbrz/pen/eYrNeW) (Fabrizio Bianchi, CodePen) | The page is cut into about ten strips, each nested in the last and turned a few degrees with `rotateY`, so the leaf bends like card as it swings over. | Nothing directly. It bends the whole leaf from the spine, which is the "door" John wanted to get away from, only softer. |
| Hinged leaf, as in [this page flip write-up](https://alvarotrigo.com/fullPage/page-flip-effect/) and many CodePen books | One `rotateY(-180deg)` about the spine under `perspective`, with `backface-visibility: hidden` and a second face for the back. | This is what the site did before (a 90 degree version). It reads as a door or a panel, not as paper. |
| Corner curls made of a gradient triangle (for example [this tutorial](https://www.javaspring.net/blog/how-to-implement-dynamic-page-turning-curling-with-javascript/)) | A triangle with a diagonal gradient and a soft shadow sits in the corner and grows. | The look of the first moment: a light band along the fold and a shadow outside it. On its own it cannot travel across the page. |

## How ours works

The fold is a straight line through a point on the page's bottom edge, leaning to the right. Two numbers describe
it: where it meets the bottom edge and how far it leans. Both run from "at the bottom outer corner, leaning 44
degrees" to "on the spine, upright" as the visitor scrolls, so the corner lifts first, the fold travels across
diagonally, and it stands up as it reaches the spine.

Four pieces ride that line, and all of them only ever get a `transform` (see "The page turn" in `styles.css`):

1. `.turn-clip`: a very large box whose right edge is the fold. It hides whatever lies beyond the fold.
2. `.turn-flat`: inside it, the exact opposite move, so the chapter page inside stays where it was.
3. `.turn-flap`: the page again, mirrored in the fold: the back of the paper, a little darker. Its `::before` is a
   strip of shading along the fold (dark where the paper stands on edge, then a band of light), and its
   `box-shadow` falls on the page it lies on. The mirror is slightly squashed, because paper in the air is seen
   foreshortened; that is what stops it looking like a sheet folded flat.
4. `.turn-cast`: a strip of shadow on the sky and Chapter II, along the fold.

Because the keyframes are plain `translateX() rotate()` lists with the same stops in every piece, the browser moves
all four in step, on the scroll timeline, off the main thread. Nothing is repainted during the turn.

## Kept from before

- Full screen, pinned for `--turn-run` of scroll, then the page is gone and Chapter II is under it.
- Only inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`. Anywhere else the
  extra boxes are `display: contents` or `display: none` and the chapter page is the plain page.
- No script is involved, so there is no "script failed" state.
