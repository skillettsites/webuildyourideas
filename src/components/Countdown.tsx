"use client";

import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

// Live countdown to the close of voting. Renders a static label on the server so there is
// no layout shift, then ticks once hydrated.
export function Countdown({ to, variant = "inline" }: { to: string; variant?: "inline" | "blocks" }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const p = parts(target - (now ?? target - 1));
  const ended = now !== null && now >= target;

  if (variant === "blocks") {
    const cells = [
      { v: p.d, l: "days" },
      { v: p.h, l: "hours" },
      { v: p.m, l: "mins" },
      { v: p.s, l: "secs" },
    ];
    return (
      <div className="flex gap-2" role="timer" aria-label={ended ? "Voting has closed" : "Time left to vote"}>
        {cells.map((c) => (
          <div key={c.l} className="min-w-[64px] rounded-2xl bg-white px-3 py-2.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="text-[26px] font-semibold tabular-nums tracking-[-0.03em] text-ink">
              {String(now === null ? 0 : c.v).padStart(2, "0")}
            </div>
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-mute">{c.l}</div>
          </div>
        ))}
      </div>
    );
  }

  if (now === null) return <span className="tabular-nums">soon</span>;
  if (ended) return <span>Voting has closed</span>;
  const text = p.d > 0 ? `${p.d}d ${p.h}h ${p.m}m` : p.h > 0 ? `${p.h}h ${p.m}m ${p.s}s` : `${p.m}m ${p.s}s`;
  return <span className="tabular-nums">{text}</span>;
}
