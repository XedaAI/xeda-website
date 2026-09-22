import { Search, BarChart3, Code, Zap, type LucideIcon } from "lucide-react";

// The delivery method, client-facing. Adapted from the internal delivery SOP:
// the phases, deliverables and gates are the same, but written for the person
// buying the work rather than the team running it — internal mechanics (role
// assignment, where files get filed, coaching asides) are deliberately left out.
//
// The seven phases sit under the four letters of XEDA, so this page is the
// detail beneath the homepage's four-step summary (HowWeWorkSection) rather
// than a competing story.

export type ProcessLang = "de" | "en";

export interface Phase {
  n: number;
  /** XEDA letter this phase belongs to. */
  letter: "X" | "E" | "D" | "A";
  /** Does this phase need the client's time? */
  withClient: boolean;
  title: string;
  objective: string;
  steps: string[];
  /** What the client ends up holding. */
  deliverable: string;
  /** The gate — work does not move on until this is true. */
  gate: string;
}

export interface Stage {
  letter: "X" | "E" | "D" | "A";
  icon: LucideIcon;
  title: string;
}

interface ProcessContent {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  stages: Stage[];
  withClientLabel: string;
  internalLabel: string;
  objectiveLabel: string;
  deliverableLabel: string;
  gateLabel: string;
  phases: Phase[];
  rulesTitle: string;
  rulesIntro: string;
  rules: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
}

const STAGE_ICONS = { X: Search, E: BarChart3, D: Code, A: Zap } as const;

