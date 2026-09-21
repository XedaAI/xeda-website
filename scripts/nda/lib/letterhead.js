// Shared XEDA letterhead + document scaffolding for NDA generation.
// Used by generate-partner-nda.js and generate-customer-nda.js so both
// documents stay visually and structurally identical.

const fs = require("fs");
const path = require("path");
const {
  Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, VerticalAlign, TableLayoutType, ImageRun,
} = require("docx");

const LOGO_PATH = path.join(__dirname, "..", "assets", "xeda-wordmark-black.png");
const logoBuffer = fs.readFileSync(LOGO_PATH);
const LOGO_ASPECT = 191 / 1024; // height / width of the source PNG
const LOGO_WIDTH = 130;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH * LOGO_ASPECT);

const NAVY = "1F3864";
const ALT_SHADE = "F2F2F2";
const DISCLAIMER_SHADE = "FFF7D6";
const GRAY = "595959";
const CONTENT_WIDTH = 9020; // dxa, A4 portrait with 1" margins
const COL_WIDTH = Math.floor(CONTENT_WIDTH / 2);

// XEDA's own registered details — from https://heliconexperts.com's counterpart,
// the xeda-website Impressum (src/pages/Impressum.tsx). Update both together.
const XEDA = {
  legalName: "Xeda UG (haftungsbeschränkt)",
  street: "Bismarckstr. 54",
  city: "67059 Ludwigshafen am Rhein",
  country: "Deutschland",
  phone: "+49 179 4158530",
  email: "saad.bakhtiyar@xeda.ai",
  court: "Amtsgericht Ludwigshafen am Rhein",
  hrb: "HRB 71014",
  gf: "Muhammad Saad Bakhtiar",
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function txt(text, opts = {}) {
  return new TextRun({ text, ...opts });
}
function p(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });
}
function labeledLine(label, value) {
  return p([txt(label + " ", { bold: true, size: 16, color: GRAY }), txt(value, { size: 16, color: GRAY })], {
    spacing: { after: 20 },
    alignment: AlignmentType.RIGHT,
  });
}
function slugName(name) {
  return name.trim().replace(/\s+/g, "-");
}

function buildHeader() {
  return new Header({
    children: [
      new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: [2000, CONTENT_WIDTH - 2000],
        borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2000, type: WidthType.DXA },
                borders: noBorders,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 60, bottom: 60, left: 0, right: 120 },
                children: [
                  p(new ImageRun({ data: logoBuffer, type: "png", transformation: { width: LOGO_WIDTH, height: LOGO_HEIGHT } }), { alignment: AlignmentType.LEFT }),
                ],
              }),
              new TableCell({
                width: { size: CONTENT_WIDTH - 2000, type: WidthType.DXA },
                borders: noBorders,
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 60, bottom: 60, left: 120, right: 0 },
                children: [p(txt("Xeda UG (haftungsbeschränkt)", { size: 16, color: GRAY, italics: true }), { alignment: AlignmentType.RIGHT })],
              }),
            ],
          }),
        ],
      }),
      p("", { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } }, spacing: { after: 60 } }),
    ],
  });
}

function buildFooter() {
  return new Footer({
    children: [
      p("", { border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } }, spacing: { before: 60, after: 60 } }),
      p(
        [
          txt("Xeda UG (haftungsbeschränkt) — Vertraulich / Confidential   ·   Seite ", { size: 15, color: GRAY }),
          new TextRun({ children: [PageNumber.CURRENT], size: 15, color: GRAY }),
          txt(" / ", { size: 15, color: GRAY }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: GRAY }),
        ],
        { alignment: AlignmentType.CENTER }
      ),
    ],
  });
}

function buildTitleBlock(titleEn, titleDe, subtitleEn, subtitleDe) {
  return [
    p([txt(titleEn + " / " + titleDe, { bold: true, size: 30, color: NAVY })], { alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
    p([txt(subtitleEn, { italics: true, size: 19 })], { alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
    p([txt(subtitleDe, { italics: true, size: 19 })], { alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
  ];
}

function buildDisclaimer(lines) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_WIDTH, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: "auto", fill: DISCLAIMER_SHADE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: "E8D27A" },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: "E8D27A" },
              left: { style: BorderStyle.SINGLE, size: 4, color: "E8D27A" },
              right: { style: BorderStyle.SINGLE, size: 4, color: "E8D27A" },
            },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              p(txt("TEMPLATE — NOT LEGAL ADVICE", { bold: true, size: 18 }), { spacing: { after: 60 } }),
              ...lines.map((l) => p(txt(l, { size: 17 }), { spacing: { after: 40 } })),
            ],
          }),
        ],
      }),
    ],
  });
}

function companyInfoBlock() {
  return [
    p("", { spacing: { after: 120 } }),
    labeledLine("Sitz der Gesellschaft:", `${XEDA.street}, ${XEDA.city}, ${XEDA.country}`),
    labeledLine("Handelsregister:", `${XEDA.court}, ${XEDA.hrb}`),
    labeledLine("Geschäftsführer:", XEDA.gf),
    labeledLine("Kontakt:", `${XEDA.phone} · ${XEDA.email}`),
  ];
}

