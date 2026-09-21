# NDA generator

Generates XEDA's two NDA documents as bilingual (EN/DE) `.docx` files on the
XEDA letterhead: the **Partner Confidentiality Agreement** (for XEDA's own
team members — we don't have employees, only partners) and the **Customer
NDA** (a mutual NDA for external parties: customers, contractors, vendors).

Both share the same letterhead, table styling, and signature-block layout via
`lib/letterhead.js`, so appending a new clause or tweaking the look only
needs to happen in one place.

## Setup

From the repo root:

```bash
npm install
```

(`docx` is a devDependency of the main `package.json`.)

## Usage

Blank templates:

```bash
node scripts/nda/generate-partner-nda.js
node scripts/nda/generate-customer-nda.js
```

A named, unsigned copy for one partner:

```bash
node scripts/nda/generate-partner-nda.js "Jane Doe"
```

A signed copy — pass a transparent-background PNG of just the ink (crop
tight, strip the paper's shadow/gradient background) and the signing date:

```bash
node scripts/nda/generate-partner-nda.js "Jane Doe" --sign path/to/signature.png --date 16.09.2026
```

A filled Customer NDA:

```bash
node scripts/nda/generate-customer-nda.js "Acme GmbH" "Musterstr. 1, 12345 Berlin, Deutschland" "Max Mustermann" "Geschäftsführer"
```

All output lands in `scripts/nda/output/` (gitignored) unless `--out <dir>`
is passed to the partner script.

## Producing a clean signature PNG from a phone photo

A photo of a handwritten signature usually has a paper shadow/gradient
background and is rarely level. A quick way to clean one up with Pillow:

1. Isolate ink pixels by color (blue pen ink has `blue > red`; paper does
   not), not by brightness alone — a lighting gradient makes brightness
   thresholds unreliable.
2. Crop tightly to the ink's bounding box.
3. If the photo is tilted, use PCA on the ink pixel coordinates (or just
   eyeball it) to find the rotation angle, then rotate and re-crop.
4. Export as RGBA PNG: ink color opaque, everything else alpha `0`.

## Files

- `lib/letterhead.js` — shared header/footer/logo, disclaimer box, company
  info block, bilingual clause table, and two-party signature block (with
  optional signature image + printed name).
- `lib/partner-clauses.js` / `lib/customer-clauses.js` — the clause text.
  Add a clause here and both the template and every generated copy pick it
  up automatically.
- `assets/xeda-wordmark-black.png` — the header logo. Solid dark ink, for
  use on white/light backgrounds only (the chrome/silver brand variants are
  for dark backgrounds and wash out on paper — see
  `XEDA-Brand-Assets/README.txt`).
- `generate-partner-nda.js` / `generate-customer-nda.js` — the CLI entry
  points described above.

## Notes

- These are templates, not legal advice — each carries a "TEMPLATE — NOT
  LEGAL ADVICE" disclaimer and should be reviewed by a Fachanwalt before
  use.
- XEDA's own registered details (`lib/letterhead.js`'s `XEDA` constant) are
  sourced from `src/pages/Impressum.tsx` — keep the two in sync if either
  changes.