export const PROCESS: Record<ProcessLang, ProcessContent> = {
  de: {
    seoTitle: "Unser Vorgehen — von der Anforderung zum Ergebnis | xeda.ai",
    seoDescription:
      "Sieben Phasen, feste Freigaben und klare Regeln: keine Entwicklung ohne unterschriebenen Umfang, kein voller Stack ohne bewiesenen Proof of Concept, Demo in jedem Sprint.",
    eyebrow: "Unser Vorgehen",
    title: "Von der Anforderung zum gelieferten Ergebnis",
    intro:
      "Sieben Phasen, in fester Reihenfolge. Jede Phase hat ein Ergebnis, das Sie in der Hand halten, und eine Freigabe, die erfüllt sein muss, bevor es weitergeht. Diese Freigaben verhindern die zwei häufigsten Arten, ein Projekt zu verlieren: bauen, bevor der Umfang steht — und abtauchen bis zum Schluss.",
    stages: [
      { letter: "X", icon: STAGE_ICONS.X, title: "eXaminieren" },
      { letter: "E", icon: STAGE_ICONS.E, title: "Evaluieren" },
      { letter: "D", icon: STAGE_ICONS.D, title: "Design" },
      { letter: "A", icon: STAGE_ICONS.A, title: "Aktivieren" },
    ],
    withClientLabel: "Mit Ihnen",
    internalLabel: "Intern",
    objectiveLabel: "Ziel",
    deliverableLabel: "Was Sie bekommen",
    gateLabel: "Weiter geht es erst, wenn",
    phases: [
      {
        n: 1,
        letter: "X",
        withClient: true,
        title: "Analyse & Audit",
        objective:
          "Verstehen, was Sie wirklich brauchen — und ob es mit Ihren Daten und Systemen machbar ist.",
        steps: [
          "Wir erfassen Ihre Anforderungen in Ihren Worten und trennen „Muss“ von „Kann“.",
          "Wir sichten Ihre bestehenden Tools, Datenquellen und Schnittstellen.",
          "Datenrealitäts-Check: Gibt es die Daten, sind sie zugänglich, sind sie gut genug? Hier scheitern die meisten KI-Projekte — nicht am Modell.",
          "Wir halten die Rahmenbedingungen fest: Budget, Termine, Compliance, Sicherheit, Freigaben.",
        ],
        deliverable:
          "Analyse- und Audit-Notiz: Anforderungsliste, Ist-Aufnahme, Datenbewertung, Rahmenbedingungen.",
        gate:
          "wir das Problem in einem Satz benennen können — und sagen, ob Ihre Daten und Systeme es lösbar machen.",
      },
      {
        n: 2,
        letter: "E",
        withClient: false,
        title: "Zielabgleich",
        objective:
          "Das Geschäftsergebnis und seine Messgröße festlegen — bevor irgendjemand über Werkzeuge spricht.",
        steps: [
          "Wir gehen die Analyse gemeinsam durch.",
          "Wir formulieren das Ziel messbar: „manuelle Rechnungsbearbeitung um 60 % reduzieren“ — nicht „ein Rechnungstool bauen“.",
          "Wir legen die Erfolgsmetrik fest und wie sie gemessen wird.",
          "Wir benennen die größten Risiken und offenen Fragen.",
        ],
        deliverable: "Einseitiges Zielpapier: Ergebnis, Erfolgsmetrik, wesentliche Risiken.",
        gate: "jede und jeder im Team Ziel und Metrik auswendig wiedergeben kann.",
      },
      {
        n: 3,
        letter: "E",
        withClient: true,
        title: "Umfang & Freigabe",
        objective:
          "Das Ziel in einen schriftlichen Umfang überführen, dem Sie zustimmen — der Schutz beider Seiten vor ausuferndem Scope.",
        steps: [
          "Wir schreiben den Umfang: Liefergegenstände, ausdrücklich Nicht-Enthaltenes, Annahmen, grober Zeitplan mit Meilensteinen, kommerzielle Bedingungen.",
          "Wir gehen ihn mit Ihnen durch und passen an.",
          "Sie geben schriftlich frei — vor jeder Entwicklungsarbeit.",
        ],
        deliverable: "Freigegebenes Umfangsdokument.",
        gate: "Ihre schriftliche Freigabe vorliegt.",
      },
      {
        n: 4,
        letter: "D",
        withClient: false,
        title: "Lösungsdesign",
        objective:
          "Festlegen, wie gebaut wird — Architektur und Werkzeuge — und das Unsichere entschärfen, bevor wir uns festlegen.",
        steps: [
          "Wir entwerfen die Architektur: Komponenten, Datenflüsse, Integrationen.",
          "Wir wählen Technologien und Werkzeuge — bewusst erst jetzt, nicht beim Zielabgleich.",
          "Proof of Concept: Alles wirklich Unsichere — eine knifflige KI-Funktion, eine ungetestete Schnittstelle — bauen wir zuerst klein und beweisen, dass es trägt.",
          "Ändert der Proof of Concept unsere Annahmen, aktualisieren wir den Zeitplan.",
        ],
        deliverable: "Lösungsdesign: Architektur, gewählter Stack, Ergebnis des Proof of Concept.",
        gate: "keine ungeprüfte Hochrisiko-Annahme mehr im kritischen Pfad liegt.",
      },
      {
        n: 5,
        letter: "D",
        withClient: false,
        title: "Meilensteinplanung",
        objective: "Die Arbeit in Meilensteine schneiden — aber nur das Nahe im Detail planen.",
        steps: [
          "Wir schneiden das Projekt in Meilensteine bis zur Auslieferung.",
          "Nur Sprint 1 wird in detaillierte Aufgaben zerlegt. Spätere Meilensteine bleiben ein Backlog, das wir mit jedem Lernschritt verfeinern.",
          "Wir definieren „fertig“ für jeden Meilenstein.",
          "Wir legen Sprintlänge und Demo-Rhythmus fest.",
        ],
        deliverable: "Meilensteinplan plus detailliertes Backlog für Sprint 1.",
        gate: "die Aufgaben für Sprint 1 geschätzt und startbereit sind.",
      },
      {
        n: 6,
        letter: "A",
        withClient: true,
        title: "Iterative Sprints",
        objective:
          "In kurzen Zyklen bauen — und Ihnen in jedem Zyklus lauffähige Software zeigen.",
        steps: [
          "Planung: Die nächsten Punkte kommen aus dem Backlog in den Sprint.",
          "Bauen: kurze tägliche Abstimmung, damit Blocker sofort sichtbar werden.",
          "Demo: Wir zeigen Ihnen, was dieser Sprint gebracht hat.",
          "Anpassen: Ihr Feedback geht ins Backlog und formt den nächsten Sprint.",
        ],
        deliverable: "Pro Sprint ein lauffähiger Zuwachs und ein aktualisiertes Backlog.",
        gate: "alle Meilensteine geliefert und von Ihnen abgenommen sind.",
      },
      {
        n: 7,
        letter: "A",
        withClient: true,
        title: "Übergabe & Betrieb",
        objective: "Sauber übergeben und den Support aufsetzen.",
        steps: [
          "Endgültige Lieferung gegen den freigegebenen Umfang.",
          "Übergabe: Dokumentation, Zugänge, Schulung für Ihr Team.",
          "Wir vereinbaren Support- und Wartungsbedingungen.",
          "Interne Retrospektive: Was behalten wir bei, was ändern wir beim nächsten Mal?",
        ],
        deliverable: "Übergabepaket, unterschriebene Abnahme, Retrospektiv-Notizen.",
        gate: "Sie alles haben, um es selbst zu betreiben — und die Support-Bedingungen stehen.",
      },
    ],
    rulesTitle: "Die vier Regeln, an die wir uns halten",
    rulesIntro:
      "Diese Regeln stehen nicht zur Verhandlung — sie sind der Grund, warum die Phasen funktionieren.",
    rules: [
      "Keine Entwicklungsarbeit, bevor der Umfang schriftlich freigegeben ist.",
      "Keine Festlegung auf den vollen Stack, bevor die riskanten Teile als Proof of Concept bewiesen sind.",
      "Nur der nächste Sprint wird im Detail geplant — der Rest bleibt Backlog.",
      "Demo in jedem Sprint. Wir tauchen nie ab.",
    ],
    ctaTitle: "Der erste Schritt ist Phase 1 — und die ist kostenlos.",
    ctaBody:
      "Im KI-Audit gehen wir in 30 Minuten durch, wo in Ihrem Betrieb Zeit und Geld stecken, und ob Ihre Daten und Systeme es lösbar machen. Ohne Verpflichtung.",
    ctaButton: "Kostenloses KI-Audit buchen",
  },

  en: {
    seoTitle: "How we work — from requirement to delivered result | xeda.ai",
    seoDescription:
      "Seven phases, hard gates and four rules: no build before the scope is signed, no full-stack commitment before the risky parts are proven, a demo every sprint.",
    eyebrow: "How we work",
    title: "From requirement to delivered result",
    intro:
      "Seven phases, run in order. Each one produces something you hold in your hands, and each has a gate that must be met before the work moves on. Those gates exist to stop the two most common ways a project is lost: building before the scope is agreed — and disappearing until the end.",
    stages: [
      { letter: "X", icon: STAGE_ICONS.X, title: "eXamine" },
      { letter: "E", icon: STAGE_ICONS.E, title: "Evaluate" },
      { letter: "D", icon: STAGE_ICONS.D, title: "Design" },
      { letter: "A", icon: STAGE_ICONS.A, title: "Activate" },
    ],
    withClientLabel: "With you",
    internalLabel: "Internal",
    objectiveLabel: "Objective",
    deliverableLabel: "What you get",
    gateLabel: "We move on only when",
    phases: [
      {
        n: 1,
        letter: "X",
        withClient: true,
        title: "Discovery & audit",
        objective:
          "Understand what you actually need — and whether your data and systems make it buildable.",
        steps: [
          "We capture your requirements in your words, separating “must have” from “nice to have”.",
          "We audit the tools, data sources and integrations you have today.",
          "Data reality check: does the data exist, is it accessible, is it good enough? This is where most AI projects fail — not in the modelling.",
          "We record the constraints: budget, deadlines, compliance, security, who signs off.",
        ],
        deliverable:
          "Discovery & audit note: requirements list, current-state summary, data assessment, constraints.",
        gate:
          "we can state the problem in one sentence — and say whether your data and systems make it solvable.",
      },
      {
        n: 2,
        letter: "E",
        withClient: false,
        title: "Goal alignment",
        objective:
          "Agree the business outcome and how success is measured — before anyone talks about tools.",
        steps: [
          "We review the discovery note together.",
          "We state the target as something measurable: “cut manual invoice handling by 60%” — not “build an invoice tool”.",
          "We agree the success metric and how it will be measured.",
          "We name the biggest risks and open questions.",
        ],
        deliverable: "A one-page goal statement: outcome, success metric, key risks.",
        gate: "everyone on the team can repeat the goal and the metric without looking.",
      },
      {
        n: 3,
        letter: "E",
        withClient: true,
        title: "Scope & sign-off",
        objective:
          "Turn the goal into a written scope you agree to — protection for both sides against scope creep.",
        steps: [
          "We write the scope: deliverables, what is explicitly out of scope, assumptions, an outline timeline with milestones, commercial terms.",
          "We walk you through it and adjust.",
          "You sign off in writing — before any build work starts.",
        ],
        deliverable: "A signed scope document.",
        gate: "you have approved the scope in writing.",
      },
      {
        n: 4,
        letter: "D",
        withClient: false,
        title: "Solution design",
        objective:
          "Decide how it gets built — architecture and tools — and de-risk the uncertain parts before committing.",
        steps: [
          "We design the architecture: components, data flow, integrations.",
          "We choose the tools and technologies — deliberately now, not back at goal alignment.",
          "Proof of concept: anything genuinely uncertain — a tricky AI feature, an untested integration — gets built small first, to prove it holds.",
          "If the proof of concept changes our assumptions, we update the timeline.",
        ],
        deliverable: "Solution design: architecture, chosen stack, proof-of-concept result.",
        gate: "no unproven high-risk assumption is left in the critical path.",
      },
      {
        n: 5,
        letter: "D",
        withClient: false,
        title: "Milestone planning",
        objective: "Break the work into milestones — but detail only the near term.",
        steps: [
          "We break the project into milestones through to delivery.",
          "Only Sprint 1 is broken into detailed tasks. Later milestones stay a backlog we refine as we learn.",
          "We define “done” for each milestone.",
          "We set the sprint length and the demo cadence.",
        ],
        deliverable: "A milestone plan plus a detailed Sprint 1 backlog.",
        gate: "the Sprint 1 tasks are estimated and ready to start.",
      },
      {
        n: 6,
        letter: "A",
        withClient: true,
        title: "Iterative sprints",
        objective: "Build in short cycles — showing you working software every one of them.",
        steps: [
          "Planning: the next items come off the backlog into the sprint.",
          "Build: a short daily sync so blockers surface immediately.",
          "Demo: we show you what shipped this sprint.",
          "Adjust: your feedback goes into the backlog and shapes the next sprint.",
        ],
        deliverable: "Per sprint: a working increment and an updated backlog.",
        gate: "every milestone is delivered and accepted by you.",
      },
      {
        n: 7,
        letter: "A",
        withClient: true,
        title: "Delivery & handover",
        objective: "Hand over cleanly and set up support.",
        steps: [
          "Final delivery against the signed scope.",
          "Handover: documentation, credentials, training for your team.",
          "We agree support and maintenance terms.",
          "Internal retrospective: what we keep, what we change next time.",
        ],
        deliverable: "Handover pack, signed acceptance, retrospective notes.",
        gate: "you have everything needed to run it — and the support terms are agreed.",
      },
    ],
    rulesTitle: "The four rules we hold ourselves to",
    rulesIntro: "These are not negotiable — they are why the phases work.",
    rules: [
      "No build work before the scope is signed.",
      "No full-stack commitment before the risky parts are proven with a proof of concept.",
      "Only the next sprint is planned in detail — the rest stays a backlog.",
      "A demo every sprint. We never go dark.",
    ],
    ctaTitle: "The first step is Phase 1 — and it's free.",
    ctaBody:
      "In a 30-minute AI audit we go through where the time and money sit in your operation, and whether your data and systems make it solvable. No obligation.",
    ctaButton: "Book a free AI audit",
  },
};
