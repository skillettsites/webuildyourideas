import { SITE_URL } from "@/lib/config";
import { PLANS } from "@/lib/plans";

export const revalidate = 86400;

export function GET() {
  const body = `# We Build Your Ideas

> A UK web studio with two ways to get an idea built. Anyone can share an idea for a website, web app or tool for free; the community votes all week, and every Sunday at 8pm UK time the idea with the most votes is designed, built and launched free of charge. Anyone who wants their own website without waiting can describe their business, see a free preview in seconds, and go live on their own .com or .co.uk from £12 a month.

## The weekly build (free)
- Share an idea: ${SITE_URL}/ideas/submit (free, up to three ideas per round, email kept private)
- Vote: ${SITE_URL}/ideas (one vote per person per idea, fraud checked)
- Ideas also come from comments on the We Build Your Ideas TikTok videos: the most-liked comments join the board and each TikTok like counts as one vote.
- Voting closes every Sunday at 8pm UK time. Round 1 closes on Sunday 4 October 2026.
- The idea with the highest score (votes on the site plus TikTok likes) wins.
- The winner gets a focused first version designed, built and launched free, with a .com or .co.uk domain and hosting covered for the first year, and owns the finished site. Any profits it makes are split 50% to the winner, 25% to We Build Your Ideas and 25% to charity.
- Rules: ${SITE_URL}/rules
- Past rounds: ${SITE_URL}/ideas/past
- Everything built so far: ${SITE_URL}/built

## Your own website (paid)
- Free instant preview, no sign-up: ${SITE_URL}/start
- Five layouts, seven colours, three free text edits, live .com and .co.uk availability check.
- Monthly plans (${SITE_URL}/pricing):
${PLANS.map((p) => `  - ${p.name}: £${p.price} a month. ${p.blurb} ${p.features.join("; ")}.`).join("\n")}
- Every plan includes a standard .com or .co.uk, hosting, SSL and design. No set-up fee. Cancel any time.

## Contact
- ${SITE_URL}/contact
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
