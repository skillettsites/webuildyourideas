import "server-only";
import { sbSelect } from "./supabase";
import { roundEndFor } from "./rounds";

export type Idea = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  author_name: string | null;
  round_end: string;
  status: "open" | "winner" | "building" | "built";
  vote_count: number;
  built_url: string | null;
  built_summary: string | null;
  built_at: string | null;
  created_at: string;
  source: "site" | "tiktok";
  tiktok_likes: number;
  tiktok_handle: string | null;
  tiktok_url: string | null;
  score: number;
};

export type Round = {
  round_end: string;
  winner_idea_id: string | null;
  idea_count: number;
  vote_count: number;
  closed_at: string;
};

const COLS =
  "id,slug,title,description,category,author_name,round_end,status,vote_count,built_url,built_summary,built_at,created_at,source,tiktok_likes,tiktok_handle,tiktok_url,score";
export const IDEAS_TAG = "ideas";

// Ranking uses score: site votes plus TikTok likes.
function byScore(a: Idea, b: Idea) {
  return b.score - a.score || a.created_at.localeCompare(b.created_at);
}

export async function getRoundIdeas(roundEnd: Date, revalidate = 30): Promise<Idea[]> {
  const rows = await sbSelect<Idea>(
    "wbyi_ideas",
    `select=${COLS}&round_end=eq.${encodeURIComponent(roundEnd.toISOString())}&order=score.desc,created_at.asc&limit=500`,
    { revalidate, tags: [IDEAS_TAG] },
  );
  return rows.sort(byScore);
}

export async function getCurrentRoundIdeas(revalidate = 30) {
  const end = roundEndFor();
  return { end, ideas: await getRoundIdeas(end, revalidate) };
}

export async function getIdeaBySlug(slug: string): Promise<Idea | null> {
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) return null;
  const rows = await sbSelect<Idea>("wbyi_ideas", `select=${COLS}&slug=eq.${slug}&limit=1`, {
    revalidate: 30,
    tags: [IDEAS_TAG],
  });
  return rows[0] ?? null;
}

export async function getWinners(): Promise<Idea[]> {
  return sbSelect<Idea>(
    "wbyi_ideas",
    `select=${COLS}&status=in.(winner,building,built)&order=round_end.desc&limit=100`,
    { revalidate: 300, tags: [IDEAS_TAG] },
  );
}

export async function getClosedRounds(): Promise<Round[]> {
  return sbSelect<Round>("wbyi_rounds", "select=round_end,winner_idea_id,idea_count,vote_count,closed_at&order=round_end.desc&limit=200", {
    revalidate: 300,
    tags: [IDEAS_TAG],
  });
}

export async function getIndexableIdeas(minVotes: number): Promise<Pick<Idea, "slug" | "created_at" | "built_at">[]> {
  return sbSelect<Pick<Idea, "slug" | "created_at" | "built_at">>(
    "wbyi_ideas",
    `select=slug,created_at,built_at&or=(score.gte.${minVotes},status.in.(winner,building,built))&order=created_at.desc&limit=5000`,
    { revalidate: 3600, tags: [IDEAS_TAG] },
  );
}

export function rankIn(ideas: Idea[], id: string): number {
  const i = ideas.findIndex((x) => x.id === id);
  return i === -1 ? 0 : i + 1;
}
