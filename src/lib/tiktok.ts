// Turns the top comments from a TikTok video into ideas on this week's board.
// One comment per line: "likes, @handle, comment text" (commas, tabs or pipes all work).
export function parseTikTokLines(text: string) {
  const out: { likes: number; handle: string; comment: string }[] = [];
  const errors: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([\d.,]+\s*[kKmM]?)\s*[,|\t]\s*@?([A-Za-z0-9._]{1,40})\s*[,|\t]\s*(.+)$/);
    if (!m) {
      errors.push(line.slice(0, 60));
      continue;
    }
    const n = m[1].replace(/\s/g, "").toLowerCase();
    const mult = n.endsWith("k") ? 1000 : n.endsWith("m") ? 1_000_000 : 1;
    const likes = Math.round(parseFloat(n.replace(/[km]$/, "").replace(/,/g, "")) * mult);
    out.push({ likes: Number.isFinite(likes) ? likes : 0, handle: m[2], comment: m[3].trim() });
  }
  return { rows: out, errors };
}

export function titleFrom(comment: string): string {
  const t = comment.replace(/\s+/g, " ").replace(/^["“']|["”']$/g, "").trim();
  const first = t.split(/(?<=[.!?])\s/)[0];
  const base = first.length >= 3 ? first : t;
  const clipped = base.length > 78 ? `${base.slice(0, 77).replace(/\s+\S*$/, "")}…` : base;
  return clipped.charAt(0).toUpperCase() + clipped.slice(1).replace(/[.!]+$/, "");
}


// True when a description only repeats its title (common for short TikTok comments).
export function sameText(a: string, b: string): boolean {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return n(a) === n(b);
}
