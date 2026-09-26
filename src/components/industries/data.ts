import type { LucideIcon } from "lucide-react";
import {
  Receipt, Factory, ShoppingCart, Building2, Stethoscope, HardHat,
} from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";

// Content for the "before → Xeda → after" industries section.
//
// Every industry is the same three-part story — messy inputs on the left, the
// fields Xeda pulls out of them, a structured result on the right — so the
// scene is one set of components fed by this data. What differs is what is
// in each part: the inputs, the environment behind them and the kind of
// interface the result lands in.
//
// Illustrative only: names, numbers and dates are invented examples, not
// client data.

export type Lx = { en: string; de: string };
const l = (en: string, de: string = en): Lx => ({ en, de });
export const tx = (v: Lx | string, lang: SiteLanguage) => (typeof v === "string" ? v : v[lang]);

export type Status = "ok" | "warn" | "draft" | "staff";

/** A piece of unstructured work waiting on the left. x/y place its top-left
 *  corner as a share of the input area; r is its tilt in degrees. */
export type InputItem = { x: number; y: number; r: number; unresolved?: boolean } & (
  | { kind: "doc"; tag: string; title: Lx | string; lines?: number; icon?: "invoice" | "rx" | "note" }
  | { kind: "field"; value: Lx | string; label?: Lx }
  | { kind: "mail"; from: string; subject: Lx | string }
  | { kind: "chat"; text: Lx; from?: Lx; channel?: "site" }
  | { kind: "call"; title: Lx; sub: Lx; missed?: boolean }
  | { kind: "photo"; caption: Lx }
  | { kind: "note"; text: Lx }
  | { kind: "listing"; price: Lx; place: Lx }
  | { kind: "order"; title: Lx; sub: Lx }
);

/** A compact input for the phone scene: one line of what arrived, plus loose
 *  fragments for the "scattered data" inputs. */
export type MobileInput = {
  kind: "pdf" | "mail" | "chat" | "call" | "rx" | "photo" | "listing" | "site" | "bits";
  title: Lx | string;
  meta?: Lx | string;
  /** Loose values shown as chips instead of a meta line. */
  bits?: (Lx | string)[];
  unresolved?: boolean;
};

/** A field Xeda reads out while it works; `flag` marks the one it questions. */
export type Field = { label: Lx; flag?: boolean };

export type TableOutput = {
  kind: "table";
  app: string;
  title: Lx;
  cols: Lx[];
  /** Grid template for the columns, so each interface keeps its own shape. */
  grid: string;
  /** `sub` is the one-line summary the phone layout uses instead of cells. */
  /** `traced` marks the row built from the very fragments shown on the
   *  left, so it is highlighted as it lands. */
  rows: { cells: (Lx | string)[]; sub: Lx; status: Status; note?: Lx; traced?: boolean }[];
  footer: { text: Lx; icon: "file" | "send" };
};
export type ListOutput = {
  kind: "list";
  app: Lx | string;
  title: Lx;
  rows: { req: Lx; res: Lx; status: Status }[];
  /** E-commerce: a live parcel-tracking strip and the store update. */
  tracking?: { steps: Lx[]; store: Lx };
  /** Medical: a daily tally in the header. */
  tally?: Lx;
};
export type LeadOutput = {
  kind: "lead";
  name: string;
  initials: string;
  facts: { label: Lx; value: Lx }[];
  days: Lx[];
  slot: { day: number; time: string };
  booked: Lx;
  followUp: Lx;
};
export type ReportOutput = {
  kind: "report";
  title: Lx;
  site: Lx;
  progress: { label: Lx; pct: number };
  rows: { text: Lx; status: Status }[];
};
export type Output = TableOutput | ListOutput | LeadOutput | ReportOutput;

