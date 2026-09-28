@AGENTS.md

# We Build Your Ideas (webuildyourideas.com)

Two products on one site:

1. **The weekly build (free).** Anyone shares an idea, everyone votes, and every Sunday at 20:00 UK time the idea with the most votes (at least one) wins and gets built free. This is the growth engine: every idea is a shareable page with its own OG image.
2. **Your own website (paid).** Describe a business, get an instant preview from our own template engine (no model calls, zero variable cost), pick a style and domain, then "Make it live" on a monthly plan (£12 / £25 / £50 / £100).

Rebuilt from scratch on 28 Sep 2026. The earlier Grok-built demo (in-memory store, never persisted in production) is kept at `C:\Users\daves\claude\webuildyourideas-v0` for reference, and its spec is in `docs/`.

## Stack
Next.js 16 App Router, TypeScript strict, Tailwind v4 with hand-written design-system classes in `src/app/globals.css`, Vercel (team `skillettsites-projects`, project `webuildyourideas`), Supabase shared project `noxczmrnyyosgvvjlqca` with `wbyi_` tables, Resend, Telegram alerts, Stripe (code ready, not configured).

## Commands
- `npm run dev` / `npx next build` / `npx next start -p 3100`
- Local secrets live in `.env.local` (gitignored). Never commit them.

## Design system (Apple-style)
- Tokens in `@theme` (ink `#1d1d1f`, mute `#6e6e73`, cloud `#f5f5f7`, blue `#0071e3`). Font: system SF on Apple devices, Inter elsewhere.
- Custom classes (`.btn`, `.field`, `.tile`, `.display`, `.headline`, `.lede`, `.segmented`, `.reveal`) live in `@layer components` so Tailwind utilities can override them. **Keep them in that layer**: unlayered CSS beats every utility (a `.btn` outside the layer broke `hidden sm:inline-flex` on 28 Sep).
- Motion: `.rise` for above-the-fold, `.reveal` + `RevealObserver` for scroll. Hidden state only applies when `<html>` has the `js` class. `prefers-reduced-motion` turns it all off.
- No em dashes anywhere. UK English. Curly apostrophes in copy.

## Data model (Supabase, all RLS on)
- `wbyi_ideas` (public read for open/winner/building/built), `wbyi_idea_private` (email, ip_hash, manage_token), `wbyi_votes` (idea_id + voter_id cookie, ip_hash), `wbyi_rounds` (closed rounds + winner), `wbyi_previews`, `wbyi_leads` (go-live requests + contact), `wbyi_subscribers`, `wbyi_lookups` (RDAP rate limit), `wbyi_secrets`.
- **Every write goes through a SECURITY DEFINER function that checks `WBYI_SERVER_KEY`** (stored as `wbyi_secrets.server`). The site only has the anon key. Never add the shared service-role key.
- Migrations: `supabase/migrations/001_wbyi_init.sql`, `002_wbyi_retention.sql`. Apply with the Management API (see global CLAUDE.md).
- Round maths: `wbyi_round_end()` in SQL is the source of truth; `src/lib/rounds.ts` mirrors it. Round 1 closes Sun 4 Oct 2026 19:00 UTC.

## Key flows
- Submit: `/ideas/submit` -> `POST /api/ideas` (honeypot, 2.5 s time trap, link/profanity filter, 3 per IP per day, 3 per email per round) -> confirmation email with private manage link, Telegram alert with one-tap Hide link (`/api/admin/moderate`, HMAC signed).
- Vote: `POST /api/ideas/[id]/vote` toggles; voter cookie `wbyi_vid`; max 5 votes per idea per IP hash, 60 per IP per hour. `GET /api/votes?ids=` returns the voter's votes and fresh counts (pages are ISR cached).
- Weekly cron `/api/cron/weekly` (Sun 19:05 + 20:05 UTC, Mon 08:00 UTC; idempotent): closes rounds, picks winner, emails winner, Telegram to Dave, Monday digest to subscribers, purges stale previews.
- Preview: `/start` -> `POST /api/start` -> `/start/[id]` (PreviewStudio). Style changes free; 3 free word edits (DB enforced); RDAP domain check (Verisign .com, Nominet .co.uk; 404 = free). "Make it live" -> `POST /api/go-live` records a lead, then Stripe Checkout if `STRIPE_SECRET_KEY` is set, otherwise email + Telegram and a person follows up.
- Admin: `/admin` (password = `ADMIN_SECRET`): hide/open/winner/building/built + live URL, requests, previews, rounds.

## Template engine
`src/lib/site/content.ts` parses a description (brand, place, category from 17 profiles, services, contact) and `render.ts` renders one of five layouts (classic, bold, studio, minimal, event) in seven accents as a self-contained HTML string shown in a fully sandboxed iframe. Runs on server and client.

## Env vars (Vercel production)
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `WBYI_SERVER_KEY`, `IP_HASH_SALT`, `ADMIN_SECRET`, `CRON_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `RESEND_API_KEY`, `FROM_EMAIL`, `REPLY_TO` (optional), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID`, and later `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (webhook URL `/api/stripe/webhook`, event `checkout.session.completed`, sessions carry `metadata.site = webuildyourideas`).

## Commit identity and deploy
Always `git -c user.name="skillettsites" -c user.email="davidskillett@hotmail.co.uk" commit ...`. Production branch `master`. Push to deploy.
