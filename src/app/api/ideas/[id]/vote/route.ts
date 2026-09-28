import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ipHash, isUuid, VOTER_COOKIE } from "@/lib/security";
import { sbRpc } from "@/lib/supabase";

type Result = { voted: boolean; votes: number; error: string | null }[];

const ERRORS: Record<string, string> = {
  closed: "Voting has closed for this idea.",
  not_found: "We couldn’t find that idea.",
  ip_limit: "Lots of votes are coming from your network for this idea, so we’ve paused them.",
  slow_down: "That’s a lot of votes in a short time. Please try again later.",
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return NextResponse.json({ ok: false, error: ERRORS.not_found }, { status: 404 });

  const jar = await cookies();
  let voter = jar.get(VOTER_COOKIE)?.value;
  const fresh = !isUuid(voter);
  if (!isUuid(voter)) voter = crypto.randomUUID();

  try {
    const rows = await sbRpc<Result>("wbyi_toggle_vote", { p_idea_id: id, p_voter_id: voter, p_ip_hash: ipHash(req.headers) });
    const r = rows?.[0];
    const res = NextResponse.json(
      { ok: !r?.error, voted: Boolean(r?.voted), votes: r?.votes ?? 0, error: r?.error ? ERRORS[r.error] ?? "That vote did not go through." : undefined },
      { status: r?.error ? (r.error === "not_found" ? 404 : 409) : 200 },
    );
    if (fresh) {
      res.cookies.set(VOTER_COOKIE, voter, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 400 });
    }
    return res;
  } catch (err) {
    console.error("vote failed", err);
    return NextResponse.json({ ok: false, error: "That vote did not go through. Please try again." }, { status: 500 });
  }
}
