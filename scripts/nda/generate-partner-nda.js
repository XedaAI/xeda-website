#!/usr/bin/env node
// Generate a Partner Confidentiality Agreement — either a blank template, or
// a copy pre-filled with one partner's name (and, optionally, their signature).
//
// Usage:
//   node generate-partner-nda.js                                  # blank template
//   node generate-partner-nda.js "Full Name"                      # named, unsigned
//   node generate-partner-nda.js "Full Name" --sign path/to/signature.png --date 16.09.2026
//
// Signature image should be a transparent-background PNG, ink-only (crop tight,
// strip the paper's shadow/gradient). See README.md for how to produce one from
// a phone photo of a real signature.

const fs = require("fs");
const path = require("path");
const { Document, Packer } = require("docx");
const {
  XEDA, SECTION_BASE,
  txt, p,
  buildHeader, buildFooter, buildTitleBlock, companyInfoBlock, sectionHeading,
  clauseTable, twoPartySignatureBlock, slugName, GRAY, NAVY,
} = require("./lib/letterhead");
const partnerClauses = require("./lib/partner-clauses");

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--sign") flags.sign = argv[++i];
    else if (a === "--date") flags.date = argv[++i];
    else if (a === "--out") flags.out = argv[++i];
    else positional.push(a);
  }
  return { positional, flags };
}

function readPngDimensions(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function buildPartnerDoc(partnerName, signOpts = {}) {
  const isTemplate = !partnerName;
  const { signatureBuffer, signatureWidth, signatureHeight, signedDate } = signOpts;

  const partyLine = isTemplate
    ? p(txt('_________________________________________________ ("Partner" / "Partner:in")', { size: 19 }), { spacing: { after: 40 } })
    : p(txt(`${partnerName} ("Partner" / "Partner:in")`, { size: 19, bold: true }), { spacing: { after: 40 } });

  const hintLine = isTemplate
    ? p(txt("[Partner's full name / Name des/der Partners:in] — collaborating with XEDA under a partner arrangement, not an employment relationship.", { size: 15, italics: true, color: GRAY }), { spacing: { after: 200 } })
    : p(txt("Collaborating with XEDA under a partner arrangement, not an employment relationship.", { size: 15, italics: true, color: GRAY }), { spacing: { after: 200 } });

  const doc = new Document({
    sections: [
      {
        ...SECTION_BASE,
        headers: { default: buildHeader() },
        footers: { default: buildFooter() },
        children: [
          ...buildTitleBlock(
            "Partner Confidentiality Agreement",
            "Partner-Vertraulichkeitsvereinbarung",
            "For individuals collaborating with XEDA as partners (not employees) — bilingual template, English and German versions presented side by side, clause by clause, below.",
            "Für Personen, die mit XEDA als Partner (nicht als Arbeitnehmer) zusammenarbeiten — zweisprachige Vorlage, englische und deutsche Fassung nachstehend spaltenweise je Klausel gegenübergestellt."
          ),
          ...companyInfoBlock(),
          sectionHeading("Parties / Vertragsparteien"),
          p(txt("Between / Zwischen", { italics: true, size: 19 }), { spacing: { after: 60 } }),
          p(txt(`${XEDA.legalName}, ${XEDA.street}, ${XEDA.city}, ${XEDA.country}, represented by its managing director (Geschäftsführer) ${XEDA.gf} ("XEDA")`, { size: 19 }), { spacing: { after: 100 } }),
          p(txt("and / und", { italics: true, size: 19 }), { spacing: { after: 60 } }),
          partyLine,
          hintLine,
          clauseTable(partnerClauses),
          p("", { spacing: { before: 300, after: 100 } }),
          p(txt("Signatures / Unterschriften", { bold: true, size: 20, color: NAVY }), { spacing: { after: 120 } }),
          twoPartySignatureBlock(`${XEDA.legalName} (${XEDA.gf}, Geschäftsführer)`, "Partner / Partner:in", {
            rightSignature: signatureBuffer ? { buffer: signatureBuffer, width: signatureWidth, height: signatureHeight } : undefined,
            rightName: signatureBuffer ? partnerName : undefined,
            rightDate: signedDate,
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const partnerName = positional[0]; // undefined => blank template

  let signOpts = {};
  if (flags.sign) {
    const sigBuf = fs.readFileSync(flags.sign);
    const { width, height } = readPngDimensions(sigBuf);
    signOpts = { signatureBuffer: sigBuf, signatureWidth: width, signatureHeight: height, signedDate: flags.date };
  }

  const buf = await buildPartnerDoc(partnerName, signOpts);

  const outDir = flags.out ? path.resolve(flags.out) : path.join(__dirname, "output");
  fs.mkdirSync(outDir, { recursive: true });

  const suffix = signOpts.signatureBuffer ? "_SIGNED" : "";
  const filename = partnerName
    ? `XEDA_Partner-Confidentiality-Agreement_EN-DE_${slugName(partnerName)}${suffix}.docx`
    : "XEDA_Partner-Confidentiality-Agreement-Template_EN-DE.docx";

  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buf);
  console.log("Wrote " + outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
