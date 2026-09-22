import type React from "react";
import { Workflow, Zap, Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import XedaMarkAnimated from "@/components/XedaMarkAnimated";
import XedaWordmark from "@/components/XedaWordmark";

// Columns of raw bits falling behind the mark: the same unstructured-input motif
// the hero's assembly line opens with, so the panel reads as data around the
// business rather than as decoration. Language-neutral, so not translated.
const STREAMS = [
  { left: "14%", bits: "0110100101101001", dur: "11s", delay: "-2s" },
  { left: "27%", bits: "1001011010011010", dur: "14s", delay: "-7s" },
  { left: "71%", bits: "0101101001011001", dur: "12s", delay: "-4s" },
  { left: "84%", bits: "1100101011010011", dur: "15s", delay: "-10s" },
  { left: "60%", bits: "0011010110010110", dur: "17s", delay: "-13s" },
];

const WhatWeDoSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Workflow,
      titleKey: "whatWeDo.saas.title",
      descKey: "whatWeDo.saas.desc",
    },
    {
      icon: Zap,
      titleKey: "whatWeDo.mvp.title",
      descKey: "whatWeDo.mvp.desc",
    },
    {
      icon: Bot,
      titleKey: "whatWeDo.automation.title",
      descKey: "whatWeDo.automation.desc",
    },
  ];

  return (
    <section id="what-we-do" className="py-28 md:py-36 bg-background">
      <div className="container mx-auto px-6">
        {/* Statement on the left, a framed visual on the right. The three
            services sit under the statement as a list rather than cards, so the
            section keeps all its content inside the two columns. */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-20 items-stretch">
          <div>
            <span className="text-sm font-semibold tracking-wide text-muted-foreground mb-5 block">{t("whatWeDo.label")}</span>
            <h2 className="font-display font-medium uppercase text-[2.35rem] sm:text-5xl xl:text-[3.6rem] leading-[1.02] tracking-[-0.005em] text-brand-accent mb-8 text-balance">
              {t("whatWeDo.title")}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-foreground/90 max-w-xl mb-12">
              {t("whatWeDo.subtitle")}
            </p>

            <ul className="space-y-7">
              {services.map((service, index) => (
                <li
                  key={index}
                  className="enter flex gap-5"
                  style={{ "--enter-delay": `${index * 0.08}s` } as React.CSSProperties}
                >
                  <div className="w-11 h-11 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5">{t(service.titleKey)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(service.descKey)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative: the heading and list above carry the content, so the
              panel is hidden from assistive tech. section-ink keeps it a dark
              panel in both themes, the way a photograph would stay dark. */}
          <div aria-hidden="true" className="section-ink wwd-panel relative min-h-[340px] sm:min-h-[420px] lg:min-h-[560px]">
            <div className="wwd-streams">
              {STREAMS.map((s) => (
                <span
                  key={s.left}
                  className="wwd-stream"
                  style={{ left: s.left, "--dur": s.dur, "--delay": s.delay } as React.CSSProperties}
                >
                  {s.bits}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-9">
              <div className="wwd-halo">
                <XedaMarkAnimated className="relative w-44 sm:w-60 h-auto text-foreground" />
              </div>
              <XedaWordmark className="h-6 sm:h-7 w-auto text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDoSection;
