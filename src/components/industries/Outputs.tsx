import { CalendarCheck, FileSpreadsheet, MailCheck, Send, Store, Truck } from "lucide-react";
import type { SiteLanguage } from "@/contexts/LanguageContext";
import { tx, type LeadOutput, type ListOutput, type Output, type ReportOutput, type TableOutput } from "./data";
import { OutPanel, OutRow, SitePhotoArt, StatusMark } from "./primitives";
import { delay, rowAt } from "./timing";

// The structured side of each scene. Rows arrive one after another once Xeda
// has read the inputs; each status lands a beat after its row, and an
// exception lands last so it reads as the thing worth a look.

const statusAt = (i: number, warn = false) => rowAt(i) + 280 + (warn ? 180 : 0);

const TableOut = ({ o, lang }: { o: TableOutput; lang: SiteLanguage }) => {
  const done = rowAt(o.rows.length) + 200;
  const FootIcon = o.footer.icon === "send" ? Send : FileSpreadsheet;
  return (
    <OutPanel app={o.app} title={tx(o.title, lang)} lang={lang}>
      <div className="ix-thead" style={{ gridTemplateColumns: o.grid }}>
        {o.cols.map((c, i) => <span key={i}>{tx(c, lang)}</span>)}
      </div>
      {o.rows.map((row, i) => (
        <OutRow key={i} d={rowAt(i)} className="ix-trow" style={{ gridTemplateColumns: o.grid }}>
          {row.cells.map((c, j) => (
            <span key={j} className={j === 0 ? "truncate font-medium text-foreground" : "truncate font-mono tabular-nums"}>
              {tx(c, lang)}
            </span>
          ))}
          <StatusMark status={row.status} d={statusAt(i, row.status === "warn")} lang={lang} />
          {row.note && (
            <span className="ix-note-line col-span-full" style={delay(statusAt(i, true) + 60)}>{tx(row.note, lang)}</span>
          )}
        </OutRow>
      ))}
      <div className="ix-foot" style={delay(done)}>
        <FootIcon className="h-3.5 w-3.5 text-success" />
        <span>{tx(o.footer.text, lang)}</span>
        <StatusMark status="ok" d={done + 120} lang={lang} />
      </div>
    </OutPanel>
  );
};

const ListOut = ({ o, lang }: { o: ListOutput; lang: SiteLanguage }) => {
  const done = rowAt(o.rows.length) + 150;
  return (
    <OutPanel
      app={tx(o.app, lang)}
      title={tx(o.title, lang)}
      lang={lang}
      right={o.tally && <span className="ix-fill-inline text-success" style={delay(done)}>{tx(o.tally, lang)} ·</span>}
    >
      {o.rows.map((row, i) => (
        <OutRow key={i} d={rowAt(i)} className={`ix-lrow ${row.status === "staff" ? "ix-lrow--staff" : ""}`}>
          <span className="min-w-0">
            <span className="block truncate text-[11px] text-muted-foreground">“{tx(row.req, lang)}”</span>
            <span className="block truncate text-[12.5px] font-medium text-foreground">{tx(row.res, lang)}</span>
          </span>
          <StatusMark status={row.status} d={statusAt(i, row.status !== "ok")} lang={lang} />
        </OutRow>
      ))}
      {o.tracking && (
        <div className="ix-foot ix-foot--stack" style={delay(done)}>
          <div className="flex w-full items-center gap-2">
            <Truck className="h-3.5 w-3.5 shrink-0 text-success" />
            <ol className="ix-track">
              {o.tracking.steps.map((s, i) => (
                <li key={i} style={delay(done + 120 + i * 140)}>{tx(s, lang)}</li>
              ))}
            </ol>
          </div>
          <div className="flex w-full items-center gap-2">
            <Store className="h-3.5 w-3.5 shrink-0 text-success" />
            <span>{tx(o.tracking.store, lang)}</span>
            <span className="ml-auto"><StatusMark status="ok" d={done + 520} lang={lang} /></span>
          </div>
        </div>
      )}
    </OutPanel>
  );
};