function sectionHeading(text) {
  return p(txt(text, { bold: true, size: 22, color: NAVY }), { spacing: { before: 200, after: 120 } });
}

function clauseTable(clauses) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: COL_WIDTH, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [p(txt("English", { bold: true, color: "FFFFFF", size: 18 }))],
      }),
      new TableCell({
        width: { size: COL_WIDTH, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: NAVY },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [p(txt("Deutsch", { bold: true, color: "FFFFFF", size: 18 }))],
      }),
    ],
  });

  const rows = [headerRow];
  clauses.forEach((c, i) => {
    const fill = i % 2 === 1 ? ALT_SHADE : "FFFFFF";
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: COL_WIDTH, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: "auto", fill },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              p(txt(`${c.num}. ${c.titleEn}`, { bold: true, size: 18 }), { spacing: { after: 60 } }),
              ...c.bodyEn.map((t) => p(txt(t, { size: 18 }), { spacing: { after: 60 } })),
            ],
          }),
          new TableCell({
            width: { size: COL_WIDTH, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: "auto", fill },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [
              p(txt(`${c.num}. ${c.titleDe}`, { bold: true, size: 18 }), { spacing: { after: 60 } }),
              ...c.bodyDe.map((t) => p(txt(t, { size: 18 }), { spacing: { after: 60 } })),
            ],
          }),
        ],
      })
    );
  });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_WIDTH, COL_WIDTH],
    layout: TableLayoutType.FIXED,
    rows,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
  });
}

// leftSignature/rightSignature: { buffer, width, height } (PNG, transparent bg recommended)
// leftName/rightName: printed name shown beside the signature image, on the signature line
function twoPartySignatureBlock(leftLabel, rightLabel, opts = {}) {
  const { leftSignature, rightSignature, leftDate, rightDate, leftName, rightName } = opts;
  const cell = (label, sig, dateStr, signerName) => {
    const children = [];
    if (sig && signerName) {
      const ratio = sig.height / sig.width;
      const w = 150;
      const innerW = COL_WIDTH - 200;
      const nameW = Math.round(innerW * 0.5);
      const imgW = innerW - nameW;
      const noInnerBorder = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder };
      children.push(
        new Table({
          width: { size: innerW, type: WidthType.DXA },
          columnWidths: [nameW, imgW],
          layout: TableLayoutType.FIXED,
          borders: noInnerBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: nameW, type: WidthType.DXA },
                  borders: { top: noBorder, left: noBorder, right: noBorder, bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } },
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 40, left: 0, right: 80 },
                  children: [p(txt(signerName, { size: 19 }))],
                }),
                new TableCell({
                  width: { size: imgW, type: WidthType.DXA },
                  borders: { top: noBorder, left: noBorder, right: noBorder, bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } },
                  verticalAlign: VerticalAlign.BOTTOM,
                  margins: { top: 0, bottom: 20, left: 80, right: 0 },
                  children: [
                    p(new ImageRun({ data: sig.buffer, type: "png", transformation: { width: w, height: Math.round(w * ratio) } })),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      children.push(p("", { spacing: { before: 80, after: 80 } }));
    } else if (sig) {
      const ratio = sig.height / sig.width;
      const w = 150;
      children.push(
        p(new ImageRun({ data: sig.buffer, type: "png", transformation: { width: w, height: Math.round(w * ratio) } }), {
          spacing: { after: 20 },
        })
      );
      children.push(p("", { spacing: { after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } } }));
    } else {
      children.push(p("", { spacing: { after: 600 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } } }));
    }
    children.push(p(txt(label, { italics: true, size: 17 }), { spacing: { after: 100 } }));
    children.push(p(txt(`Place, Date / Ort, Datum: ${dateStr || "____________________"}`, { size: 17 })));
    return new TableCell({
      width: { size: COL_WIDTH, type: WidthType.DXA },
      margins: { top: 300, bottom: 200, left: 100, right: 100 },
      children,
    });
  };
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [COL_WIDTH, COL_WIDTH],
    layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: [cell(leftLabel, leftSignature, leftDate, leftName), cell(rightLabel, rightSignature, rightDate, rightName)] })],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "999999" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
    },
  });
}

const SECTION_BASE = {
  properties: {
    page: { margin: { top: 900, bottom: 900, left: 1440, right: 1440 } },
  },
};

module.exports = {
  NAVY, ALT_SHADE, DISCLAIMER_SHADE, GRAY, CONTENT_WIDTH, COL_WIDTH, XEDA, SECTION_BASE,
  txt, p, labeledLine, slugName,
  buildHeader, buildFooter, buildTitleBlock, buildDisclaimer, companyInfoBlock, sectionHeading,
  clauseTable, twoPartySignatureBlock,
};
