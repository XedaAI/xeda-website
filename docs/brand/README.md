# XEDA brand assets

Logo files for use outside this repo — decks, documents, email signatures,
social profiles. **The website does not import any of these.** The site draws
its logo from inline SVG components (`src/components/XedaMark.tsx`,
`XedaWordmark.tsx`, `XedaMarkAnimated.tsx`) so it can inherit `currentColor`
and follow the theme. These files exist so nobody has to screenshot the site or
re-export the logo by hand.

They live in `docs/` rather than `public/` on purpose: `public/` is copied into
every production build and served to every visitor, and these are internal
working files, not site assets.

## Which file do I use?

| Need | Use |
| --- | --- |
| Word, PowerPoint, Keynote, Slides, Figma, Canva, print | `SVG/` |
| Anything that rejects SVG | `PNG/` |

SVG scales to any size without blurring. PNG is a fixed pixel grid — fine at or
below its stated size, blurry above it. Prefer SVG unless the tool refuses it.

## Black or white?

- `-black` — for light backgrounds (white paper, light slides)
- `-white` — for dark backgrounds

Both have transparent backgrounds. There is no colour version: the mark is
monochrome by design.

## What's what

| File | Use for |
| --- | --- |
| `xeda-lockup-*` | Mark above the XEDA wordmark. **The default** — use this unless you have a reason not to. |
| `xeda-mark-*` | The orbit symbol alone. Avatars, app icons, a small repeated device. |
| `xeda-wordmark-*` | Just the word XEDA. Tight horizontal spaces — document headers, email signatures. |
| `xeda-favicon.svg` | Mark on a dark rounded square. Browser tabs and profile pictures only. |

PNG sizes: `@1024` for slides and screen, `@2048` for print or large format.

## Using it well

- Keep clear space around the logo — at least the height of the orbit mark.
- Scale proportionally. Never stretch one axis.
- Don't recolour, add effects, outline, or rotate it.
- Don't place it on a busy photo. If you must, put a plain panel behind it.
- On a dark background use the `-white` files, not `-black` at reduced opacity.

## Provenance — please read

These were traced from the approved black-and-white brand artwork, so the
letterforms follow the real design rather than a system font. They are accurate
and safe for everyday business use.

They are **not** a designer's original vector master. For anything high-stakes —
large-format print, signage, vehicle livery, merchandise, or a trademark filing —
commission proper artwork from whoever produced the original concept. A trace is
a very good likeness; it is not the source of truth.

## Regenerating the PNGs

The PNGs are derived from the SVGs, so they never need to be edited by hand:

```sh
brew install librsvg
cd docs/brand/SVG
for f in xeda-mark-black xeda-mark-white \
         xeda-wordmark-black xeda-wordmark-white \
         xeda-lockup-black xeda-lockup-white; do
  rsvg-convert -w 2048 -o "../PNG/${f}@2048.png" "$f.svg"
  rsvg-convert -w 1024 -o "../PNG/${f}@1024.png" "$f.svg"
done
rsvg-convert -w 512 -o ../PNG/xeda-favicon@512.png xeda-favicon.svg
```

If the logo itself ever changes, update the SVGs and the three components in
`src/components/`, then re-run the above.
