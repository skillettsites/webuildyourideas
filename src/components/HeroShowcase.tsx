"use client";

import { useEffect, useMemo, useState } from "react";
import { buildSite } from "@/lib/site/content";
import { renderSite } from "@/lib/site/render";
import { BrowserFrame, ScaledSite } from "./DeviceFrames";

// Real output from the free preview engine, fed the same kind of sentence a visitor would type.
// Names are fictional and each domain was checked as unregistered on 28 Sep 2026.
const EXAMPLES = [
  { tab: "Bakery", name: "", domain: "brightcrumb.co.uk", text: "A Saturday bakery stall in York called Bright Crumb. Sourdough, cinnamon buns and birthday cakes to order." },
  { tab: "Dog walker", name: "", domain: "tailtrailsleeds.co.uk", text: "Tail Trails: small-group dog walks around Roundhay Park in Leeds, plus puppy visits." },
  { tab: "Choir", name: "The Oakwood Choir", domain: "oakwoodchoirstockport.co.uk", text: "A friendly community choir in Stockport that meets on Tuesday evenings. No auditions, all voices welcome." },
  { tab: "Photographer", name: "", domain: "ellahartphotography.co.uk", text: "Wedding and family photography in Bristol by Ella Hart. Relaxed, natural, no stiff poses." },
];

export function HeroShowcase() {
  const sites = useMemo(
    () =>
      EXAMPLES.map((e) => {
        const s = buildSite({ name: e.name, description: e.text });
        return { ...e, html: renderSite(s) };
      }),
    [],
  );
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState(sites[0].text.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % sites.length), 7000);
    return () => clearInterval(t);
  }, [paused, sites.length]);

  // Type the idea out each time the example changes.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const full = sites[i].text.length;
    if (reduce) {
      setTyped(full);
      return;
    }
    setTyped(0);
    let n = 0;
    const t = setInterval(() => {
      n += 2;
      setTyped(Math.min(n, full));
      if (n >= full) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [i, sites]);

  const current = sites[i];

  return (
    <div className="relative mx-auto w-full max-w-[1080px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hero-glow top-[8%]" aria-hidden="true" />
      <div className="relative grid items-center gap-6 lg:grid-cols-[300px_1fr] lg:gap-10">
        <div className="order-2 lg:order-1">
          <div className="card-white p-5 text-left">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-mute">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" aria-hidden="true" />
              Someone types
            </div>
            <p className="mt-3 min-h-[96px] text-[17px] leading-[1.45] tracking-[-0.015em] text-ink" aria-live="off">
              {current.name && <span className="font-semibold">{current.name}. </span>}
              {current.text.slice(0, typed)}
              {typed < current.text.length && <span className="ml-0.5 inline-block h-[18px] w-[2px] translate-y-[3px] animate-pulse bg-blue" />}
            </p>
            <div className="mt-4 flex items-center gap-2 border-t hairline pt-4 text-[13px] text-mute">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-green" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Website preview ready in seconds
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Example ideas">
            {sites.map((s, n) => (
              <button
                key={s.tab}
                type="button"
                role="tab"
                aria-selected={n === i}
                onClick={() => {
                  setI(n);
                  setPaused(true);
                }}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  n === i ? "bg-ink text-white" : "bg-white/80 text-ink ring-1 ring-black/[0.08] hover:bg-white"
                }`}
              >
                {s.tab}
              </button>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <BrowserFrame domain={current.domain}>
            <div className="relative">
              {sites.map((s, n) => (
                <div
                  key={s.tab}
                  className={`transition-opacity duration-700 ${n === i ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
                >
                  <ScaledSite html={s.html} virtualWidth={1280} virtualHeight={820} title={`Example website for ${s.tab.toLowerCase()}`} />
                </div>
              ))}
            </div>
          </BrowserFrame>
        </div>
      </div>
    </div>
  );
}
