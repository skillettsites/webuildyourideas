import "server-only";

function env(name: string): string {
  return (process.env[name] || "").replace(/\\n$/, "").trim();
}

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

// Operator alerts (new ideas, go-live requests, weekly winner). Never throws.
export async function notifyOwner(lines: string[], links: { text: string; url: string }[] = []): Promise<boolean> {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chat = env("TELEGRAM_CHAT_ID");
  if (!token || !chat) return false;
  const body = [...lines.map(esc), ...links.map((l) => `<a href="${esc(l.url)}">${esc(l.text)}</a>`)].join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: body.slice(0, 3900), parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("telegram failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("telegram error", err);
    return false;
  }
}
