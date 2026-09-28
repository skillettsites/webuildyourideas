import type { MetadataRoute } from "next";
import { LIMITS, SITE_URL } from "@/lib/config";
import { getClosedRounds, getIndexableIdeas } from "@/lib/ideas";
import { roundNumber } from "@/lib/rounds";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/ideas`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/ideas/submit`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/start`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/built`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/ideas/past`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/rules`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
  const [ideas, rounds] = await Promise.all([getIndexableIdeas(LIMITS.indexVotes), getClosedRounds()]);
  return [
    ...staticPages,
    ...rounds.map((r) => ({ url: `${SITE_URL}/ideas/round/${roundNumber(r.round_end)}`, lastModified: new Date(r.closed_at), changeFrequency: "yearly" as const, priority: 0.4 })),
    ...ideas.map((i) => ({ url: `${SITE_URL}/ideas/${i.slug}`, lastModified: new Date(i.built_at ?? i.created_at), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