const LeadOut = ({ o, lang }: { o: LeadOutput; lang: SiteLanguage }) => {
  const cal = rowAt(3);
  const times = ["10:00", "15:00", "17:30"];
  return (
    <OutPanel app="CRM" title={lang === "de" ? "Neuer Lead · Website" : "New lead · website"} lang={lang}>
      <OutRow d={rowAt(0)} className="flex items-center gap-3 px-3.5 py-3">
        <span className="ix-avatar">{o.initials}</span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{o.name}</span>
          <span className="block text-[11px] text-muted-foreground">{lang === "de" ? "Qualifizierte Käuferin" : "Qualified buyer"}</span>
        </span>
        <span className="ml-auto"><StatusMark status="ok" d={statusAt(0)} lang={lang} /></span>
      </OutRow>
      <div className="grid grid-cols-2 border-t border-border/60">
        {o.facts.map((f, i) => (
          <OutRow key={i} d={rowAt(1) + i * 70} className="px-3.5 py-2">
            <span className="block text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{tx(f.label, lang)}</span>
            <span className="block truncate text-[12px] font-medium text-foreground">{tx(f.value, lang)}</span>
          </OutRow>
        ))}
      </div>
      <div className="border-t border-border/60 px-3.5 pb-3 pt-2.5">
        <div className="ix-cal" style={{ gridTemplateColumns: `repeat(${o.days.length}, minmax(0, 1fr))` }}>
          {o.days.map((d, di) => (
            <div key={di} className="ix-cal-day">
              <span className="ix-cal-head">{tx(d, lang)}</span>
              {times.map((t) => {
                const booked = di === o.slot.day && t === o.slot.time;
                return (
                  <span key={t} className={`ix-cal-slot ${booked ? "ix-cal-slot--booked" : ""}`} style={booked ? delay(cal + 250) : undefined}>
                    {booked ? t : ""}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div className="ix-foot ix-foot--flush mt-2.5" style={delay(cal + 420)}>
          <CalendarCheck className="h-3.5 w-3.5 text-success" />
          <span>{tx(o.booked, lang)}</span>
          <StatusMark status="ok" d={cal + 520} lang={lang} />
        </div>
        <div className="ix-foot ix-foot--flush" style={delay(cal + 560)}>
          <MailCheck className="h-3.5 w-3.5 text-success" />
          <span>{tx(o.followUp, lang)}</span>
          <StatusMark status="ok" d={cal + 660} lang={lang} />
        </div>
      </div>
    </OutPanel>
  );
};

const ReportOut = ({ o, lang }: { o: ReportOutput; lang: SiteLanguage }) => (
  <OutPanel app={lang === "de" ? "Projekt" : "Project"} title={tx(o.site, lang)} lang={lang}>
    <OutRow d={rowAt(0)} className="flex items-center gap-3 px-3.5 py-3">
      <span className="h-12 w-[4.6rem] shrink-0 overflow-hidden rounded-md"><SitePhotoArt /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-foreground">{tx(o.title, lang)}</span>
        <span className="mt-1 flex items-center justify-between text-[10.5px] text-muted-foreground">
          <span>{tx(o.progress.label, lang)}</span>
          <span className="font-mono tabular-nums text-foreground">{o.progress.pct}%</span>
        </span>
        <span className="ix-bar mt-1"><span style={{ ...delay(rowAt(0) + 200), width: `${o.progress.pct}%` }} /></span>
      </span>
    </OutRow>
    {o.rows.map((row, i) => (
      <OutRow key={i} d={rowAt(i + 1)} className="ix-lrow">
        <span className="truncate text-[12px] text-foreground">{tx(row.text, lang)}</span>
        <StatusMark status={row.status} d={statusAt(i + 1, row.status === "warn")} lang={lang} />
      </OutRow>
    ))}
  </OutPanel>
);

export const OutputView = ({ output, lang }: { output: Output; lang: SiteLanguage }) => {
  switch (output.kind) {
    case "table": return <TableOut o={output} lang={lang} />;
    case "list": return <ListOut o={output} lang={lang} />;
    case "lead": return <LeadOut o={output} lang={lang} />;
    case "report": return <ReportOut o={output} lang={lang} />;
  }
};
