// Light automatic checks on public submissions. Anything that slips through can be hidden
// from the admin screen or the one-tap link in the Telegram alert.

const BLOCKED = [
  "fuck", "shit", "cunt", "nigger", "nigga", "faggot", "retard", "wank", "bollocks", "twat", "whore", "slut",
  "porn", "xxx", "onlyfans", "escort", "viagra", "cialis", "casino", "betting tips", "forex signals", "crypto pump",
  "airdrop", "seo services", "backlinks", "loan offer", "kill yourself", "kys",
];

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|co\.uk|net|org|io|app|xyz|ru|cn|info|biz|me|ly)\b\/?)/i;

export function checkIdeaText(title: string, description: string): string | null {
  const text = `${title} ${description}`.toLowerCase();
  if (LINK.test(text)) return "Please leave links out. Describe the idea in your own words.";
  if (BLOCKED.some((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(text))) {
    return "That doesn’t look like something we can post. Please keep it friendly.";
  }
  const letters = title.replace(/[^a-z]/gi, "");
  if (letters.length >= 8 && letters === letters.toUpperCase()) return "Please don’t write the title in capitals.";
  if (/(.)\1{5,}/.test(text)) return "Please check the text and try again.";
  return null;
}

export function cleanText(s: unknown, max: number): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function validEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 200;
}
