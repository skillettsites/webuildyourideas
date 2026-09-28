# We Build Your Ideas: Master Build Plan

Status: READY TO EXECUTE (all 5 chunks assembled).

Executor: Cursor CLI `agent -p --force --trust --workspace /workspace/webuildyourideas --model grok-4.7-high` only. No Grok Bot coding credits. No Cloud Agents. Deploy to Vercel when the full plan says so. Report only when deployed or blocked.

---

## CHUNK 1: VISION & CORE

webuildyourideas.com is the first instance of a reusable "idea-to-built-thing" platform.

### Core modules (all pluggable / swappable)

1. **Intake channels**: chat, voice via Whisper, email-in
2. **Asset checkers**: domain `.com` / `.co.uk` now, swappable later
3. **Mockup template engine**: handful of layouts designed once
4. **Build targets**: website first, swappable
5. **Subscription + usage-meter + cost-cap engine**: configurable per vertical

### Stack

- Next.js, TypeScript, Tailwind
- Vercel deploy
- AI: Grok 4.7 High via CLI for build work; runtime Grok API + Whisper for paid generation only
- Payments: Stripe
- Domains: registrar API + Cloudflare
- Mockups: own template engine: no Lovable / paid builder: zero variable cost on free tier

### Platform vs instance

- Shared package / modules = generic idea-to-built-thing core
- `webuildyourideas` = first configured vertical (website build target, domain checker, GBP tiers)
- Second vertical later = new config + templates + checker/target adapters, same meter engine

---

## CHUNK 2: INTAKE, NAME CHECK, MOCKUP FLOW

### Intake

- User brain-dumps via chat, voice-note (Whisper transcription), or email
- AI turns the dump into a structured brief

### Name check

- User enters desired name → check `.com` and `.co.uk` via registrar / RDAP
- If taken: suggest alternatives
- If available: offer to reserve (soft: no purchase on free)
- Free on free tier; **actual purchase only when paid**

### Mockup

- Template engine renders a sandboxed preview from brief + chosen name using one of a handful of pre-designed layouts
- Watermarked **PREVIEW** top and bottom
- Sticky upgrade prompt (especially mobile)
- 2–3 free tweaks, then locks
- Free tier: **nothing purchased**: no domain bought, no hosting spun up
- Paid conversion copy: "make this live, subscribe"

---


---

## CHUNK 3: SUBSCRIPTION TIERS, COST CAP, METER

### Tiers (£/month)

| Plan | Price | Hard build-cost cap |
| --- | ---: | ---: |
| Starter | £12 | £5 |
| Growth | £25 | £10 |
| Shipping | £50 | £20 |
| Priority | £100+ | £30 (keep ~70% margin) |

Stripe integration for checkout and recurring billing.

### Hard cost cap

- Never spend more than the tier cap on actual build cost for that user in the rolling period.
- Running counter per user logs every API call, every Whisper minute, every domain lookup against their account.
- The moment the next charge would cross the cap, generation stops.
- User message: "you've hit your build limit: upgrade or wait till next cycle."

### Usage meter (customer-facing)

- Percentage bar only: e.g. "you've used 60% of your monthly allowance"
- NEVER reveal the pound split between what they pay and the build cap

### Reset

- Rolling reset from the day they joined (signup anniversary), not calendar month

### Economics

- Target ~70% margin on subscription vs actual build cost
- Free tier has no build spend at all (no Grok, no Whisper, no domain purchase)


---

## CHUNK 4: PAID BUILD PIPELINE & DEPLOY

Once paid (Stripe confirmed):

1. Buy the chosen domain via registrar API (Cloudflare Registrar preferred)
2. Provision hosting for the customer site
3. Wire Cloudflare DNS (nameservers + records)
4. Deploy the built site to the customer domain via Cloudflare

### Product app (webuildyourideas) on Vercel

- Configure Next.js for Vercel (`vercel.json`, edge-ready where possible)
- Env-var placeholders for: Stripe keys, Grok API key, Whisper key, registrar API key, Cloudflare token
- Deploy the finished product app to Vercel and return the live URL

### Customer sites

- Each paid customer's built site deploys to their purchased domain through Cloudflare (not mixed into the product app zone)

### Secrets policy

- Leave TODOs / `.env.example` where credentials are required
- Do not invent keys; do not charge domains during free-tier paths


---

## CHUNK 5: DATA MODEL, ADMIN, MVP ORDER (FINAL)

### Data model

- **users**: id, email, signup_date, tier, rolling_reset_date
- **subscriptions**: stripe_id, tier, status
- **usage_counters**: user_id, api_calls_cost, whisper_minutes, domain_lookups, total_spend, cap
- **builds**: id, user_id, brief, name_chosen, status, preview_url, tweak_count
- **domains**: id, build_id, name, registrar, status, dns
- **previews**: id, build_id, layout, html, tweak_history

### Admin

- Per-user usage/cost dashboard
- Cap status
- Tier distribution

### MVP build order (execute in this sequence)

1. Scaffold Next.js + TypeScript + Tailwind + Vercel config
2. Data model + Supabase (schema/migrations; local mock ok if Supabase URL missing)
3. Intake (chat + voice + email)
4. Name checker (.com / .co.uk + alternatives)
5. Mockup template engine + sandboxed PREVIEW
6. Freemium gating + tweak limits (2–3 then lock)
7. Stripe tiers + cost-cap counter + % meter (never show £ split)
8. Paid build pipeline stubs (domain + Cloudflare + deploy) behind secrets TODOs
9. Admin dashboard
10. Deploy product app to Vercel

Leave TODOs only where external credentials are required. Do not buy real customer domains in this first ship unless secrets are present and dry-run fails closed.


## READY TO EXECUTE

All chunks 1–5 are above. Also use `/workspace/webuildyourideas/PRODUCT-SPEC.md` where it does not conflict; **chunks win on conflict**.

### Executor command

```bash
agent -p --force --trust --workspace /workspace/webuildyourideas --model grok-4.7-high "<TASK>"
```

### Success criteria

1. Working Next.js+TS+Tailwind app under `/workspace/webuildyourideas` (or `apps/web` + `packages/core` if modular)
2. Pluggable core modules implemented as real code modules
3. webuildyourideas instance wired as first config
4. Free flow: intake → brief → name check → watermarked preview → 2–3 tweaks → lock
5. Paid stubs: Stripe checkout routes, meter %, cost cap stop message
6. Admin usage view
7. `.env.example` with all required vars
8. `vercel.json` present
9. Deployed to Vercel under skillettsites team; return production URL
10. No real domain purchases without credentials; fail closed with TODO

### Do NOT

- Spend Grok Bot credits on coding
- Use Cloud Agents
- Touch other live sites (CarCostCheck etc.)
- Reveal £ cost split in UI

