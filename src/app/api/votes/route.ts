import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isUuid, VOTER_COOKIE } from "@/lib/security";
import { sbRpc, sbSelect } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Which ideas this browser has voted for, plus fresh counts for the ideas on the page
// (pages themselves are cached for a few seconds).
export async function GET(req: Request) {
  const idsParam = new URL(req.url).searchParams.get("ids") || "";
  const ids = idsParam.split(",").filter(isUuid).slice(0, 100);
  const voter = (await cookies()).get(VOTER_COOKIE)?.value;

  const [mine, rows] = await Promise.all([
    isUuid(voter) ? sbRpc<{ voted_idea_id: string }[]>("wbyi_my_votes", { p_voter_id: voter }).catch(() => []) : Promise.resolve([]),
    ids.length ? sbSelect<{ id: string; vote_count: number }>("wbyi_ideas", `select=id,vote_count&id=in.(${ids.join(",")})`) : Promise.resolve([]),
  ]);
  return NextResponse.json(
    { ids: (mine ?? []).map((r) => r.voted_idea_id), counts: Object.fromEntries(rows.map((r) => [r.id, r.vote_count])) },
    { headers: { "cache-control": "no-store" } },
  );
}
