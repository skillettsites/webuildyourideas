import "server-only";
import { Resend } from "resend";
import { SITE_URL } from "./config";

function env(name: string): string {
  return (process.env[name] || "").replace(/\\n$/, "").trim();
}

export function emailConfigured(): boolean {
  return Boolean(env("RESEND_API_KEY") && env("FROM_EMAIL"));
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

// One restrained layout for every email: white card, system font, one blue button.
function layout(opts: { preheader: string; heading: string; body: string; cta?: { text: string; url: string }; footer?: string }): string {
  const button = opts.cta
    ? `<tr><td style="padding:8px 0 4px"><a href="${esc(opts.cta.url)}" style="display:inline-block;background:#0071e3;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:13px 24px;border-radius:980px">${esc(opts.cta.text)}</a></td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f5f5f7">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:22px;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1d1d1f">
<tr><td style="padding-bottom:22px"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#0a84ff,#7d4cdb,#e3246b);background-color:#5e5ce6;color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:26px">&#x2191;</td><td style="padding-left:10px;font-size:15px;font-weight:600;letter-spacing:-.01em">We Build Your Ideas</td></tr></table></td></tr>
<tr><td style="font-size:28px;line-height:1.15;font-weight:700;letter-spacing:-.02em;padding-bottom:14px">${esc(opts.heading)}</td></tr>
<tr><td style="font-size:16px;line-height:1.55;color:#424245;padding-bottom:18px">${opts.body}</td></tr>
${button}
<tr><td style="font-size:13px;line-height:1.5;color:#86868b;padding-top:28px;border-top:1px solid #e8e8ed;margin-top:24px">${opts.footer ?? `Sent by We Build Your Ideas · <a href="${SITE_URL}" style="color:#86868b">webuildyourideas.com</a>`}</td></tr>
</table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, headers?: Record<string, string>): Promise<{ sent: boolean; id?: string; reason?: string }> {
  if (!emailConfigured()) return { sent: false, reason: "email not configured" };
  try {
    const resend = new Resend(env("RESEND_API_KEY"));
    const res = await resend.emails.send({ from: env("FROM_EMAIL"), to, subject, html, replyTo: env("REPLY_TO") || undefined, headers });
    if (res.error) {
      console.error("resend error", res.error);
      return { sent: false, reason: res.error.message };
    }
    return { sent: true, id: res.data?.id };
  } catch (err) {
    console.error("resend threw", err);
    return { sent: false, reason: "send failed" };
  }
}

const p = (s: string) => `<p style="margin:0 0 14px">${s}</p>`;

export function sendIdeaSubmitted(args: { to: string; name: string | null; title: string; slug: string; token: string; closes: string }) {
  const url = `${SITE_URL}/ideas/${args.slug}`;
  const manage = `${SITE_URL}/ideas/manage/${args.token}`;
  const body = [
    p(`Hi ${esc(args.name || "there")},`),
    p(`<strong>${esc(args.title)}</strong> is live on this week’s board. Voting closes ${esc(args.closes)} at 8pm UK time, and the idea with the most votes gets built, free.`),
    p("The ideas that win are the ones people share. Send the link to friends, post it in a group chat, or share it anywhere your idea would help people."),
    p(`<a href="${url}" style="color:#0066cc">${url}</a>`),
  ].join("");
  return send(
    args.to,
    `Your idea is live: ${args.title}`,
    layout({
      preheader: "Share it to collect votes before Sunday at 8pm.",
      heading: "Your idea is live.",
      body,
      cta: { text: "View and share your idea", url },
      footer: `Changed your mind? <a href="${manage}" style="color:#86868b">Remove your idea</a>. Only you have this link, so keep this email.`,
    }),
  );
}

export function sendWinner(args: { to: string; name: string | null; title: string; slug: string; round: number; votes: number }) {
  const url = `${SITE_URL}/ideas/${args.slug}`;
  const body = [
    p(`Hi ${esc(args.name || "there")},`),
    p(`Great news. <strong>${esc(args.title)}</strong> won Round ${args.round} with ${args.votes} ${args.votes === 1 ? "vote" : "votes"}, which means we are going to build it for you, free.`),
    p(`Reply to this email, or send us a message at <a href="${SITE_URL}/contact" style="color:#0066cc">webuildyourideas.com/contact</a>, and tell us a little more: who it is for, anything you have already got (a name, a logo, some words), and the one thing it must do well. We will plan a first version with you, build it, and launch it.`),
    p("We will be in touch within two working days if we have not heard from you."),
  ].join("");
  return send(args.to, `You won Round ${args.round}! We’re building ${args.title}`, layout({ preheader: "Your idea got the most votes this week.", heading: "Your idea won.", body, cta: { text: "See the winning idea", url } }));
}

export function sendGoLiveReceived(args: { to: string; name: string; plan: string; domain: string; previewUrl: string | null }) {
  const body = [
    p(`Hi ${esc(args.name || "there")},`),
    p(`Thanks for choosing the <strong>${esc(args.plan)}</strong> plan${args.domain ? ` for <strong>${esc(args.domain)}</strong>` : ""}. A real person will look over your preview and email you within one working day to confirm the details and set up payment.`),
    p("Nothing is charged until you have agreed the details with us, and you can cancel any time."),
  ].join("");
  return send(
    args.to,
    "We’ve got your website request",
    layout({ preheader: "We will be in touch within one working day.", heading: "You’re in the queue.", body, cta: args.previewUrl ? { text: "View your preview", url: args.previewUrl } : undefined }),
  );
}

export function sendDigest(args: {
  to: string;
  token: string;
  round: number;
  winner: { title: string; slug: string; votes: number } | null;
  top: { title: string; slug: string; votes: number }[];
}) {
  const unsub = `${SITE_URL}/unsubscribe?t=${args.token}`;
  const list = args.top
    .map((t, i) => `<tr><td style="padding:8px 0;border-top:1px solid #e8e8ed;font-size:15px"><span style="color:#86868b">${i + 1}.</span> <a href="${SITE_URL}/ideas/${t.slug}" style="color:#1d1d1f;text-decoration:none;font-weight:600">${esc(t.title)}</a> <span style="color:#86868b">· ${t.votes}</span></td></tr>`)
    .join("");
  const body = [
    args.winner
      ? p(`Round ${args.round} is closed. The winner, with ${args.winner.votes} ${args.winner.votes === 1 ? "vote" : "votes"}, is <strong>${esc(args.winner.title)}</strong>. We are building it this week.`)
      : p(`Round ${args.round} is closed. There was no clear winner this time, so every idea is still up for grabs.`),
    list ? `<p style="margin:18px 0 6px;font-weight:600">The top ideas</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${list}</table>` : "",
    p(`<br>Round ${args.round + 1} is open now. Got an idea? It only takes two minutes to share.`),
  ].join("");
  return send(
    args.to,
    args.winner ? `Round ${args.round} winner: ${args.winner.title}` : `Round ${args.round} results`,
    layout({
      preheader: "The weekly build results, and the new round.",
      heading: args.winner ? "This week’s winner." : "This week’s results.",
      body,
      cta: { text: "Submit an idea", url: `${SITE_URL}/ideas/submit` },
      footer: `You get this because you joined the weekly email. <a href="${unsub}" style="color:#86868b">Unsubscribe</a>.`,
    }),
    { "List-Unsubscribe": `<${unsub}>` },
  );
}
