import type React from "react";
import type { ReactNode } from "react";
import {
  Check, CircleHelp, FileText, Mail, MapPin, Package, PencilLine, Phone, PhoneMissed,
  Pill, ReceiptText, TriangleAlert, UserRound,
} from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { tx, type InputItem, type Status } from "./data";
import { delay } from "./timing";

// Shared pieces for the industries scene. Every animated element carries a
// `--d` (its delay in ms within a run, see timing.ts); the timing itself lives
// in index.css under "Industries", keyed off the scene's data-run attribute.

/* --- Status ---------------------------------------------------------------- */

const STATUS: Record<Status, { icon: typeof Check; cls: string; label: { en: string; de: string } }> = {
  ok: { icon: Check, cls: "ix-status--ok", label: { en: "Done", de: "Erledigt" } },
  warn: { icon: TriangleAlert, cls: "ix-status--warn", label: { en: "Needs review", de: "Prüfen" } },
  draft: { icon: PencilLine, cls: "ix-status--draft", label: { en: "Draft for review", de: "Entwurf zur Freigabe" } },
  staff: { icon: UserRound, cls: "ix-status--staff", label: { en: "Handed to staff", de: "An Team übergeben" } },
};

/** A round status mark; it pops in at its own delay once the row has filled. */
export const StatusMark = ({ status, d, lang }: { status: Status; d: number; lang: SiteLanguage }) => {
  const { icon: Icon, cls, label } = STATUS[status];
  return (
    <span className={`ix-status ${cls}`} style={delay(d)} role="img" aria-label={label[lang]}>
      <Icon className="h-3 w-3" strokeWidth={2.6} />
    </span>
  );
};

/* --- Output frame ---------------------------------------------------------- */

/** The interface a result lands in: an app chip, a title, and a sync state
 *  that reads "waiting" before the run and "updated" after it. */
export const OutPanel = ({
  app, title, right, lang, children,
}: { app: string; title: string; right?: ReactNode; lang: SiteLanguage; children: ReactNode }) => (
  <div className="ix-panel">
    <div className="flex items-center gap-2.5 border-b border-border/70 px-3.5 py-2.5">
      <span className="ix-app">{app}</span>
      <span className="truncate text-xs text-muted-foreground">{title}</span>
      <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em]">
        {right}
        <span className="ix-sync">
          <span className="ix-sync-wait">{lang === "de" ? "Wartet" : "Waiting"}</span>
          <span className="ix-sync-done" style={delay(2050)}>{lang === "de" ? "Aktualisiert" : "Updated"}</span>
        </span>
      </span>
    </div>
    {children}
  </div>
);

/** One output row: a grey skeleton before the run, filled with real values
 *  (and then a status) as the run reaches it. */
export const OutRow = ({
  d, className = "", style, children,
}: { d: number; className?: string; style?: React.CSSProperties; children: ReactNode }) => (
  <div className="ix-row">
    <div className="ix-skel" style={delay(d)} aria-hidden="true">
      <span style={{ width: "34%" }} />
      <span style={{ width: "18%" }} />
      <span style={{ width: "22%" }} />
    </div>
    <div className={`ix-fill ${className}`} style={{ ...style, ...delay(d) }}>
      {children}
    </div>
  </div>
);

/* --- Inputs ---------------------------------------------------------------- */

/** A small "unresolved" marker on inputs nobody has dealt with yet. */
const Unresolved = () => (
  <span className="ix-unresolved" aria-hidden="true">
    <CircleHelp className="h-3 w-3" />
  </span>
);

/** A little dusk house for the listing card — drawn, so it stays sharp and
 *  takes the site's colours. */
export const HouseArt = () => (
  <svg viewBox="0 0 120 56" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="ix-dusk" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="hsl(215 30% 22%)" />
        <stop offset="1" stopColor="hsl(28 30% 26%)" />
      </linearGradient>
    </defs>
    <rect width="120" height="56" fill="url(#ix-dusk)" />
    <path d="M0 50 Q30 44 60 48 T120 46 V56 H0Z" fill="hsl(150 18% 16%)" />
    <path d="M30 48 V26 L56 12 L82 26 V48 Z" fill="hsl(30 8% 14%)" stroke="hsl(40 20% 94% / .35)" strokeWidth=".8" />
    <rect x="84" y="30" width="18" height="18" fill="hsl(30 8% 12%)" stroke="hsl(40 20% 94% / .25)" strokeWidth=".8" />
    {[[37, 30], [49, 30], [61, 30], [37, 39], [61, 39], [88, 35]].map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width="7" height="5" rx=".6" fill="hsl(36 85% 66% / .85)" />
    ))}
    <rect x="50" y="38" width="7" height="10" fill="hsl(36 70% 55% / .6)" />
  </svg>
);

