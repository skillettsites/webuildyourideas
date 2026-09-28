"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LIMITS } from "@/lib/config";
import { PLANS, type PlanId } from "@/lib/plans";
import type { AccentId, LayoutId, SiteContent } from "@/lib/site/content";
import { ACCENTS, LAYOUTS, renderSite, suggestedDomain } from "@/lib/site/render";
import { track } from "@/lib/track";
import { BrowserFrame, PhoneFrame, ScaledSite } from "./DeviceFrames";

type Props = {
  id: string;
  initial: { content: SiteContent; layout: LayoutId; accent: AccentId; editsUsed: number; domain: string | null; status: string; email: string | null };
  stripeReady: boolean;
};

type DomainResult = { domain: string; status: "available" | "taken" | "unknown" };

export function PreviewStudio({ id, initial, stripeReady }: Props) {
  const [saved, setSaved] = useState(initial.content);
  const [draft, setDraft] = useState(initial.content);
  const [layout, setLayout] = useState(initial.layout);
  const [accent, setAccent] = useState(initial.accent);
  const [editsUsed, setEditsUsed] = useState(initial.editsUsed);
  const [domain, setDomain] = useState(initial.domain);
  const [status, setStatus] = useState(initial.status);
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [tab, setTab] = useState<"style" | "words" | "name">("style");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [sheet, setSheet] = useState(false);
  const [paid, setPaid] = useState(false);

  const locked = status !== "preview";
  const editsLeft = Math.max(0, LIMITS.freeEdits - editsUsed);
  const wordsLocked = locked || editsLeft === 0;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("paid") === "1") {
      setPaid(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const html = useMemo(() => renderSite({ content: draft, layout, accent }), [draft, layout, accent]);
  const shownDomain = domain || suggestedDomain(draft.brand);

  // Style changes are free: save them quietly in the background.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (locked) return;
    const t = setTimeout(() => {
      fetch(`/api/start/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ layout, accent }) }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [layout, accent, id, locked]);

  async function saveWords() {
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch(`/api/start/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: draft, layout, accent }),
      });
      const data = (await res.json()) as { ok?: boolean; editsUsed?: number; content?: SiteContent; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "We couldn’t save that. Please try again.");
      if (data.content) {
        setSaved(data.content);
        setDraft(data.content);
      }
      if (typeof data.editsUsed === "number") setEditsUsed(data.editsUsed);
      setNotice("Saved.");
      track("preview_edit_saved");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "We couldn’t save that.");
    } finally {
      setSaving(false);
    }
  }

  const set = (k: keyof SiteContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="pb-28 lg:pb-16">
      {/* Top bar */}
      <div className="border-b hairline bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-mute">Your website preview</p>
            <h1 className="truncate text-[21px] font-semibold tracking-[-0.025em] text-ink">{saved.brand}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="segmented" role="group" aria-label="Preview size">
              <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>
                Computer
              </button>
              <button type="button" aria-pressed={device === "phone"} onClick={() => setDevice("phone")}>
                Phone
              </button>
            </div>
            <button type="button" onClick={() => setSheet(true)} className="btn btn-primary btn-sm hidden sm:inline-flex" disabled={locked}>
              Make it live
            </button>
          </div>
        </div>
      </div>

      {(paid || locked) && (
        <div className="mx-auto mt-5 max-w-[1280px] px-5">
          <div className="rounded-[22px] bg-green-soft p-5 text-[15px] text-ink" role="status">
            <strong className="font-semibold">{paid ? "Payment received. Thank you!" : "Your request is in."}</strong>{" "}
            {paid
              ? "We’re setting up your website now and will email you as soon as it’s live."
              : "We’ll email you within one working day to confirm the details. Any changes can be made by email from here."}
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1280px] gap-6 px-5 pt-6 lg:grid-cols-[1fr_380px]">
        {/* Frame */}
        <div className="min-w-0">
          <div className="relative rounded-[28px] bg-cloud p-3 sm:p-6">
            <div className="pointer-events-none absolute left-5 top-5 z-10 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur sm:left-8 sm:top-8">
              Preview
            </div>
            {device === "desktop" ? (
              <BrowserFrame domain={shownDomain}>
                <ScaledSite html={html} virtualWidth={1280} virtualHeight={900} title={`Preview of ${saved.brand}`} interactive />
              </BrowserFrame>
            ) : (
              <div className="mx-auto w-full max-w-[330px]">
                <PhoneFrame>
                  <ScaledSite html={html} virtualWidth={390} virtualHeight={800} title={`Preview of ${saved.brand} on a phone`} interactive />
                </PhoneFrame>
              </div>
            )}
          </div>
          <p className="mt-3 px-2 text-[13px] text-mute">
            This is a live preview. Scroll inside it to see the whole page. Nothing is published until you choose a plan.
          </p>
        </div>

        {/* Panel */}
        <aside className="lg:sticky lg:top-[68px] lg:self-start">
          <div className="rounded-[28px] bg-cloud p-5">
            <div className="segmented w-full" role="tablist" aria-label="Edit your preview">
              {(["style", "words", "name"] as const).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={tab === t} aria-pressed={tab === t} onClick={() => setTab(t)} className="flex-1">
                  {t === "style" ? "Style" : t === "words" ? "Words" : "Domain"}
                </button>
              ))}
            </div>

            {tab === "style" && (
              <div className="mt-5">
                <p className="field-label">Layout</p>
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      disabled={locked}
                      onClick={() => setLayout(l.id)}
                      aria-pressed={layout === l.id}
                      className={`rounded-2xl px-3.5 py-3 text-left transition-all ${
                        layout === l.id ? "bg-white shadow-[0_0_0_2px_#0071e3]" : "bg-white/70 hover:bg-white"
                      }`}
                    >
                      <span className="block text-[15px] font-semibold text-ink">{l.name}</span>
                      <span className="block text-[12px] text-mute">{l.note}</span>
                    </button>
                  ))}
                </div>
                <p className="field-label mt-6">Colour</p>
                <div className="flex flex-wrap gap-3">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      disabled={locked}
                      onClick={() => setAccent(a.id)}
                      aria-label={a.name}
                      aria-pressed={accent === a.id}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${accent === a.id ? "ring-2 ring-offset-2 ring-offset-cloud" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${a.hex}, ${a.hex2})`, ["--tw-ring-color" as string]: a.hex }}
                    />
                  ))}
                </div>
                <p className="mt-6 text-[13px] leading-relaxed text-mute">Style changes are free and unlimited, and save automatically.</p>
              </div>
            )}

            {tab === "words" && (
              <div className="mt-5 space-y-4">
                <p className={`rounded-xl px-3 py-2 text-[13px] font-medium ${editsLeft ? "bg-white text-ink" : "bg-[#fff4e5] text-orange"}`}>
                  {locked
                    ? "Changes are now handled by our team."
                    : editsLeft
                      ? `${editsLeft} of ${LIMITS.freeEdits} free word edits left. Type to see changes live, then save.`
                      : "You’ve used your free edits. Make it live and we’ll make any changes you like."}
                </p>
                <Field label="Business name" value={draft.brand} onChange={set("brand")} disabled={wordsLocked} max={40} />
                <Field label="Headline" value={draft.tagline} onChange={set("tagline")} disabled={wordsLocked} max={90} />
                <Field label="Introduction" value={draft.intro} onChange={set("intro")} disabled={wordsLocked} max={220} area />
                <Field label="About" value={draft.about} onChange={set("about")} disabled={wordsLocked} max={700} area tall />
                <div>
                  <p className="field-label">Services or highlights</p>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        className="field !py-2.5 !text-[15px]"
                        value={draft.services[i] ?? ""}
                        disabled={wordsLocked}
                        maxLength={40}
                        placeholder={i === 3 ? "Optional fourth" : ""}
                        aria-label={`Service ${i + 1}`}
                        onChange={(e) =>
                          setDraft((d) => {
                            const s = [...d.services];
                            s[i] = e.target.value;
                            return { ...d, services: s.filter((x, n) => x || n < 3).slice(0, 4) };
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Button text" value={draft.cta} onChange={set("cta")} disabled={wordsLocked} max={30} />
                  <Field label="Town or area" value={draft.place} onChange={set("place")} disabled={wordsLocked} max={40} />
                </div>
                <Field label="Phone or email" value={draft.contact} onChange={set("contact")} disabled={wordsLocked} max={80} />
                <div className="flex items-center gap-3 pt-1">
                  <button type="button" onClick={saveWords} disabled={!dirty || saving || wordsLocked} className="btn btn-primary btn-sm">
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {dirty && !wordsLocked && (
                    <button type="button" onClick={() => setDraft(saved)} className="text-[14px] text-link hover:underline">
                      Undo
                    </button>
                  )}
                  {notice && <span className="text-[13px] text-mute">{notice}</span>}
                </div>
              </div>
            )}

            {tab === "name" && <DomainPanel id={id} brand={saved.brand} place={saved.place} current={domain} locked={locked} onPick={setDomain} />}
          </div>

          <div className="mt-4 hidden rounded-[28px] bg-ink p-6 text-white lg:block">
            <p className="text-[21px] font-semibold tracking-[-0.025em]">Like what you see?</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/70">
              We’ll register {shownDomain}, finish the site with you, and keep it running. From £12 a month, cancel any time.
            </p>
            <button type="button" onClick={() => setSheet(true)} className="btn btn-primary mt-5 w-full" disabled={locked}>
              {locked ? "Request received" : "Make it live"}
            </button>
          </div>
        </aside>
      </div>

      {/* Sticky mobile bar */}
      {!locked && (
        <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] px-5 py-3 lg:hidden">
          <div className="mx-auto flex max-w-[680px] items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink">{shownDomain}</p>
              <p className="text-[12px] text-mute">Live from £12 a month</p>
            </div>
            <button type="button" onClick={() => setSheet(true)} className="btn btn-primary btn-sm shrink-0">
              Make it live
            </button>
          </div>
        </div>
      )}

      {sheet && (
        <GoLiveSheet
          previewId={id}
          domain={domain}
          suggested={shownDomain}
          onClose={() => setSheet(false)}
          onDone={() => setStatus("requested")}
          initialEmail={initial.email ?? ""}
          stripeReady={stripeReady}
        />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  max,
  area = false,
  tall = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled: boolean;
  max: number;
  area?: boolean;
  tall?: boolean;
}) {
  const id = `f-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {area ? (
        <textarea id={id} className={`field !text-[15px] ${tall ? "min-h-[120px]" : "min-h-[80px]"} resize-y`} value={value} onChange={onChange} disabled={disabled} maxLength={max} />
      ) : (
        <input id={id} className="field !py-2.5 !text-[15px]" value={value} onChange={onChange} disabled={disabled} maxLength={max} />
      )}
    </div>
  );
}