export type Industry = {
  key: "accounting" | "manufacturing" | "ecommerce" | "realestate" | "medical" | "construction";
  slug: string;
  icon: LucideIcon;
  inputs: InputItem[];
  /** The two or three most telling inputs, for the phone scene. */
  mobileInputs: MobileInput[];
  /** The tidy list the inputs collapse into once read. */
  sources: Lx[];
  fields: Field[];
  output: Output;
  /** What Xeda did, in four short chips shown with the result. */
  chips: Lx[];
  /** Read out to screen readers when the run completes. */
  summary: Lx;
};

export const industries: Industry[] = [
  {
    key: "accounting",
    slug: "steuerkanzleien",
    icon: Receipt,
    inputs: [
      { kind: "doc", tag: "PDF", title: l("Invoice", "Rechnung"), icon: "invoice", x: 4, y: 7, r: -6 },
      { kind: "doc", tag: "PDF", title: l("Invoice (scan)", "Rechnung (Scan)"), icon: "invoice", x: 33, y: 30, r: 5, unresolved: true },
      { kind: "field", value: "Acme GmbH", x: 58, y: 9, r: 4 },
      { kind: "field", value: l("€1,190.00", "1.190,00 €"), x: 63, y: 50, r: -4 },
      { kind: "field", value: "24.04.2025", x: 3, y: 60, r: 3 },
      { kind: "field", value: l("VAT 19%", "USt. 19 %"), x: 42, y: 72, r: -3 },
      { kind: "field", value: "RE-1201", x: 12, y: 84, r: 4 },
    ],
    mobileInputs: [
      { kind: "pdf", title: l("Invoice · Acme GmbH", "Rechnung · Acme GmbH"), meta: "PDF · 24.04.2025" },
      { kind: "pdf", title: l("Invoice (scan)", "Rechnung (Scan)"), meta: l("PDF · VAT unreadable", "PDF · USt. unleserlich"), unresolved: true },
      { kind: "bits", title: l("Copied from emails", "Aus E-Mails kopiert"), bits: [l("€1,190.00", "1.190,00 €"), l("VAT 19%", "USt. 19 %"), "RE-1201"] },
    ],
    sources: [l("Invoice_Acme.pdf"), l("Scan_0424.pdf"), l("4 more invoices", "4 weitere Rechnungen")],
    fields: [
      { label: l("Vendor", "Lieferant") },
      { label: l("Invoice date", "Rechnungsdatum") },
      { label: l("Amount", "Betrag") },
      { label: l("VAT", "USt."), flag: true },
      { label: l("Invoice no.", "Rechnungsnr.") },
    ],
    output: {
      kind: "table",
      app: "DATEV",
      title: l("Import · posting batch", "Import · Buchungsstapel"),
      cols: [l("Vendor", "Lieferant"), l("Invoice", "Beleg"), l("Date", "Datum"), l("Amount", "Betrag"), l("VAT", "USt."), l("", "")],
      grid: "minmax(0,1.3fr) minmax(0,0.95fr) minmax(0,0.95fr) minmax(0,1.05fr) minmax(0,0.5fr) 1.5rem",
      rows: [
        { cells: ["Acme GmbH", "RE-1201", "24.04.2025", l("€1,190.00", "1.190,00 €"), "19%"], sub: l("24.04.2025 · €1,190.00 · VAT 19% · RE-1201", "24.04.2025 · 1.190,00 € · USt. 19 % · RE-1201"), status: "ok", traced: true },
        { cells: ["Microsoft", "RE-0423", "23.04.2025", l("€299.00", "299,00 €"), "19%"], sub: l("€299.00 · VAT 19% · RE-0423", "299,00 € · USt. 19 % · RE-0423"), status: "ok" },
        { cells: ["Telekom", "RE-7781", "22.04.2025", l("€84.99", "84,99 €"), "7%"], sub: l("€84.99 · VAT 7% · RE-7781", "84,99 € · USt. 7 % · RE-7781"), status: "warn", note: l("VAT rate doesn't match", "USt.-Satz passt nicht") },
        { cells: ["Office Depot", "RE-5567", "22.04.2025", l("€125.50", "125,50 €"), "19%"], sub: l("€125.50 · VAT 19% · RE-5567", "125,50 € · USt. 19 % · RE-5567"), status: "ok" },
      ],
      footer: { text: l("DATEV import file ready", "DATEV-Importdatei bereit"), icon: "file" },
    },
    chips: [l("Vendor extracted", "Lieferant erfasst"), l("VAT checked", "USt. geprüft"), l("Invoices validated", "Rechnungen geprüft"), l("DATEV import prepared", "DATEV-Import vorbereitet")],
    summary: l(
      "Xeda read the invoices into a DATEV import: three validated, one VAT exception flagged for review.",
      "Xeda hat die Rechnungen in einen DATEV-Import übertragen: drei geprüft, eine USt.-Abweichung zur Prüfung markiert.",
    ),
  },
  {
    key: "manufacturing",
    slug: "fertigung",
    icon: Factory,
    inputs: [
      { kind: "mail", from: "einkauf@kunde-ag.de", subject: l("PO 4500-1123 — urgent", "Bestellung 4500-1123 — eilig"), x: 3, y: 6, r: -4 },
      { kind: "doc", tag: "PDF", title: l("Purchase order", "Bestellung"), x: 38, y: 24, r: 5 },
      { kind: "field", value: l("Mat. 200-051", "Mat. 200-051"), x: 64, y: 6, r: 4 },
      { kind: "field", value: l("Qty 250", "Menge 250"), x: 5, y: 44, r: -3 },
      { kind: "field", value: l("€199.00 / pc", "199,00 € / Stk."), x: 60, y: 57, r: 3, unresolved: true },
      { kind: "field", value: l("Deliver by 02.05.", "Liefern bis 02.05."), x: 14, y: 67, r: 2 },
    ],
    mobileInputs: [
      { kind: "mail", title: l("PO 4500-1123 — urgent", "Bestellung 4500-1123 — eilig"), meta: "einkauf@kunde-ag.de" },
      { kind: "pdf", title: l("Purchase order", "Bestellung"), meta: l("PDF · 4 line items", "PDF · 4 Positionen") },
      { kind: "bits", title: l("Waiting for manual entry", "Wartet auf Erfassung"), bits: [l("Qty 250", "Menge 250"), l("€199.00 / pc", "199,00 € / Stk."), l("by 02.05.", "bis 02.05.")], unresolved: true },
    ],
    sources: [l("Email from Kunde AG", "E-Mail von Kunde AG"), l("PO_4500-1123.pdf"), l("4 line items", "4 Positionen")],
    fields: [
      { label: l("Material", "Material") },
      { label: l("Quantity", "Menge") },
      { label: l("Price", "Preis"), flag: true },
      { label: l("Delivery date", "Liefertermin") },
      { label: l("PO number", "Bestellnr.") },
    ],
    output: {
      kind: "table",
      app: "SAP",
      title: l("Sales order 4500-1123 · draft", "Kundenauftrag 4500-1123 · Entwurf"),
      cols: [l("Material", "Material"), l("Qty", "Menge"), l("Price", "Preis"), l("Delivery", "Termin"), l("", "")],
      grid: "minmax(0,1.5fr) minmax(0,0.7fr) minmax(0,0.95fr) minmax(0,0.8fr) 1.5rem",
      rows: [
        { cells: [l("100-240 Housing", "100-240 Gehäuse"), "250", l("€12.50", "12,50 €"), "28.04."], sub: l("250 pcs · €12.50 · due 28.04.", "250 Stk. · 12,50 € · bis 28.04."), status: "ok" },
        { cells: [l("100-318 Shaft", "100-318 Welle"), "100", l("€8.90", "8,90 €"), "30.04."], sub: l("100 pcs · €8.90 · due 30.04.", "100 Stk. · 8,90 € · bis 30.04."), status: "ok" },
        { cells: [l("200-051 Flange", "200-051 Flansch"), "50", l("€199.00", "199,00 €"), "02.05."], sub: l("50 pcs · €199.00 · due 02.05.", "50 Stk. · 199,00 € · bis 02.05."), status: "warn", traced: true, note: l("Price 16× the usual rate", "Preis 16× über dem Üblichen") },
        { cells: [l("300-112 Bolt set", "300-112 Schraubensatz"), "1,000", l("€3.40", "3,40 €"), "28.04."], sub: l("1,000 pcs · €3.40 · due 28.04.", "1.000 Stk. · 3,40 € · bis 28.04."), status: "ok" },
      ],
      footer: { text: l("Order confirmation drafted and sent", "Auftragsbestätigung erstellt und versendet"), icon: "send" },
    },
    chips: [l("PO extracted", "Bestellung erfasst"), l("Pricing checked", "Preise geprüft"), l("ERP order drafted", "ERP-Auftrag erstellt"), l("Confirmation prepared", "Bestätigung vorbereitet")],
    summary: l(
      "Xeda turned the email and PO into an SAP order draft: three lines confirmed, one unusual price flagged, confirmation sent.",
      "Xeda hat E-Mail und Bestellung in einen SAP-Auftragsentwurf übertragen: drei Positionen bestätigt, ein ungewöhnlicher Preis markiert, Bestätigung versendet.",
    ),
  },
  {
    key: "ecommerce",
    slug: "e-commerce",
    icon: ShoppingCart,
    inputs: [
      { kind: "chat", text: l("Where's my order?", "Wo ist meine Bestellung?"), from: l("Lena · 2 min", "Lena · vor 2 Min."), x: 3, y: 5, r: -3 },
      { kind: "chat", text: l("Track my order", "Sendung verfolgen"), from: l("Tom · 3 min", "Tom · vor 3 Min."), x: 47, y: 16, r: 3 },
      { kind: "chat", text: l("What size should I get?", "Welche Größe soll ich nehmen?"), from: l("Aylin · 5 min", "Aylin · vor 5 Min."), x: 9, y: 36, r: 2 },
      { kind: "chat", text: l("I want to return this.", "Ich möchte das zurückschicken."), from: l("Max · 6 min", "Max · vor 6 Min."), x: 45, y: 50, r: -4 },
      { kind: "order", title: l("Order #1042", "Bestellung #1042"), sub: l("Runner Pro · size 42", "Runner Pro · Gr. 42"), x: 6, y: 70, r: 3 },
      { kind: "field", value: l("4 unanswered", "4 unbeantwortet"), x: 60, y: 82, r: -2, unresolved: true },
    ],
    mobileInputs: [
      { kind: "chat", title: l("Where's my order?", "Wo ist meine Bestellung?"), meta: l("Lena · 2 min ago", "Lena · vor 2 Min.") },
      { kind: "chat", title: l("What size should I get?", "Welche Größe soll ich nehmen?"), meta: l("Aylin · 5 min ago", "Aylin · vor 5 Min.") },
      { kind: "chat", title: l("I want to return this.", "Ich möchte das zurückschicken."), meta: l("Max · and 1 more waiting", "Max · und 1 weitere wartet"), unresolved: true },
    ],
    sources: [l("4 customer requests", "4 Kundenanfragen"), l("Order #1042", "Bestellung #1042"), l("Carrier tracking", "Sendungsdaten")],
    fields: [
      { label: l("Intent", "Anliegen") },
      { label: l("Order no.", "Bestellnr.") },
      { label: l("Tracking", "Sendung") },
      { label: l("Size advice", "Größenberatung"), flag: true },
      { label: l("Return", "Retoure") },
    ],
    output: {
      kind: "list",
      app: "Helpdesk",
      title: l("Support inbox · today", "Support-Postfach · heute"),
      rows: [
        { req: l("Where's my order?", "Wo ist meine Bestellung?"), res: l("Tracking retrieved · out for delivery", "Sendung abgerufen · in Zustellung"), status: "ok" },
        { req: l("Track my order", "Sendung verfolgen"), res: l("Reply sent with tracking link", "Antwort mit Tracking-Link gesendet"), status: "ok" },
        { req: l("What size should I get?", "Welche Größe soll ich nehmen?"), res: l("Reply drafted · awaiting review", "Antwort entworfen · wartet auf Freigabe"), status: "draft" },
        { req: l("I want to return this.", "Ich möchte das zurückschicken."), res: l("Return label prepared", "Retourenschein erstellt"), status: "ok" },
      ],
      tracking: {
        steps: [l("Ordered", "Bestellt"), l("Shipped", "Versandt"), l("Out for delivery", "In Zustellung")],
        store: l("Shopify · order #1042 updated", "Shopify · Bestellung #1042 aktualisiert"),
      },
    },
    chips: [l("Intent identified", "Anliegen erkannt"), l("Order found", "Bestellung gefunden"), l("Responses prepared", "Antworten vorbereitet"), l("Store updated", "Shop aktualisiert")],
    summary: l(
      "Xeda resolved three support requests, drafted one reply for review and updated the store order.",
      "Xeda hat drei Anfragen gelöst, eine Antwort zur Freigabe entworfen und die Bestellung im Shop aktualisiert.",
    ),
  },
  {
    key: "realestate",
    slug: "immobilien",
    icon: Building2,
    inputs: [
      { kind: "chat", text: l("Is this property still available?", "Ist die Wohnung noch verfügbar?"), from: l("Website visitor", "Website-Besucher"), x: 3, y: 5, r: -3 },
      { kind: "chat", text: l("What is the price?", "Was kostet sie?"), from: l("Website visitor", "Website-Besucher"), x: 52, y: 20, r: 3 },
      { kind: "chat", text: l("Can I book a viewing?", "Kann ich eine Besichtigung buchen?"), from: l("Website visitor", "Website-Besucher"), x: 6, y: 38, r: 2 },
      { kind: "listing", price: l("€525,000", "525.000 €"), place: l("3 rooms · Schwabing", "3 Zimmer · Schwabing"), x: 47, y: 47, r: 3 },
      { kind: "field", value: l("Lead #218 · unqualified", "Lead #218 · unqualifiziert"), x: 4, y: 80, r: -2, unresolved: true },
    ],
    mobileInputs: [
      { kind: "chat", title: l("Is this property still available?", "Ist die Wohnung noch verfügbar?"), meta: l("Website visitor", "Website-Besucher") },
      { kind: "chat", title: l("Can I book a viewing?", "Kann ich eine Besichtigung buchen?"), meta: l("Website visitor · unqualified", "Website-Besucher · unqualifiziert"), unresolved: true },
      { kind: "listing", title: l("€525,000 · 3 rooms", "525.000 € · 3 Zimmer"), meta: l("Schwabing · listing 4471", "Schwabing · Exposé 4471") },
    ],
    sources: [l("3 visitor chats", "3 Besucher-Chats"), l("Listing ID 4471", "Exposé-Nr. 4471"), l("Agent calendar", "Kalender des Maklers")],
    fields: [
      { label: l("Budget", "Budget") },
      { label: l("Location", "Lage") },
      { label: l("Property", "Objekt") },
      { label: l("Intent", "Absicht") },
      { label: l("Availability", "Verfügbarkeit") },
    ],
    output: {
      kind: "lead",
      name: "Julia M.",
      initials: "JM",
      facts: [
        { label: l("Budget", "Budget"), value: l("€450–550k", "450–550 Tsd. €") },
        { label: l("Area", "Lage"), value: l("Munich · Schwabing", "München · Schwabing") },
        { label: l("Looking for", "Sucht"), value: l("3 rooms, balcony", "3 Zimmer, Balkon") },
        { label: l("Intent", "Absicht"), value: l("Buying within 3 months", "Kauf in 3 Monaten") },
      ],
      days: [l("Mon", "Mo"), l("Tue", "Di"), l("Wed", "Mi"), l("Thu", "Do"), l("Fri", "Fr")],
      slot: { day: 3, time: "15:00" },
      booked: l("Viewing booked · Thu 15:00", "Besichtigung gebucht · Do 15:00"),
      followUp: l("Follow-up email scheduled", "Nachfass-E-Mail geplant"),
    },
    chips: [l("Lead qualified", "Lead qualifiziert"), l("Budget identified", "Budget erkannt"), l("Property matched", "Objekt zugeordnet"), l("Viewing booked", "Besichtigung gebucht")],
    summary: l(
      "Xeda qualified the visitor as a buyer and booked a viewing for Thursday at 15:00.",
      "Xeda hat den Besucher als Käuferin qualifiziert und eine Besichtigung für Donnerstag, 15:00 gebucht.",
    ),
  },
  {
    key: "medical",
    slug: "arztpraxis",
    icon: Stethoscope,
    inputs: [
      { kind: "call", title: l("Incoming call", "Eingehender Anruf"), sub: l("Patient · appointment", "Patient · Termin"), x: 3, y: 5, r: -3 },
      { kind: "doc", tag: "Rx", title: l("Repeat prescription", "Folgerezept"), icon: "rx", x: 50, y: 13, r: 4 },
      { kind: "chat", text: l("Are you open on Saturday?", "Haben Sie samstags geöffnet?"), from: l("Online form", "Online-Formular"), x: 7, y: 35, r: 2 },
      { kind: "note", text: l("Appointment request · next week", "Terminwunsch · nächste Woche"), x: 50, y: 49, r: -4 },
      { kind: "chat", text: l("Question about my lab results", "Frage zu meinen Laborwerten"), from: l("Voicemail", "Mailbox"), x: 4, y: 64, r: 3 },
      { kind: "call", title: l("3 missed calls", "3 verpasste Anrufe"), sub: l("Reception busy", "Empfang besetzt"), missed: true, x: 50, y: 80, r: -2, unresolved: true },
    ],
    mobileInputs: [
      { kind: "call", title: l("Patient call", "Patientenanruf"), meta: l("Wants an appointment", "Möchte einen Termin") },
      { kind: "rx", title: l("Repeat prescription request", "Folgerezept-Anfrage"), meta: l("Online form", "Online-Formular") },
      { kind: "chat", title: l("Question about my lab results", "Frage zu meinen Laborwerten"), meta: l("Voicemail · 3 more waiting", "Mailbox · 3 weitere warten"), unresolved: true },
    ],
    sources: [l("Phone line", "Telefonleitung"), l("Online form & voicemail", "Online-Formular & Mailbox"), l("Practice calendar", "Praxiskalender")],
    fields: [
      { label: l("Request type", "Anliegen") },
      { label: l("Appointment", "Termin") },
      { label: l("Question", "Frage") },
      { label: l("Prescription", "Rezept") },
      { label: l("Needs staff", "Braucht Team"), flag: true },
    ],
    output: {
      kind: "list",
      app: l("Reception", "Empfang"),
      title: l("Practice inbox · this morning", "Praxis-Postfach · heute Vormittag"),
      tally: l("12 calls handled", "12 Anrufe bearbeitet"),
      rows: [
        { req: l("Appointment request", "Terminwunsch"), res: l("Booked · Tue 09:30", "Gebucht · Di 09:30"), status: "ok" },
        { req: l("Are you open on Saturday?", "Haben Sie samstags geöffnet?"), res: l("Answered with opening hours", "Mit Öffnungszeiten beantwortet"), status: "ok" },
        { req: l("Repeat prescription", "Folgerezept"), res: l("Prepared for the doctor to sign", "Zur Unterschrift vorbereitet"), status: "ok" },
        { req: l("Question about lab results", "Frage zu Laborwerten"), res: l("Escalated to practice staff", "An das Praxisteam weitergeleitet"), status: "staff" },
      ],
    },
    chips: [l("Requests classified", "Anliegen zugeordnet"), l("Appointment booked", "Termin gebucht"), l("Question answered", "Frage beantwortet"), l("Complex case escalated", "Komplexer Fall weitergeleitet")],
    summary: l(
      "Xeda booked an appointment, answered a question and prepared a prescription request; the question about results went to practice staff.",
      "Xeda hat einen Termin gebucht, eine Frage beantwortet und ein Rezept vorbereitet; die Frage zu Befunden ging an das Praxisteam.",
    ),
  },
  {
    key: "construction",
    slug: "handwerk",
    icon: HardHat,
    inputs: [
      { kind: "chat", channel: "site", text: l("Concrete arrives 2 pm, crane idle till then", "Beton kommt 14 Uhr, Kran steht bis dahin"), from: l("Site chat · foreman", "Baustellen-Chat · Polier"), x: 3, y: 5, r: -3 },
      { kind: "photo", caption: l("IMG_2291.jpg", "IMG_2291.jpg"), x: 55, y: 11, r: 4 },
      { kind: "doc", tag: "PDF", title: l("Delivery note", "Lieferschein"), x: 7, y: 38, r: -3 },
      { kind: "doc", tag: "PDF", title: l("Invoice €8,420", "Rechnung 8.420 €"), icon: "invoice", x: 50, y: 50, r: 3 },
      { kind: "note", text: l("Call electrician re level 2", "Elektriker wg. 2. OG anrufen"), x: 5, y: 70, r: -4 },
      { kind: "field", value: l("Plan rev. C?", "Plan Rev. C?"), x: 58, y: 84, r: 2, unresolved: true },
    ],
    mobileInputs: [
      { kind: "site", title: l("Concrete arrives 2 pm, crane idle", "Beton kommt 14 Uhr, Kran steht"), meta: l("Site chat · foreman", "Baustellen-Chat · Polier") },
      { kind: "photo", title: "IMG_2291.jpg", meta: l("Site photo · level 2", "Baustellenfoto · 2. OG") },
      { kind: "pdf", title: l("Invoice €8,420", "Rechnung 8.420 €"), meta: l("PDF · not yet filed", "PDF · nicht abgelegt"), unresolved: true },
    ],
    sources: [l("Site chat · 14 messages", "Baustellen-Chat · 14 Nachrichten"), l("6 photos", "6 Fotos"), l("3 PDFs", "3 PDFs")],
    fields: [
      { label: l("Messages", "Nachrichten") },
      { label: l("Photos", "Fotos") },
      { label: l("Documents", "Dokumente") },
      { label: l("Invoice", "Rechnung") },
      { label: l("Plan revision", "Planstand"), flag: true },
    ],
    output: {
      kind: "report",
      title: l("Daily report · 24.04.", "Tagesbericht · 24.04."),
      site: l("Site Königstraße 12", "Baustelle Königstraße 12"),
      progress: { label: l("Shell · level 2", "Rohbau · 2. OG"), pct: 68 },
      rows: [
        { text: l("Concrete delivery moved to 14:00", "Betonlieferung auf 14:00 verschoben"), status: "ok" },
        { text: l("Invoice €8,420 extracted → accounts", "Rechnung 8.420 € erfasst → Buchhaltung"), status: "ok" },
        { text: l("Delivery note filed to project", "Lieferschein im Projekt abgelegt"), status: "ok" },
        { text: l("Plan rev. C linked · confirm with architect", "Plan Rev. C verknüpft · mit Architekt klären"), status: "warn" },
      ],
    },
    chips: [l("Site update organised", "Baustellen-Update geordnet"), l("Invoice extracted", "Rechnung erfasst"), l("Documents linked", "Dokumente verknüpft"), l("Report generated", "Bericht erstellt")],
    summary: l(
      "Xeda turned messages, photos and PDFs into today's site report: invoice extracted, documents filed, one plan revision to confirm.",
      "Xeda hat Nachrichten, Fotos und PDFs zum Tagesbericht verarbeitet: Rechnung erfasst, Dokumente abgelegt, ein Planstand zu klären.",
    ),
  },
];
