# 6. Personal home redesign

Date: 2026-11-16

## Status

Accepted

Amends [0005. 3D hero scene](0005-3d-hero-scene.md): the scene now draws
one shape, in the site's own colours, beside the text instead of above it.

## Context

The site introduced itself as a blog — "a blog by…", a scene caption
reading "Writing about what I learn" — while having no posts. What it did
have, its author, came second. Its structure was the default of every
starter template: a full-width sticky bar with the name on the left and
links on the right, over one centred column.

The site is a personal home first and a résumé second. Long-form writing
is no longer the plan; short notes and small browser games are.

## Decision

**Positioning.** The author is introduced as a software engineer in
Tashkent. The home page is one screen: role, name, a two-sentence about,
social links — and the mark.

**Navigation.** A small pill floating at the top of every page replaces
the full-width bar: the "i2" mark and first name (home), then the
sections, the résumé (opens the PDF), and the theme toggle. Three
structures were prototyped side by side on the real site — corner marks
with links under the hero, this floating bar, and a home page that is
itself the index — and the bar won: it is the only one that keeps every
destination visible on every page without adding a second layout for
inner pages.

**Sections appear when they have something in them.** The blog became
**Notes** (`/notes`): short entries, same pipeline. A section is linked
from the bar, the home page and the sitemap only once it holds at least
one entry; its route exists before that but is advertised nowhere. Games,
under the name **Play**, will follow the same rule.

**The scene.** The cloud no longer cycles through four shapes with
captions; it gathers into the "i2" mark and stays. A click bursts it
apart and it gathers again. It is drawn in the page's own ink with the
one accent (0004) on the dot of the "i" — the scene-only palette 0005
allowed is withdrawn, and with it the coloured glow. Until WebGL arrives,
and for readers without it, a still of the mark drawn as dots stands in.
On wide screens the mark sits beside the text; on phones, above it. The
rule from 0005 that no text is drawn over the scene still holds.

**One mark.** The mark's geometry lives in one module (`lib/i2-mark.ts`)
and is drawn from there everywhere: the logo in the bar, the favicon,
the Open Graph image and the particle shape.

## Consequences

- The scene no longer says what the author does through captions; the
  text beside it does.
- A section with no entries is invisible, so an empty Notes page is never
  the first thing a visitor finds. Its URL still answers, with an empty
  listing.
- `/blog` URLs are gone. Nothing was published under them.
- The mark is a trace of the original raster logo, not a vector original.
  Redrawing it means editing one module.