function DomainPanel({ id, brand, place, current, locked, onPick }: { id: string; brand: string; place: string; current: string | null; locked: boolean; onPick: (d: string) => void }) {
  const [q, setQ] = useState(brand.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<DomainResult[] | null>(null);
  const [picking, setPicking] = useState("");

  async function check(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/domain-check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: q, place }) });
      const data = (await res.json()) as { ok?: boolean; results?: DomainResult[]; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "We couldn’t check that name.");
      setResults(data.results ?? []);
      track("domain_check");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t check that name.");
    } finally {
      setBusy(false);
    }
  }

  async function pick(d: string) {
    setPicking(d);
    const res = await fetch(`/api/start/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ domain: d }) });
    setPicking("");
    if (res.ok) onPick(d);
    else setError("We couldn’t save that name. Please try again.");
  }

  return (
    <div className="mt-5">
      {current && (
        <p className="mb-4 rounded-xl bg-white px-3 py-2 text-[14px] text-ink">
          Chosen: <strong className="font-semibold">{current}</strong>
        </p>
      )}
      <form onSubmit={check} className="flex gap-2">
        <label htmlFor="dq" className="sr-only">
          Name to check
        </label>
        <input id="dq" className="field !py-2.5 !text-[15px]" value={q} onChange={(e) => setQ(e.target.value)} maxLength={40} disabled={locked} placeholder="yourname" />
        <button type="submit" className="btn btn-dark btn-sm shrink-0" disabled={busy || locked || q.length < 2}>
          {busy ? "Checking…" : "Check"}
        </button>
      </form>
      {error && <p className="mt-3 text-[13px] text-[#b3261e]">{error}</p>}
      {results && (
        <ul className="mt-4 space-y-2">
          {results.map((r) => (
            <li key={r.domain} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
              <span className={`truncate text-[15px] ${r.status === "taken" ? "text-mute line-through" : "text-ink"}`}>{r.domain}</span>
              {r.status === "available" ? (
                current === r.domain ? (
                  <span className="text-[13px] font-semibold text-green">Chosen</span>
                ) : (
                  <button type="button" onClick={() => pick(r.domain)} disabled={locked || picking === r.domain} className="btn btn-primary btn-sm !px-3 !py-1 !text-[13px]">
                    {picking === r.domain ? "Saving…" : "Use this"}
                  </button>
                )
              ) : (
                <span className="text-[13px] text-mute">{r.status === "taken" ? "Taken" : "Couldn’t check"}</span>
              )}
            </li>
          ))}
          {results.length > 0 && results.every((r) => r.status !== "available") && (
            <li className="text-[13px] text-mute">All taken. Try adding your town or a word like “studio”.</li>
          )}
        </ul>
      )}
      <p className="mt-5 text-[13px] leading-relaxed text-mute">
        We check live with the registries. Names aren’t reserved until your website goes live, and a standard .com or .co.uk is included in every
        plan.
      </p>
    </div>
  );
}

function GoLiveSheet({
  previewId,
  domain,
  suggested,
  onClose,
  onDone,
  initialEmail,
  stripeReady,
}: {
  stripeReady: boolean;
  previewId: string;
  domain: string | null;
  suggested: string;
  onClose: () => void;
  onDone: () => void;
  initialEmail: string;
}) {
  const [plan, setPlan] = useState<PlanId>("starter");
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    dialog.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/go-live", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ previewId, email, name, plan, domain: domain || "", message }),
      });
      const data = (await res.json()) as { ok?: boolean; checkoutUrl?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      track("go_live_requested", { plan });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setDone(true);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="golive-title"
        onClick={(e) => e.stopPropagation()}
        className="rise max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-[28px] bg-white p-6 outline-none sm:rounded-[28px] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="golive-title" className="title">
            {done ? "You’re in the queue." : "Make it live."}
          </h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cloud text-ink" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {done ? (
          <div className="mt-4">
            <p className="text-[17px] leading-relaxed text-ink-2">
              Thanks! A real person will look over your preview and email <strong className="text-ink">{email}</strong> within one working day to
              confirm the details. Nothing is charged until you’ve agreed them with us.
            </p>
            <button type="button" onClick={onClose} className="btn btn-primary mt-7">
              Back to my preview
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-2">
            <p className="text-[15px] text-mute">
              {domain ? `Your site goes live on ${domain}.` : `Pick a web address in the preview, or we’ll help you choose one (for example ${suggested}).`}
            </p>
            <fieldset className="mt-6">
              <legend className="field-label">Choose a plan</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {PLANS.map((p) => (
                  <label
                    key={p.id}
                    className={`relative cursor-pointer rounded-2xl p-4 transition-all ${plan === p.id ? "bg-white shadow-[0_0_0_2px_#0071e3]" : "bg-cloud hover:bg-[#ececf0]"}`}
                  >
                    <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} className="sr-only" />
                    <span className="flex items-baseline justify-between">
                      <span className="text-[17px] font-semibold text-ink">{p.name}</span>
                      <span className="text-[15px] font-semibold text-ink">
                        £{p.price}
                        <span className="text-[13px] font-normal text-mute">/mo</span>
                      </span>
                    </span>
                    <span className="mt-1 block text-[13px] text-mute">{p.blurb}</span>
                  </label>
                ))}
              </div>
              <Link href="/pricing" target="_blank" className="mt-2 inline-block text-[13px] text-link hover:underline">
                Compare plans
              </Link>
            </fieldset>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="gl-name" className="field-label">
                  Your name
                </label>
                <input id="gl-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" required />
              </div>
              <div>
                <label htmlFor="gl-email" className="field-label">
                  Email
                </label>
                <input id="gl-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="gl-msg" className="field-label">
                Anything else? <span className="font-normal text-mute">(optional)</span>
              </label>
              <textarea
                id="gl-msg"
                className="field min-h-[90px] resize-y !text-[15px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                placeholder="Photos you have, pages you need, a logo, a deadline…"
              />
            </div>
            {error && (
              <p role="alert" className="mt-4 rounded-2xl bg-[#fff2f2] px-4 py-3 text-[15px] text-[#b3261e]">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-lg mt-6 w-full" disabled={busy}>
              {busy ? "Sending…" : stripeReady ? "Continue to secure payment" : "Request my website"}
            </button>
            <p className="mt-3 text-center text-[13px] text-mute">
              {stripeReady ? "Monthly subscription through Stripe. Cancel any time." : "No payment today. We confirm everything with you first. Cancel any time."}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
