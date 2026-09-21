#!/usr/bin/env node
// Generate a Customer NDA — either a blank template, or a copy pre-filled with
// one customer's legal name, registered address, and contact person.
//
// Usage:
//   node generate-customer-nda.js                                            # blank template
//   node generate-customer-nda.js "Company Name" "Registered Address" "Contact Name" ["Contact Title"]
//
// Example:
//   node generate-customer-nda.js "Helicon Management Experts FZE" \
//     "Business Centre, Sharjah Publishing City Free Zone, Sharjah, United Arab Emirates" \
//     "Muhammad Faraz" "Chartered Accountant"

const fs = require("fs");
const path = require("path");
const { Document, Packer } = require("docx");
const {
  XEDA, SECTION_BASE,
  txt, p,
  buildHeader, buildFooter, buildTitleBlock, buildDisclaimer, companyInfoBlock, sectionHeading,
  clauseTable, twoPartySignatureBlock, slugName, GRAY, NAVY,
} = require("./lib/letterhead");
const customerClauses = require("./lib/customer-clauses");

async function buildCustomerDoc(customerOpts) {
  const isTemplate = !customerOpts;
  const { customerName, customerAddress, contactName, contactTitle } = customerOpts || {};

  const doc = new Document({
    sections: [
      {
        ...SECTION_BASE,
        headers: { default: buildHeader() },
        footers: { default: buildFooter() },
        children: [
          ...buildTitleBlock(
            "Mutual Non-Disclosure Agreement",
            "Gegenseitige Vertraulichkeitsvereinbarung",
            "For customers and business partners of XEDA evaluating or engaged in a collaboration — bilingual template, English and German versions presented side by side, clause by clause, below.",
            "Für Kunden und Geschäftspartner von XEDA, die eine Zusammenarbeit prüfen oder durchführen — zweisprachige Vorlage, englische und deutsche Fassung nachstehend spaltenweise je Klausel gegenübergestellt."
          ),
          ...companyInfoBlock(),
          buildDisclaimer(
            isTemplate
              ? [
                  "This draft has not been reviewed by a qualified lawyer (Fachanwalt) and must be reviewed for compliance with current German law (including GDPR where personal data is exchanged) before it is used or signed.",
                  "Only the shaded field below (the Customer's name and address) and the signature block at the end need to be filled in — the clauses themselves are fixed and should not be edited without legal review.",
                ]
              : [
                  "This draft has not been reviewed by a qualified lawyer (Fachanwalt) and must be reviewed for compliance with current German law (including GDPR where personal data is exchanged) before it is used or signed.",
                  `This copy is prepared for ${customerName}. Verify the contact name and address below before signing. The signature block at the end still needs to be completed.`,
                ]
          ),
          sectionHeading("Parties / Vertragsparteien"),
          p(txt("Between / Zwischen", { italics: true, size: 19 }), { spacing: { after: 60 } }),
          p(txt(`${XEDA.legalName}, ${XEDA.street}, ${XEDA.city}, ${XEDA.country} ("XEDA")`, { size: 19 }), { spacing: { after: 100 } }),
          p(txt("and / und", { italics: true, size: 19 }), { spacing: { after: 60 } }),
          isTemplate
            ? p(txt('_________________________________________________ ("Customer" / "Kunde")', { size: 19 }), { spacing: { after: 40 } })
            : p(
                txt(
                  `${customerName}, ${customerAddress}, represented by ${contactName}${contactTitle ? " (" + contactTitle + ")" : ""} ("Customer" / "Kunde")`,
                  { size: 19, bold: true }
                ),
                { spacing: { after: 40 } }
              ),
          p(txt("[Customer company or individual name, and registered address / Name und Anschrift des Kunden]", { size: 15, italics: true, color: GRAY }), { spacing: { after: 200 } }),
          clauseTable(customerClauses),
          p("", { spacing: { before: 300, after: 100 } }),
          p(txt("Signatures / Unterschriften", { bold: true, size: 20, color: NAVY }), { spacing: { after: 120 } }),
          twoPartySignatureBlock(
            "Xeda UG (haftungsbeschränkt)",
            isTemplate ? "Customer / Kunde" : `${customerName} (${contactName})`
          ),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

async function main() {
  const [customerName, customerAddress, contactName, contactTitle] = process.argv.slice(2);

  const customerOpts = customerName
    ? { customerName, customerAddress, contactName, contactTitle }
    : undefined;

  if (customerName && (!customerAddress || !contactName)) {
    console.error("Usage: node generate-customer-nda.js \"Company Name\" \"Registered Address\" \"Contact Name\" [\"Contact Title\"]");
    console.error("   or: node generate-customer-nda.js               (blank template)");
    process.exit(1);
  }

  const buf = await buildCustomerDoc(customerOpts);

  const outDir = path.join(__dirname, "output");
  fs.mkdirSync(outDir, { recursive: true });

  const filename = customerName
    ? `XEDA_Customer-NDA_EN-DE_${slugName(customerName)}.docx`
    : "XEDA_Customer-NDA_EN-DE.docx";

  const outPath = path.join(outDir, filename);
  fs.writeFileSync(outPath, buf);
  console.log("Wrote " + outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
