"use client";

import { useEffect, useRef, useState } from "react";

// Renders an HTML document at a fixed virtual width and scales it to fit its container.
// The iframe is fully sandboxed: no scripts, no forms, no navigation away.
export function ScaledSite({
  html,
  virtualWidth,
  virtualHeight,
  title,
  interactive = false,
  className = "",
}: {
  html: string;
  virtualWidth: number;
  virtualHeight: number;
  title: string;
  interactive?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / virtualWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [virtualWidth]);

  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ height: scale ? virtualHeight * scale : undefined, aspectRatio: scale ? undefined : `${virtualWidth} / ${virtualHeight}` }}>
      {scale > 0 && (
        <iframe
          title={title}
          srcDoc={html}
          sandbox=""
          loading="lazy"
          tabIndex={interactive ? 0 : -1}
          aria-hidden={interactive ? undefined : true}
          className={`absolute left-0 top-0 origin-top-left border-0 bg-white ${interactive ? "" : "pointer-events-none"}`}
          style={{ width: virtualWidth, height: virtualHeight, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}

export function BrowserFrame({ domain, children, dark = false }: { domain: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] sm:rounded-[18px] ${
        dark ? "bg-[#1c1c1e] ring-1 ring-white/10" : "bg-white ring-1 ring-black/[0.08]"
      } shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35),0_12px_30px_-18px_rgba(0,0,0,0.25)]`}
    >
      <div className={`flex h-9 items-center gap-3 px-3.5 sm:h-11 sm:px-4 ${dark ? "bg-[#2c2c2e]" : "bg-[#f6f6f8]"}`}>
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] sm:h-3 sm:w-3" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] sm:h-3 sm:w-3" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] sm:h-3 sm:w-3" />
        </div>
        <div className="flex flex-1 justify-center">
          <div
            className={`flex min-w-0 max-w-[340px] flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[11px] sm:text-[13px] ${
              dark ? "bg-[#3a3a3c] text-white/80" : "bg-white text-ink/70 ring-1 ring-black/[0.06]"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 opacity-60" fill="currentColor" aria-hidden="true">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
            </svg>
            <span className="truncate">{domain}</span>
          </div>
        </div>
        <div className="w-[42px] sm:w-[48px]" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}

export function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-[44px] bg-[#1d1d1f] p-[10px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 ${className}`}>
      <div className="relative overflow-hidden rounded-[34px] bg-white pt-[34px]">
        <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
