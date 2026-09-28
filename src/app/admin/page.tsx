import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { categoryLabel } from "@/lib/config";
import { formatLondon, roundNumber } from "@/lib/rounds";
import { ADMIN_COOKIE, adminConfigured, isAdminSession } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

type AdminIdea = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  author_name: string | null;
  round_end: string;
  status: string;
  vote_count: number;
  built_url: string | null;
  built_summary: string | null;
  created_at: string;
  email: string | null;
};

type Overview = {
  leads: { id: string; kind: string; name: string | null; email: string; message: string | null; preview_id: string | null; plan: string | null; domain: string | null; handled: boolean; created_at: string }[];
  previews: { id: string; name: string; layout: string; accent: string; edits_used: number; domain: string | null; email: string | null; plan: string | null; status: string; created_at: string }[];
  rounds: { round_end: string; winner_idea_id: string | null; idea_count: number; vote_count: number; notified_at: string | null; digest_sent_at: string | null }[];
  subscribers: number;
  votes_7d: number;
  previews_7d: number;
};

const when = (s: string) => formatLondon(s, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const authed = isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
  const { e } = await searchParams;

  if (!authed) {
    return (
      <div className="bg-cloud px-5 py-24">
        <form action="/api/admin/login" method="post" className="mx-auto max-w-[400px] rounded-[28px] bg-white p-8">
          <h1 className="title">Admin</h1>
          {!adminConfigured() && <p className="mt-2 text-[14px] text-orange">ADMIN_SECRET is not set.</p>}
          <label htmlFor="pw" className="field-label mt-6">
            Password
          </label>
          <input id="pw" name="password" type="password" className="field" autoComplete="current-password" required />
          {e && <p className="mt-2 text-[14px] text-[#b3261e]">That password isn’t right.</p>}
          <button type="submit" className="btn btn-primary mt-6 w-full">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  const [ideas, overview] = await Promise.all([
    sbRpc<AdminIdea[]>("wbyi_admin_ideas", { p_limit: 300 }).catch(() => [] as AdminIdea[]),
    sbRpc<Overview>("wbyi_admin_overview", {}).catch(() => null),
  ]);
  const openLeads = overview?.leads.filter((l) => !l.handled) ?? [];

  return (
    <div className="bg-cloud px-5 pb-24 pt-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-center justify-between">
          <h1 className="headline">Admin</h1>
          <form action="/api/admin/logout" method="post">
            <button className="btn btn-secondary btn-sm">Sign out</button>
          </form>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {[
            ["Ideas", ideas.length],
            ["Votes (7 days)", overview?.votes_7d ?? 0],
            ["Previews (7 days)", overview?.previews_7d ?? 0],
            ["Open requests", openLeads.length],
            ["Subscribers", overview?.subscribers ?? 0],
          ].map(([k, v]) => (
            <div key={String(k)} className="rounded-[22px] bg-white p-5">
              <p className="text-[13px] text-mute">{k}</p>
              <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em]">{v}</p>
            </div>
          ))}
        </div>

        <h2 id="requests" className="title mt-12">
          Requests and messages
        </h2>
        <div className="mt-4 space-y-2">
          {(overview?.leads ?? []).length === 0 && <p className="text-mute">None yet.</p>}
          {(overview?.leads ?? []).map((l) => (
            <div key={l.id} className={`rounded-[18px] bg-white p-4 ${l.handled ? "opacity-50" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[15px] font-semibold">
                  {l.kind === "go_live" ? `Go live: ${l.plan}` : "Message"} · {l.name || "No name"} ·{" "}
                  <a href={`mailto:${l.email}`} className="text-link">
                    {l.email}
                  </a>
                </p>
                <div className="flex items-center gap-3 text-[13px] text-mute">
                  {when(l.created_at)}
                  <form action="/api/admin/lead" method="post">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="handled" value={l.handled ? "0" : "1"} />
                    <button className="btn btn-secondary btn-sm !py-1">{l.handled ? "Reopen" : "Mark done"}</button>
                  </form>
                </div>
              </div>
              {(l.domain || l.preview_id) && (
                <p className="mt-1 text-[14px] text-mute">
                  {l.domain && <>Domain: {l.domain} · </>}
                  {l.preview_id && (
                    <Link href={`/start/${l.preview_id}`} className="text-link" target="_blank">
                      Open preview
                    </Link>
                  )}
                </p>
              )}
              {l.message && <p className="mt-2 whitespace-pre-line text-[14px] text-ink-2">{l.message}</p>}
            </div>
          ))}
        </div>

        <h2 id="ideas" className="title mt-12">
          Ideas
        </h2>
        <div className="mt-4 space-y-2">
          {ideas.map((i) => (
            <div key={i.id} className={`rounded-[18px] bg-white p-4 ${i.status === "hidden" || i.status === "removed" ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold">
                    <Link href={`/ideas/${i.slug}`} target="_blank" className="hover:underline">
                      {i.title}
                    </Link>{" "}
                    <span className="font-normal text-mute">
                      · {i.vote_count} votes · Round {roundNumber(i.round_end)} · {i.status}
                    </span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-[14px] text-mute">{i.description}</p>
                  <p className="mt-1 text-[13px] text-mute-2">
                    {categoryLabel(i.category)} · {i.author_name || "Anonymous"} · {i.email} · {when(i.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["hidden", "Hide"],
                    ["open", "Open"],
                    ["winner", "Winner"],
                    ["building", "Building"],
                  ]
                    .filter(([s]) => s !== i.status)
                    .map(([s, label]) => (
                      <form key={s} action="/api/admin/idea" method="post">
                        <input type="hidden" name="id" value={i.id} />
                        <input type="hidden" name="slug" value={i.slug} />
                        <input type="hidden" name="status" value={s} />
                        <button className="btn btn-secondary btn-sm !py-1">{label}</button>
                      </form>
                    ))}
                </div>
              </div>
              {["winner", "building", "built"].includes(i.status) && (
                <form action="/api/admin/idea" method="post" className="mt-3 grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="slug" value={i.slug} />
                  <input type="hidden" name="status" value="built" />
                  <input name="built_url" defaultValue={i.built_url ?? ""} placeholder="https://live-site-url" className="field !py-2 !text-[14px]" />
                  <input name="built_summary" defaultValue={i.built_summary ?? ""} placeholder="One-line summary of what we built" className="field !py-2 !text-[14px]" />
                  <button className="btn btn-primary btn-sm">Mark built</button>
                </form>
              )}
            </div>
          ))}
        </div>

        <h2 className="title mt-12">Recent previews</h2>
        <div className="mt-4 overflow-x-auto rounded-[18px] bg-white">
          <table className="w-full text-left text-[14px]">
            <thead className="text-mute">
              <tr className="border-b hairline">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Style</th>
                <th className="p-3 font-medium">Edits</th>
                <th className="p-3 font-medium">Domain</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.previews ?? []).map((p) => (
                <tr key={p.id} className="border-b hairline last:border-0">
                  <td className="p-3">
                    <Link href={`/start/${p.id}`} target="_blank" className="text-link">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-3 text-mute">
                    {p.layout} / {p.accent}
                  </td>
                  <td className="p-3 text-mute">{p.edits_used}</td>
                  <td className="p-3 text-mute">{p.domain ?? ""}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3 text-mute">{when(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="title mt-12">Rounds</h2>
        <div className="mt-4 space-y-2">
          {(overview?.rounds ?? []).length === 0 && <p className="text-mute">No rounds closed yet.</p>}
          {(overview?.rounds ?? []).map((r) => (
            <p key={r.round_end} className="rounded-[18px] bg-white p-4 text-[14px]">
              Round {roundNumber(r.round_end)} · {r.idea_count} ideas · {r.vote_count} votes · notified {r.notified_at ? when(r.notified_at) : "no"} · digest{" "}
              {r.digest_sent_at ? when(r.digest_sent_at) : "no"}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
