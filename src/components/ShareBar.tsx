"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator !== "undefined" && "share" in navigator), []);

  const text = `Vote for my idea: ${title}`;
  const enc = encodeURIComponent;
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { name: "Email", href: `mailto:?subject=${enc(text)}&body=${enc(`I shared an idea on We Build Your Ideas. If it gets the most votes this week, it gets built. Could you vote for it?\n\n${url}`)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track("share", { method: "copy" });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
      track("share", { method: "native" });
    } catch {}
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="field flex min-w-0 flex-1 items-center !py-2.5 !text-[15px] text-mute">
          <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
        </div>
        <button type="button" onClick={copy} className="btn btn-dark btn-sm !px-5 shrink-0">
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {canShare && (
          <button type="button" onClick={nativeShare} className="rounded-full bg-blue px-4 py-2 text-[14px] font-medium text-white">
            Share…
          </button>
        )}
        {links.map((l) => (
          <a
            key={l.name}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("share", { method: l.name })}
            className="rounded-full bg-cloud px-4 py-2 text-[14px] font-medium text-ink transition-colors hover:bg-[#e8e8ed]"
          >
            {l.name}
          </a>
        ))}
      </div>
    </div>
  );
}

export function NewIdeaBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") {
      setShow(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  if (!show) return null;
  return (
    <div className="rise mb-8 flex items-start gap-4 rounded-[22px] bg-green-soft p-5" role="status">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#30d158] text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true">
          <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-ink">Your idea is live.</p>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-2">
          Ideas win when people share them. Send the link below to friends, groups and anyone your idea would help. We’ve emailed you a copy too.
        </p>
      </div>
    </div>
  );
}
