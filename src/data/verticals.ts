import {
  Receipt,
  Factory,
  ShoppingCart,
  Building2,
  Stethoscope,
  HardHat,
  type LucideIcon,
} from "lucide-react";

// Content for the standalone, German-only outbound-campaign landing pages.
// One template (src/pages/VerticalLanding.tsx) renders every entry, so a new
// vertical is a data change here — not another near-duplicate page. The shared
// process steps (Audit/Build/Betrieb) and trust row live in the template,
// because they are identical across every vertical.
export interface Vertical {
  /** URL slug → /{slug}. German for SEO + clean outbound links. */
  slug: string;
  /** Lucide icon shown in the hero eyebrow. */
  icon: LucideIcon;
  /** Small label above the hero headline, e.g. "Für Steuerkanzleien". */
  eyebrow: string;
  /** The pain hook — the single most important line on the page. */
  heroHeadline: string;
  heroSub: string;
  /** "Kennen Sie das?" — the recognisable pains. */
  problems: string[];
  /** "Was wir bauen" — the concrete build. */
  buildPoints: string[];
  /** Per-page <title> and meta/OG description (see SEOHead). */
  seoTitle: string;
  seoDescription: string;
  /** Per-page OG/share image under /public. */
  ogImage: string;
}

export const verticals: Vertical[] = [
  {
    slug: "steuerkanzleien",
    icon: Receipt,
    eyebrow: "Für Steuerkanzleien",
    heroHeadline:
      "20 Stunden pro Woche in der Belegerfassung? Die bekommen Sie zurück.",
    heroSub:
      "Wir bauen KI-Systeme, die Belege lesen, Daten prüfen und DATEV-Importe vorbereiten — damit Ihr Team sich auf die Mandanten konzentriert, nicht auf das Abtippen.",
    problems: [
      "Belege und Rechnungen werden von Hand für DATEV erfasst.",
      "Mitarbeiter tippen dieselben Daten aus PDFs ab.",
      "Fehlende oder fehlerhafte Belege fallen erst spät auf.",
      "Standard-E-Mails an Mandanten werden manuell geschrieben.",
    ],
    buildPoints: [
      "Liest PDFs, Belege und Rechnungen automatisch aus",
      "Extrahiert und prüft die Daten, markiert Ausnahmen",
      "Bereitet DATEV-Importe vor",
      "Beantwortet Fragen wie „Zeig mir alle offenen Rechnungen älter als 45 Tage“",
      "Entwirft Standard-E-Mails an Mandanten",
    ],
    seoTitle:
      "KI für Steuerkanzleien — 20 Stunden pro Woche zurückgewinnen | xeda.ai",
    seoDescription:
      "Belegerfassung, DATEV-Import und Mandanten-E-Mails automatisieren. Sparen Sie 15–20 Stunden pro Woche. Starten Sie mit einem kostenlosen KI-Audit.",
    ogImage: "/og/steuerkanzleien.png",
  },
  {
    slug: "fertigung",
    icon: Factory,
    eyebrow: "Für Fertigung & Industrie",
    heroHeadline:
      "Bestellungen abtippen kostet Sie jeden Tag Stunden. Muss nicht sein.",
    heroSub:
      "Wir bauen KI, die E-Mails und PDFs liest, Bestellungen im ERP vorbereitet und Abweichungen markiert — damit Ihr Team disponiert, statt zu tippen.",
    problems: [
      "Bestellungen kommen per E-Mail und PDF und werden von Hand ins ERP getippt.",
      "Ungewöhnliche Preise oder Mengen fallen erst spät auf.",
      "Auftragsbestätigungen werden manuell geschrieben.",
      "Stammdaten werden mehrfach über Systeme hinweg gepflegt.",
    ],
    buildPoints: [
      "Liest Bestellungen aus E-Mails und PDFs automatisch aus",
      "Erstellt Auftragsentwürfe direkt in SAP/ERP",
      "Markiert ungewöhnliche Preise, Mengen und Abweichungen",
      "Schreibt Auftragsbestätigungen im Entwurf",
      "Beantwortet Fragen wie „Welche Aufträge warten seit über 5 Tagen?“",
    ],
    seoTitle:
      "KI für Fertigung & Industrie — Auftragsabwicklung automatisieren | xeda.ai",
    seoDescription:
      "KI liest Bestellungen aus E-Mail und PDF, bereitet ERP-Aufträge vor und markiert Abweichungen. Weniger Erfassungsfehler. Kostenloses KI-Audit.",
    ogImage: "/og/fertigung.png",
  },
  {
    slug: "e-commerce",
    icon: ShoppingCart,
    eyebrow: "Für E-Commerce & Onlinehandel",
    heroHeadline:
      "Ihr Support ertrinkt in Standardanfragen. KI kann die meisten übernehmen.",
    heroSub:
      "Wir bauen KI, die wiederkehrende Tickets löst, komplexe Antworten entwirft und Shopify aktualisiert — für schnellere Antworten bei niedrigeren Kosten.",
    problems: [
      "Der Support ist voll mit wiederkehrenden Tickets — Retouren, Sendungsverfolgung, Größen.",
      "Antwortzeiten steigen in Stoßzeiten stark an.",
      "Bestell- und Kundendaten liegen über mehrere Tools verteilt.",
      "Standardantworten werden immer wieder neu getippt.",
    ],
    buildPoints: [
      "Löst häufige Tickets automatisch (Retouren, Tracking, Größen)",
      "Entwirft Antworten für komplexe Fälle zur Freigabe",
      "Aktualisiert Bestellungen direkt in Shopify",
      "Erkennt wiederkehrende Probleme und fasst sie zusammen",
      "Antwortet rund um die Uhr, in Ihrer Markensprache",
    ],
    seoTitle: "KI für E-Commerce — Kundensupport automatisieren | xeda.ai",
    seoDescription:
      "KI löst wiederkehrende Tickets, entwirft Antworten und aktualisiert Shopify. Schnellere Antworten, niedrigere Kosten. Kostenloses KI-Audit.",
    ogImage: "/og/e-commerce.png",
  },
  {
    slug: "immobilien",
    icon: Building2,
    eyebrow: "Für Immobilien & Makler",
    heroHeadline:
      "Jede Anfrage von Hand beantworten? Ihre besten Leads warten nicht.",
    heroSub:
      "Wir bauen KI, die mit Interessenten chattet, Käufer qualifiziert, Besichtigungen bucht und automatisch nachfasst — damit kein Lead liegen bleibt.",
    problems: [
      "Makler beantworten immer wieder dieselben Fragen.",
      "Leads werden manuell nachverfolgt — und gehen verloren.",
      "Besichtigungstermine werden per Telefon und E-Mail koordiniert.",
      "Die Qualifizierung passiert erst spät im Prozess.",
    ],
    buildPoints: [
      "Chattet mit Website-Besuchern und qualifiziert Käufer",
      "Bucht Besichtigungen automatisch in Ihren Kalender",
      "Fasst Leads eigenständig nach",
      "Beantwortet Objekt- und Finanzierungsfragen rund um die Uhr",
      "Übergibt heiße Leads sofort an den zuständigen Makler",
    ],
    seoTitle:
      "KI für Immobilien & Makler — Leads qualifizieren & Besichtigungen buchen | xeda.ai",
    seoDescription:
      "KI chattet mit Interessenten, qualifiziert Käufer und bucht Besichtigungen automatisch. Mehr qualifizierte Leads ohne zusätzliche Einstellung. Kostenloses KI-Audit.",
    ogImage: "/og/immobilien.png",
  },
  {
    slug: "arztpraxis",
    icon: Stethoscope,
    eyebrow: "Für Arztpraxen & Gesundheitswesen",
    heroHeadline:
      "Ihr Empfang hängt am Telefon. Die Zeit gehört Ihren Patienten.",
    heroSub:
      "Wir bauen einen KI-Assistenten, der Standardfragen beantwortet, Termine bucht und komplexe Fälle an Ihr Team weitergibt — DSGVO-konform.",
    problems: [
      "Der Empfang verbringt Stunden mit Termin- und Rezeptanrufen.",
      "In Stoßzeiten bleibt das Telefon unbeantwortet.",
      "Immer dieselben Fragen binden Personal.",
      "Terminausfälle, weil Erinnerungen manuell laufen.",
    ],
    buildPoints: [
      "Beantwortet häufige Patientenfragen automatisch",
      "Bucht und verschiebt Termine rund um die Uhr",
      "Eskaliert komplexe oder dringende Fälle ans Team",
      "Versendet automatische Terminerinnerungen",
      "DSGVO-konform, mit Hosting in der EU oder On-Premise",
    ],
    seoTitle:
      "KI für Arztpraxen — Empfang & Terminbuchung entlasten | xeda.ai",
    seoDescription:
      "Ein DSGVO-konformer KI-Assistent beantwortet Patientenfragen und bucht Termine. Ihr Team konzentriert sich auf die Versorgung. Kostenloses KI-Audit.",
    ogImage: "/og/arztpraxis.png",
  },
  {
    slug: "handwerk",
    icon: HardHat,
    eyebrow: "Für Handwerk & Bau",
    heroHeadline:
      "Baustellen-Updates in WhatsApp, PDFs und Fotos? KI bringt Ordnung rein.",
    heroSub:
      "Wir bauen KI, die Projektunterlagen organisiert, Tagesberichte erstellt, Rechnungen ausliest und Fragen zu jedem Projekt beantwortet.",
    problems: [
      "Baustellen-Updates kommen als WhatsApp-Nachrichten, PDFs und Fotos.",
      "Tagesberichte und Dokumentation werden von Hand erstellt.",
      "Rechnungen und Belege werden mühsam manuell erfasst.",
      "Projektinfos sind über viele Kanäle verstreut.",
    ],
    buildPoints: [
      "Organisiert Projektunterlagen automatisch",
      "Erstellt Tagesberichte aus Nachrichten und Fotos",
      "Liest Rechnungen und Belege aus",
      "Beantwortet Fragen zu jedem Projekt sofort",
      "Zieht Updates aus WhatsApp, E-Mail und PDF zusammen",
    ],
    seoTitle:
      "KI für Handwerk & Bau — Projektdoku & Rechnungen automatisieren | xeda.ai",
    seoDescription:
      "KI organisiert Projektunterlagen, erstellt Tagesberichte und liest Rechnungen aus. Weniger Büroarbeit auf der Baustelle. Kostenloses KI-Audit.",
    ogImage: "/og/handwerk.png",
  },
];

export const getVertical = (slug: string): Vertical | undefined =>
  verticals.find((v) => v.slug === slug);
