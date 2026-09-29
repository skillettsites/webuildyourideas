import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { RequestStatusPill } from "@/components/account/RequestStatus";
import { allowancePercent, allowancePeriod, currentClientId, getClientHome, type RequestSummary } from "@/lib/clients";
import { PLAN_PERKS, planById } from "@/lib/plans";
import { formatLondon, timeAgo } from "@/lib/rounds";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

function RequestRow({ r }: { r: RequestSummary }) {
  const waiting = r.status === "needs_info";
  return (
    <Link
      href={`/account/requests/${r.id}`}
      className={`flex items-center gap-4 rounded-[20px] bg-white p-4 transition-shadow hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.22)] sm:p-5 ${waiting ? "ring-2 ring-[#ffb44d]" : ""}`}
    >
      <span className="w-10 shrink-0 text-[14px] font-semibold tabular-nums text-mute-2">#{r.ref}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[17px] font-semibold tracking-[-0.02em] text-ink">{r.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-mute">
          <RequestStatusPill status={r.status} />
          <span suppressHydrationWarning>Updated {timeAgo(r.updated_at)}</span>
          {r.messages > 0 && <span>· {r.messages} {r.messages === 1 ? "message" : "messages"}</span>}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-mute-2" />
    </Link>
  );
}

export default async function AccountPage() {
  const clientId = await currentClientId();
  if (!clientId) redirect("/login");
  const home = await getClientHome(clientId);
  if (!home) redirect("/login?expired=1");

  const { client, sites, requests, updates } = home;
  const plan = planById(client.plan);
  const period = allowancePeriod(client.anchor_day);
  const pct = allowancePercent(client.plan, home.used_units);
  const open = requests.filter((r) => ["new", "in_progress", "needs_info"].includes(r.status));
  const closed = requests.filter((r) => !["new", "in_progress", "needs_info"].includes(r.status)).slice(0, 10);
  const needsYou = open.filter((r) => r.status === "needs_info").length;
  const firstName = client.name.split(" ")[0];

  return (
    <div className="bg-cloud px-5 pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-mute">{client.company || "Your account"}</p>
            <h1 className="display mt-1">Hi {firstName}.</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill bg-gradient-to-r from-[#0a84ff] via-[#7d4cdb] to-[#e3246b] font-semibold text-white">{plan?.name ?? client.plan} plan</span>
            <form action="/api/auth/logout" method="post">
              <button className="text-[14px] text-link hover:underline">Sign out</button>
            </form>
          </div>
        </div>

        {needsYou > 0 && (
          <div className="mt-6 rounded-[20px] bg-[#fff4e5] p-4 text-[15px] text-ink" role="status">
            <strong className="font-semibold">We need your input</strong> on {needsYou} {needsYou === 1 ? "request" : "requests"}. It’s highlighted below.
          </div>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-[28px] bg-white p-6 sm:p-8" aria-label="Your website">
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">{sites.length > 1 ? "Your websites" : "Your website"}</p>
            {sites.length === 0 && <p className="mt-3 text-mute">Your website will appear here once it’s set up.</p>}
            {sites.map((s) => (
              <div key={s.id} className="mt-4 first:mt-3">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-[#1d1d1f] to-[#48484a] text-[22px] font-bold text-white">
                    {s.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-[24px] font-bold tracking-[-0.03em] text-ink">{s.name}</h2>
                    <p className="mt-0.5 flex items-center gap-2 text-[14px] text-mute">
                      <span className={`h-2 w-2 rounded-full ${s.status === "live" ? "bg-[#30d158]" : "bg-[#ff9f0a]"}`} aria-hidden="true" />
                      {s.status === "live" ? "Live" : s.status === "building" ? "Being built" : "Paused"}
                      {s.url && (
                        <>
                          <span>·</span>
                          <a href={s.url} target="_blank" rel="noopener" className="inline-flex items-center gap-0.5 truncate text-link hover:underline">
                            {s.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {updates[0] && (
              <p className="mt-5 border-t hairline pt-4 text-[14px] text-mute">
                Last change: <span className="text-ink-2">{updates[0].title}</span> · {formatLondon(updates[0].created_at, { day: "numeric", month: "short" })}
              </p>
            )}
            <Link href="/account/new" className="btn btn-primary mt-7 w-full sm:w-auto">
              Request a change
            </Link>
          </section>

          <section className="rounded-[28px] bg-white p-6 sm:p-8" aria-label="This month">
            <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mute">This month</p>
            <p className="mt-3 text-[44px] font-bold leading-none tracking-[-0.04em] text-ink">{pct}%</p>
            <p className="mt-1 text-[15px] text-mute">of your change allowance used</p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-cloud" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Allowance used">
              <div className="h-full rounded-full bg-gradient-to-r from-[#0a84ff] to-[#7d4cdb]" style={{ width: `${Math.max(pct, 2)}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-mute">Resets on {formatLondon(period.end, { day: "numeric", month: "long" })}.</p>
            <ul className="mt-5 space-y-2 border-t hairline pt-5">
              {(PLAN_PERKS[client.plan] ?? []).map((perk) => (
                <li key={perk} className="flex gap-2.5 text-[14px] leading-snug text-ink-2">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-green" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                    <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-12" aria-labelledby="open-requests">
          <div className="flex items-end justify-between gap-4">
            <h2 id="open-requests" className="title">
              Open requests
            </h2>
            <Link href="/account/new" className="link-more !text-[15px]">
              New request <ChevronRight strokeWidth={2.4} />
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {open.length === 0 ? (
              <div className="rounded-[20px] bg-white px-6 py-10 text-center">
                <p className="text-[17px] font-semibold text-ink">Nothing open right now.</p>
                <p className="mx-auto mt-1 max-w-sm text-[15px] text-mute">Need something changed, added or fixed? Send a request with a screenshot and we’ll take it from there.</p>
                <Link href="/account/new" className="btn btn-primary btn-sm mt-5">
                  Request a change
                </Link>
              </div>
            ) : (
              open.map((r) => <RequestRow key={r.id} r={r} />)
            )}
          </div>
        </section>

        {closed.length > 0 && (
          <section className="mt-10" aria-labelledby="done-requests">
            <h2 id="done-requests" className="title">
              Completed
            </h2>
            <div className="mt-4 space-y-2.5">
              {closed.map((r) => (
                <RequestRow key={r.id} r={r} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 grid gap-4 lg:grid-cols-[1.35fr_1fr]" aria-labelledby="updates">
          <div className="rounded-[28px] bg-white p-6 sm:p-8">
            <h2 id="updates" className="title">
              Recent updates
            </h2>
            {updates.length === 0 ? (
              <p className="mt-3 text-[15px] text-mute">Changes we make to your site will be listed here.</p>
            ) : (
              <ol className="mt-5 space-y-5 border-l-2 border-hair pl-5">
                {updates.map((u) => (
                  <li key={u.id} className="relative">
                    <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#30d158]" aria-hidden="true" />
                    <p className="text-[13px] text-mute">{formatLondon(u.created_at, { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="mt-0.5 text-[16px] font-semibold leading-snug tracking-[-0.015em] text-ink">{u.title}</p>
                    {u.body && <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-mute">{u.body}</p>}
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="rounded-[28px] bg-ink p-6 text-white sm:p-8">
            <h2 className="text-[21px] font-semibold tracking-[-0.025em]">How it works</h2>
            <ol className="mt-4 space-y-4 text-[15px] leading-relaxed text-white/80">
              <li>
                <strong className="block text-white">1. Send a request</strong>Say what you need in plain English and add screenshots, photos or files.
              </li>
              <li>
                <strong className="block text-white">2. We get on it</strong>
                {client.plan === "priority" ? "You’re on Priority, so your requests go first. " : ""}We reply here and by email if we have a question.
              </li>
              <li>
                <strong className="block text-white">3. It goes live</strong>You’ll get an email, and it appears under Recent updates.
              </li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
