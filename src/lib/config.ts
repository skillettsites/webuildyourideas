export const SITE_NAME = "We Build Your Ideas";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://webuildyourideas.com").replace(/\/$/, "");
export const CONTACT_EMAIL = "hello@webuildyourideas.com";
// Set NEXT_PUBLIC_TIKTOK_URL once the account exists; TikTok links stay hidden until then.
export const TIKTOK_URL = (process.env.NEXT_PUBLIC_TIKTOK_URL || "").trim();

export const CATEGORIES = [
  { id: "website", label: "Website" },
  { id: "app", label: "App" },
  { id: "tool", label: "Tool" },
  { id: "business", label: "Business" },
  { id: "community", label: "Community" },
  { id: "other", label: "Something else" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "Idea";
}

export const LIMITS = {
  titleMin: 4,
  titleMax: 80,
  descriptionMin: 20,
  descriptionMax: 1200,
  nameMax: 40,
  freeEdits: 3,
  // An idea page is indexed once it has this many votes, or once it wins.
  indexVotes: 3,
};
