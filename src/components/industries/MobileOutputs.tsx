import type { ReactNode } from "react";
import { CalendarCheck, FileSpreadsheet, MailCheck, Send, Store, Truck } from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { tx, type LeadOutput, type ListOutput, type Output, type ReportOutput, type Status, type TableOutput } from "./data";
import { SitePhotoArt, StatusMark } from "./primitives";
import { delay, mRowAt } from "./timing";

// The phone versions of the six results. Same content as desktop, less
// chrome: every row is "what it was → what it became", one status on the
// right. Rows arrive quickly (the phone run is about 1.3 s in all).

const mStatusAt = (i: number, status: Status = "ok") => mRowAt(i) + 140 + (status === "ok" ? 0 : 80);

const Panel = ({ app, title, meta, children }: { app: string; title: string; meta?: ReactNode; children: ReactNode }) => (
  <div className="ixm-panel">
    <div className="ixm-panel-head">
      <span className="ix-app">{app}</span>
      <span className="min-w-0">{title}</span>
      {meta && <span className="ixm-panel-meta" style={delay(mRowAt(0))}>{meta}</span>}
    </div>
    {children}
  </div>
);

const Row = ({ i, status, title, sub, note, lang, lead }: {
  i: number; status: Status; title: ReactNode; sub?: ReactNode; note?: ReactNode; lang: SiteLanguage; lead?: ReactNode;
}) => (
  <div className="ixm-row" style={delay(mRowAt(i))}>
    {lead}
    <div className="min-w-0 flex-1">
      <p className="ixm-row-title">{title}</p>
      {sub && <p className="ixm-row-sub">{sub}</p>}
      {note && <p className="ixm-row-note">{note}</p>}
    </div>
    <StatusMark status={status} d={mStatusAt(i, status)} lang={lang} />
  </div>
);

const counts = (rows: { status: Status }[], lang: SiteLanguage) => {
  const ok = rows.filter((r) => r.status === "ok").length;
  const rest = rows.length - ok;
  return lang === "de"
    ? `${ok} bereit${rest ? ` · ${rest} prüfen` : ""}`
    : `${ok} ready${rest ? ` · ${rest} to check` : ""}`;
};

const TableM = ({ o, lang }: { o: TableOutput; lang: SiteLanguage }) => {
  const FootIcon = o.footer.icon === "send" ? Send : FileSpreadsheet;
  const n = o.rows.length;
  return (
    <Panel app={o.app} title={tx(o.title, lang)} meta={counts(o.rows, lang)}>
      {o.rows.map((r, i) => (
        <Row key={i} i={i} status={r.status} lang={lang}
          title={tx(r.cells[0], lang)} sub={tx(r.sub, lang)} note={r.note && tx(r.note, lang)} />
      ))}
      <Row i={n} status="ok" lang={lang}
        lead={<FootIcon className="ixm-row-icon" />}
        title={tx(o.footer.text, lang)} />
    </Panel>
  );
};

const ListM = ({ o, lang }: { o: ListOutput; lang: SiteLanguage }) => {
  const n = o.rows.length;
  return (
    <Panel app={tx(o.app, lang)} title={tx(o.title, lang)} meta={o.tally && tx(o.tally, lang)}>
      {o.rows.map((r, i) => (
        <Row key={i} i={i} status={r.status} lang={lang}
          title={<span className="ixm-row-req">“{tx(r.req, lang)}”</span>}
          sub={<span className={r.status === "staff" ? "ixm-row-staff" : "text-foreground"}>{tx(r.res, lang)}</span>} />
      ))}
      {o.tracking && (
        <>
          <div className="ixm-row" style={delay(mRowAt(n))}>
            <Truck className="ixm-row-icon" />
            <div className="min-w-0 flex-1">
              <p className="ixm-row-title">{tx(o.tracking.steps[o.tracking.steps.length - 1], lang)}</p>
              <span className="ixm-steps">
                {o.tracking.steps.map((s, i) => <span key={i} style={delay(mRowAt(n) + 80 + i * 70)} />)}
              </span>
            </div>
          </div>
          <Row i={n + 1} status="ok" lang={lang} lead={<Store className="ixm-row-icon" />} title={tx(o.tracking.store, lang)} />
        </>
      )}
    </Panel>
  );
};

const LeadM = ({ o, lang }: { o: LeadOutput; lang: SiteLanguage }) => (
  <Panel app="CRM" title={lang === "de" ? "Neuer Lead · Website" : "New lead · website"}>
    <Row i={0} status="ok" lang={lang}
      lead={<span className="ix-avatar">{o.initials}</span>}
      title={o.name}
      sub={lang === "de" ? "Qualifizierte Käuferin" : "Qualified buyer"} />
    <div className="ixm-facts" style={delay(mRowAt(1))}>
      {o.facts.map((f, i) => (
        <div key={i}>
          <span className="ixm-fact-label">{tx(f.label, lang)}</span>
          <span className="ixm-fact-value">{tx(f.value, lang)}</span>
        </div>
      ))}
    </div>
    <div className="ixm-row" style={delay(mRowAt(2))}>
      <CalendarCheck className="ixm-row-icon" />
      <div className="min-w-0 flex-1">
        <p className="ixm-row-title">{tx(o.booked, lang)}</p>
        <span className="ixm-days">
          {o.days.map((d, i) => (
            <span key={i} className={i === o.slot.day ? "is-booked" : ""} style={i === o.slot.day ? delay(mRowAt(2) + 160) : undefined}>
              {tx(d, lang)}
            </span>
          ))}
        </span>
      </div>
      <StatusMark status="ok" d={mStatusAt(2)} lang={lang} />
    </div>
    <Row i={3} status="ok" lang={lang} lead={<MailCheck className="ixm-row-icon" />} title={tx(o.followUp, lang)} />
  </Panel>
);

const ReportM = ({ o, lang }: { o: ReportOutput; lang: SiteLanguage }) => (
  <Panel app={lang === "de" ? "Projekt" : "Project"} title={tx(o.site, lang)}>
    <div className="ixm-row" style={delay(mRowAt(0))}>
      <span className="ixm-thumb"><SitePhotoArt /></span>
      <div className="min-w-0 flex-1">
        <p className="ixm-row-title">{tx(o.title, lang)}</p>
        <p className="ixm-row-sub flex justify-between gap-2">
          <span className="truncate">{tx(o.progress.label, lang)}</span>
          <span className="font-mono tabular-nums text-foreground">{o.progress.pct}%</span>
        </p>
        <span className="ix-bar mt-1.5"><span style={{ ...delay(mRowAt(0) + 120), width: `${o.progress.pct}%` }} /></span>
      </div>
    </div>
    {o.rows.map((r, i) => (
      <Row key={i} i={i + 1} status={r.status} lang={lang} title={tx(r.text, lang)} />
    ))}
  </Panel>
);

export const MobileOutput = ({ output, lang }: { output: Output; lang: SiteLanguage }) => {
  switch (output.kind) {
    case "table": return <TableM o={output} lang={lang} />;
    case "list": return <ListM o={output} lang={lang} />;
    case "lead": return <LeadM o={output} lang={lang} />;
    case "report": return <ReportM o={output} lang={lang} />;
  }
};
