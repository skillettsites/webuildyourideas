import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config";
import { emailConfigured, sendDigest, sendWinner } from "@/lib/email";
import { roundNumber } from "@/lib/rounds";
import { cronAuthorised } from "@/lib/security";
import { sbRpc, sbSelect } from "@/lib/supabase";
import { notifyOwner } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Pending = {
  round_end: string;
  winner_id: string | null;
  winner_slug: string | null;
  winner_title: string | null;
  winner_votes: number | null;
  winner_email: string | null;
  winner_name: string | null;
  idea_count: number;
  vote_count: number;
  notified_at: string | null;
  digest_sent_at: string | null;
};

// Runs just after voting closes on Sunday (both 19:05 and 20:05 UTC, so it lands after 20:00
// UK time whether or not the clocks have changed) and again on Monday morning as a safety net.
// Every step is idempotent: a round is only closed once and each email is only sent once.
export async function GET(req: Request) {
  if (!cronAuthorised(req.headers)) return NextResponse.json({ error: "unauthorised" }, { status: 401 });

  const closed = await sbRpc<{ closed_round: string }[]>("wbyi_close_rounds", {});
  const pending = (await sbRpc<Pending[]>("wbyi_pending_rounds", {})) ?? [];
  const report: Record<string, unknown>[] = [];

  for (const r of pending) {
    const round = roundNumber(r.round_end);
    const item: Record<string, unknown> = { round, winner: r.winner_title };

    if (!r.notified_at) {
      let winnerEmail = "none";
      if (r.winner_id && r.winner_email && r.winner_slug && r.winner_title) {
        const sent = await sendWinner({ to: r.winner_email, name: r.winner_name, title: r.winner_title, slug: r.winner_slug, round, votes: r.winner_votes ?? 0 });
        winnerEmail = sent.sent ? "sent" : `not sent (${sent.reason})`;
      }
      const told = await notifyOwner(
        r.winner_id
          ? [
              `🏆 Round ${round} closed`,
              `Winner: ${r.winner_title} (${r.winner_votes} votes)`,
              r.winner_email ? `By ${r.winner_name || "Anonymous"} · ${r.winner_email}` : `From TikTok: ${r.winner_name}. Message them on TikTok to plan the build.`,
              `${r.idea_count} ideas, ${r.vote_count} votes in total`,
              `Winner email: ${winnerEmail}`,
            ]
          : [`Round ${round} closed with no winner (${r.idea_count} ideas, ${r.vote_count} votes).`],
        r.winner_slug ? [{ text: "Winning idea", url: `${SITE_URL}/ideas/${r.winner_slug}` }, { text: "Admin", url: `${SITE_URL}/admin` }] : [],
      );
      if (told || winnerEmail === "sent") {
        await sbRpc("wbyi_mark_round", { p_round_end: r.round_end, p_field: "notified" });
      }
      item.notified = told;
      item.winnerEmail = winnerEmail;
    }

    if (!r.digest_sent_at) {
      const stale = Date.now() - new Date(r.round_end).getTime() > 3 * 24 * 3600 * 1000;
      if (emailConfigured()) {
        const recipients = (await sbRpc<{ email: string; token: string }[]>("wbyi_digest_recipients", {})) ?? [];
        const top = await sbSelect<{ title: string; slug: string; score: number }>(
          "wbyi_ideas",
          `select=title,slug,score&round_end=eq.${encodeURIComponent(new Date(r.round_end).toISOString())}&status=in.(open,winner,building,built)&order=score.desc,created_at.asc&limit=5`,
        );
        let sent = 0;
        for (const rec of recipients.slice(0, 2000)) {
          const res = await sendDigest({
            to: rec.email,
            token: rec.token,
            round,
            winner: r.winner_slug && r.winner_title ? { title: r.winner_title, slug: r.winner_slug, votes: r.winner_votes ?? 0 } : null,
            top: top.map((t) => ({ title: t.title, slug: t.slug, votes: t.score })),
          });
          if (res.sent) sent++;
          await new Promise((ok) => setTimeout(ok, 550)); // stay under Resend's rate limit
        }
        await sbRpc("wbyi_mark_round", { p_round_end: r.round_end, p_field: "digest" });
        item.digest = `${sent}/${recipients.length}`;
      } else if (stale) {
        await sbRpc("wbyi_mark_round", { p_round_end: r.round_end, p_field: "digest" });
        item.digest = "skipped (email not configured)";
      }
    }
    report.push(item);
  }

  const purged = await sbRpc<Record<string, number>>("wbyi_purge_old", {}).catch(() => null);

  if ((closed ?? []).length || pending.length) {
    for (const path of ["/", "/ideas", "/ideas/past", "/built"]) revalidatePath(path);
    for (const r of pending) if (r.winner_slug) revalidatePath(`/ideas/${r.winner_slug}`);
  }
  return NextResponse.json({ ok: true, closed: (closed ?? []).length, report, purged });
}