/** A site photograph: an unfinished frame, a crane, grey sky. */
export const SitePhotoArt = () => (
  <svg viewBox="0 0 128 76" className="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="ix-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="hsl(210 16% 40%)" />
        <stop offset="1" stopColor="hsl(30 14% 30%)" />
      </linearGradient>
    </defs>
    <rect width="128" height="76" fill="url(#ix-sky)" />
    <g stroke="hsl(40 20% 90% / .7)" strokeWidth="1.2" fill="none">
      <path d="M20 70 V34 H78 V70 M20 46 H78 M20 58 H78 M39 34 V70 M58 34 V70" />
      <path d="M96 70 V10 M96 12 H124 M96 12 L70 12 M96 12 L112 22 M84 12 V26" />
    </g>
    <rect x="80" y="26" width="8" height="6" fill="hsl(36 80% 60% / .8)" />
    <rect y="68" width="128" height="8" fill="hsl(30 12% 18%)" />
  </svg>
);

const inputKind = (item: InputItem, lang: SiteLanguage): ReactNode => {
  switch (item.kind) {
    case "doc": {
      const DocIcon = item.icon === "rx" ? Pill : item.icon === "invoice" ? ReceiptText : FileText;
      return (
        <div className="ix-card w-[8.6rem] p-2.5">
          <div className="mb-2 flex items-center gap-1.5">
            <span className={`ix-tag ${item.tag === "PDF" ? "ix-tag--pdf" : ""}`}>{item.tag}</span>
            <DocIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mb-2 text-[11px] font-semibold leading-tight text-foreground/90">{tx(item.title, lang)}</p>
          <span className="ix-line w-[88%]" />
          <span className="ix-line w-[70%]" />
          <span className="ix-line w-[52%]" />
        </div>
      );
    }
    case "field":
      return <div className="ix-chip">{tx(item.value, lang)}</div>;
    case "mail":
      return (
        <div className="ix-card w-[11.5rem] p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate font-mono text-[10px] text-muted-foreground">{item.from}</span>
          </div>
          <p className="text-[11px] font-semibold leading-snug text-foreground/90">{tx(item.subject, lang)}</p>
          <span className="ix-line mt-1.5 w-[80%]" />
        </div>
      );
    case "chat":
      return (
        <div className={`ix-bubble ${item.channel === "site" ? "ix-bubble--site" : ""} max-w-[12.5rem]`}>
          {item.from && <span className="mb-0.5 block text-[9.5px] text-muted-foreground">{tx(item.from, lang)}</span>}
          <span className="block text-[11.5px] leading-snug text-foreground/90">{tx(item.text, lang)}</span>
        </div>
      );
    case "call": {
      const CallIcon = item.missed ? PhoneMissed : Phone;
      return (
        <div className="ix-card flex w-[10.5rem] items-center gap-2.5 p-2.5">
          <span className={`ix-callicon ${item.missed ? "ix-callicon--missed" : ""}`}>
            <CallIcon className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-foreground/90">{tx(item.title, lang)}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{tx(item.sub, lang)}</span>
          </span>
        </div>
      );
    }
    case "photo":
      return (
        <div className="ix-card w-[8.4rem] overflow-hidden p-1">
          <div className="h-[4.6rem] overflow-hidden rounded-[0.35rem]"><SitePhotoArt /></div>
          <span className="block px-1 pt-1 font-mono text-[9.5px] text-muted-foreground">{tx(item.caption, lang)}</span>
        </div>
      );
    case "note":
      return <div className="ix-note">{tx(item.text, lang)}</div>;
    case "listing":
      return (
        <div className="ix-card w-[9.6rem] overflow-hidden p-1">
          <div className="h-[3.6rem] overflow-hidden rounded-[0.35rem]"><HouseArt /></div>
          <div className="px-1.5 pb-1 pt-1.5">
            <span className="block text-[12px] font-bold text-foreground">{tx(item.price, lang)}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" />{tx(item.place, lang)}
            </span>
          </div>
        </div>
      );
    case "order":
      return (
        <div className="ix-card flex w-[10.5rem] items-center gap-2.5 p-2.5">
          <span className="ix-callicon"><Package className="h-3.5 w-3.5" /></span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-foreground/90">{tx(item.title, lang)}</span>
            <span className="block truncate text-[10px] text-muted-foreground">{tx(item.sub, lang)}</span>
          </span>
        </div>
      );
  }
};

/** A messy input, placed and tilted where the data puts it. When Xeda runs it
 *  travels into the node (the vector is measured and set as --dx/--dy). */
export const InputCard = ({ item, i, lang }: { item: InputItem; i: number; lang: SiteLanguage }) => (
  <div
    data-ix-input
    className="ix-item"
    style={{ "--x": `${item.x}%`, "--y": `${item.y}%`, "--r": `${item.r}deg`, "--i": i } as React.CSSProperties}
  >
    {inputKind(item, lang)}
    {item.unresolved && <Unresolved />}
  </div>
);
