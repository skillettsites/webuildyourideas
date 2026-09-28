# We Build Your Ideas

Product specification. Build from this document. It is the decision record, not a pitch.

Working name: We Build Your Ideas.
Product domains (already chosen, not to be bought or deployed by this task): webuildyourideas.com and webuildyourideas.co.uk.
Currency: GBP. Language: UK English. Operator: David Skillett, under the existing skillettsites accounts.

One line: someone sends a brain dump by email, chat, or voice. We show a watermarked preview of a site on a name that is free. If they subscribe, we buy that domain, put it on Cloudflare, and host the site. Variable build spend stays inside a hard cap so the target margin holds.

## 1. Hard rules

These override convenience.

1. Free means intake, rules-based advice, name check, and a template preview. Nothing is purchased on the free tier. No domain, no hosting charge, no Grok call, no Whisper call, no paid site builder.
2. Free previews are watermarked, sandboxed, and not indexed. Three tweak rounds, then the editor locks. The preview stays visible.
3. Mockups are our template engine. A handful of layouts, designed once, filled from the brain dump and the chosen name. No Lovable and no other paid site builder.
4. Free variable cost is zero. Name checks use free RDAP only, and lookups are capped. If RDAP is unavailable, name check pauses. We do not fall through to a paid WHOIS API on the free tier.
5. The paid call to action is: "Make this live, subscribe from £12/month."
6. Domain registration, Cloudflare zone, and hosting start only after Stripe confirms the first successful payment, and only after a fresh availability check.
7. The customer never sees a pound split of build cost. They see plan price and a percentage allowance. Example: "60% of allowance used."
8. Generation stops the moment the next call would cross the cap. Copy: "You've hit your build limit. Upgrade or wait for reset."
9. One live site per subscription in the first release.
10. We register only standard-price `.com` and `.co.uk`. Premium and aftermarket names are refused.

## 2. What we sell

| Who | What they get |
| --- | --- |
| Free | A private, watermarked preview on an available `.com` or `.co.uk`, plus three tweaks. |
| Paid | That site made live: domain, DNS, TLS, hosting, and further builds until the monthly allowance runs out. |

Advice on the free tier is deterministic. We say which layout we picked, whether the name is free, and what is missing from the dump. We do not call a model to chat.

The registrant of every customer domain is the operator's Cloudflare account. The subscriber may use the name while the subscription is live. They do not get registrar credentials. Transfer-out is manual and out of the first release.

Name checks do not reserve a name. Availability is checked again after payment. If the name has gone, we do not silently buy a different one. We deploy to a temporary host on our domain and ask them to pick another standard-price name.

## 3. Architecture

Six parts. The product app is one Next.js app. Customer sites are static files behind one Cloudflare worker.

```
intake (web chat, inbound email, voice)
    -> ideas
    -> name check (RDAP, capped)
    -> template engine
    -> preview host (watermark + upgrade chrome outside the iframe)
    -> Stripe
    -> build worker (paid only, metered)
    -> Cloudflare registrar + DNS + customer static host
```

### 3.1 Intake

- Web: signed-in chat box. Paste or type. Magic-link auth.
- Email: Resend inbound to `build@webuildyourideas.com`. If the sender matches a user, attach the dump to a new idea. If not, store it unattached and send one magic link to claim it. Do not build for an unclaimed sender.
- Voice, free: browser speech recognition only. If the browser cannot do it, they type. No audio leaves the device.
- Voice, paid: upload, then Whisper. Cap one clip at 10 minutes. Audio is deleted after a successful transcript.

Thin dumps still preview. Empty slots are omitted. The page chrome says what to add. We do not invent lorem ipsum.

Abuse caps, free and paid: 5 new ideas per user per rolling 24 hours. 10 RDAP checks per user per rolling 24 hours.

### 3.2 Template engine

Five layouts, designed once and stored in the repo:

| Id | Use |
| --- | --- |
| `local_service` | Trades, clinics, tutors, shops with a place. |
| `simple_offer` | One service or one product. |
| `portfolio` | Work samples. |
| `professional` | One person, consultant, freelancer. |
| `event_or_group` | Club, wedding, one-off gathering. |

A keyword map picks the layout. The user may switch layout. On the free tier that switch is a tweak.

Slots: name, one line, about, up to three points, contact, place. User text is escaped into our HTML. Users cannot supply JavaScript, CSS, or iframes.

### 3.3 Preview sandbox

- The preview document is static HTML we generated.
- It is served from `preview.webuildyourideas.com/p/{id}` with `X-Robots-Tag: noindex` and a tight Content-Security-Policy.
- The product page embeds it in an iframe with `sandbox` and no `allow-scripts` unless a layout truly needs our own script. User content never brings scripts.
- The PREVIEW mark, the tweak bar, and the upgrade bar are parent-page chrome, so they cannot be removed from inside the iframe.
- Free previews expire 30 days after the last tweak, then the HTML is deleted. Paid artefacts are kept while the subscription is live, plus the park window in section 5.

### 3.4 Build workers

A `builds` row is the queue. A single worker (cron or long-lived process) claims one queued row at a time. No fleet in the first release.

| Build kind | When | Spend |
| --- | --- | --- |
| `template_preview` | Free, and any layout swap | £0. No model. |
| `grok_revise` | Paid edits that stay inside a layout | Grok tokens, metered. |
| `cli_batch` | £50 and £100 only, when a layout cannot do the change | Pass-through model tokens from that one Cursor CLI run, metered. |
| `deploy` | After payment, and after each successful paid build | £0 on the generation meter. Fulfilment is logged separately. |

CLI batches follow the Brian and Kilmarnock pattern: one lean Cursor CLI run per request, against that customer's site repo, with the prompt and the file set fixed before the run starts. If the run fails, we do not loop it. The user may ask again, which is a new build, if allowance remains.

£100 builds sit at the head of the queue. They reach `needs_review` before DNS is pointed at the new build. David approves in the admin screen. No public review SLA.

### 3.5 Billing

Stripe Billing on the existing skillettsites Stripe account. Four self-serve prices: £12, £25, £50, £100 per month. Above £100 is a manual Stripe price, not a self-serve button. Cap for a manual price is 30% of the monthly amount, set in admin when the price is created.

Checkout and the customer portal are Stripe-hosted. Our webhook is the only writer of subscription state.

VAT follows that Stripe account. This product does not invent a second tax scheme.

### 3.6 Meter

Append-only `usage_events`. The allowance is the sum of metered pence in the open Stripe period, divided by the tier cap. The user interface shows the percentage only.

The cap is checked before a call, using a pessimistic estimate. The actual cost is written after the call. If the actual cost lands over the cap because the estimate was short, stop. Do not start another call. Do not bill an overage.

### 3.7 Cloudflare and the registrar

- Product app and preview chrome: Vercel.
- Preview HTML and live site files: Cloudflare R2.
- One Worker routes by `Host` to the right object prefix.
- Live custom hostnames use Cloudflare custom hostnames (TLS for SaaS), or a zone per site if custom hostnames are not available on the account. Prefer one zone per live customer site in the first release if that is the path already used on skillettsites. Do not open a Vercel project per customer.
- Registrar: Cloudflare Registrar, `.com` and `.co.uk` only, standard price only.
- Auto-buy ceiling: registry price at or under £15 per year. Above that, stop and ask for another name. The purchase is fulfilment cost. It does not come out of the generation cap.

### 3.8 Admin

`ADMIN_EMAILS` allowlist. Admin can see raw pence, event kinds, and build logs. Customers cannot. Admin can approve a £100 review, retry a failed deploy once, and park a site.

## 4. Data model

Postgres in Supabase, London region (`eu-west-2`). Identifiers are UUIDs. Money in integer pence. Times in UTC.

### 4.1 `users`

| Column | Notes |
| --- | --- |
| `id` | Supabase auth user id. |
| `email` | Unique. |
| `stripe_customer_id` | Null until first checkout. |
| `created_at` | |

### 4.2 `ideas`

| Column | Notes |
| --- | --- |
| `id` | |
| `user_id` | |
| `source` | `chat`, `email`, or `voice`. |
| `raw_dump` | Original text. Transcript if voice. |
| `layout_id` | One of the five layouts. |
| `status` | `draft`, `preview_ready`, `tweaks_locked`, `checkout_pending`, `queued`, `building`, `needs_review`, `live`, `parked`, `released`. |
| `tweak_count` | Free tweaks used. Starts at 0. Locks at 3. |
| `fqdn` | Chosen host, null until a name is selected. |
| `created_at` | |

One idea may become the live site. Extra ideas stay as previews.

### 4.3 `previews`

| Column | Notes |
| --- | --- |
| `id` | |
| `idea_id` | |
| `version` | Increments on each render. |
| `storage_path` | R2 or Supabase Storage key. |
| `created_at` | |
| `expires_at` | Free: last activity plus 30 days. Paid: null while subscribed. |

### 4.4 `subscriptions`

| Column | Notes |
| --- | --- |
| `id` | |
| `user_id` | |
| `stripe_subscription_id` | |
| `tier` | `tier_12`, `tier_25`, `tier_50`, `tier_100`, `tier_manual`. |
| `status` | Stripe status we care about: `active`, `past_due`, `canceled`. |
| `period_start`, `period_end` | Copied from Stripe. This is the allowance window. |
| `cap_pence` | Snapshot for the period. See section 6. |
| `live_idea_id` | The one site this subscription hosts. |

Free users have no subscription row. Their generation cap is £0.

### 4.5 `usage_events`

Append-only. Never updated except to set `void` if a logged call was proven not to have reached the vendor.

| Column | Notes |
| --- | --- |
| `id` | |
| `user_id` | |
| `idea_id` | Nullable. |
| `build_id` | Nullable. |
| `period_start` | Denormalised so the sum is a single query. |
| `kind` | `grok_tokens`, `whisper_seconds`, `paid_lookup`, `fulfilment_domain`, `fulfilment_other`. |
| `quantity` | Tokens, seconds, or lookups. |
| `pence` | Integer. Metered kinds use the price book, rounded up to the next penny. |
| `metered` | True for generation spend. False for fulfilment. |
| `created_at` | |
| `meta` | Model, token split, clip length, vendor ids. No dump text. |

Allowance used = sum of `pence` where `metered` and `period_start` equals the open period.

### 4.6 `domains`

| Column | Notes |
| --- | --- |
| `id` | |
| `idea_id` | |
| `user_id` | |
| `fqdn` | |
| `tld` | `com` or `uk` (`co.uk` stored as full fqdn). |
| `status` | `suggested`, `available`, `taken`, `registered`, `parked`, `released`. |
| `premium` | If true, never auto-buy. |
| `registry_pence_per_year` | Quoted price. Null if unknown. |
| `cloudflare_zone_id` | |
| `registered_at`, `expires_at` | |

### 4.7 `builds`

| Column | Notes |
| --- | --- |
| `id` | |
| `idea_id`, `user_id` | |
| `kind` | `template_preview`, `grok_revise`, `cli_batch`, `deploy`. |
| `status` | `queued`, `running`, `succeeded`, `failed`, `stopped_cap`. |
| `pence` | Metered spend of this build. 0 for template and deploy. |
| `started_at`, `finished_at` | |
| `log_path` | Operator-only. |

### 4.8 `lookup_log`

One row per RDAP query: `user_id`, `fqdn`, `result`, `created_at`. Used to enforce the daily cap. Not metered, because RDAP is free.

### 4.9 Price book

Config in repo, not a customer-editable table. Fields: Grok price per million input tokens, per million output tokens, Whisper price per minute, USD to GBP rate, effective date. Each event converts at that rate and rounds up to the next penny. When a vendor price changes, update the book before the next deploy. Old events keep the pence already stored.

## 5. End-to-end flow

### 5.1 Intake to preview (free)

1. User signs in with a magic link, or claims an inbound email.
2. They submit a dump. Voice on this path is browser speech only.
3. We store the idea and run the layout rules.
4. We check the name they asked for, then `.com` and `.co.uk` if they did not specify. Taken names get up to five deterministic alternatives (plain suffixes such as `hq`, `uk`, `co`, the trade word, the town). Each candidate spends the RDAP budget.
5. If none are free, we still render the preview on a temporary label (`idea-{shortid}.preview.webuildyourideas.com`) and say the name is taken.
6. Template render. Save HTML. Show the parent page with iframe, PREVIEW chrome, tweak count, and the sticky upgrade bar.
7. A tweak is a slot edit or a layout switch. Re-render. Increment `tweak_count`. At 3, set `tweaks_locked` and disable inputs. Preview remains.

No step in 5.1 may call Grok, Whisper, Stripe, or the registrar.

### 5.2 Upgrade

1. Button: "Make this live, subscribe from £12/month."
2. They pick £12, £25, £50, or £100. Checkout shows the plan price only.
3. Webhook `checkout.session.completed` and `invoice.paid` mark the subscription active and set `period_start`, `period_end`, and `cap_pence`.
4. Re-run RDAP on the chosen name. Standard price and available: register, create the zone, attach the hostname.
5. If taken or over £15 per year: do not register. Email them to pick another name. Build the site on `{shortid}.sites.webuildyourideas.com` until they do.
6. Run one paid `grok_revise` to turn the dump into final slot copy inside the same layout, then `deploy`. Remove the watermark on the live host. The preview URL keeps the watermark.
7. If that first paid build would exceed the cap, deploy the template version unwatermarked on the live host and stop. Do not skip hosting after they have paid. Tell them the allowance is used and the next revise waits for reset or an upgrade.

Past due: generation stops. The live site stays up for the grace Stripe already gives. We do not take the site down on the first failed retry.

### 5.3 Later builds (paid)

1. User asks for a change in chat, email, or a paid voice clip.
2. Worker estimates the call. If `spent + estimate > cap`, do not call. Show the lock copy.
3. Otherwise run `grok_revise`. On £50 and £100, a change that cannot be expressed as slot edits may run one `cli_batch`.
4. £100: status `needs_review`, then deploy only after approval.
5. Deploy replaces the R2 prefix and purges that hostname.

### 5.4 Reset, upgrade, cancel

- The allowance window is the Stripe subscription period. Anchor is the signup day. Use Stripe's period dates. Do not write our own month arithmetic.
- Reset sets the next period's sum to zero. It does not delete events.
- Upgrade mid-period: cap becomes the new tier cap immediately. Spend already logged still counts. No reset on upgrade.
- Downgrade: new cap applies at the next period start. If they are already over the lower cap, generation stays stopped until reset.
- Cancel: generation stops at period end. The site stays live until period end, then `parked` for 30 days (holding page on the same hostname). After 30 days, status `released`: hostname detached. The domain is not auto-transferred and not auto-sold. Renewal of a domain we still hold is an operator decision, logged as fulfilment.

## 6. Tiers

Same meter. Different ceilings. Rolling reset on the subscription anniversary, via Stripe period bounds.

| Tier id | Price / month | Generation cap | Free tweaks | What is included |
| --- | --- | --- | --- | --- |
| free | £0 | £0 | 3, then lock | Intake, rules-based advice, RDAP name check, watermarked template preview. |
| `tier_12` | £12 | £5 | None. The cap is the limit. | Live `.com` or `.co.uk`, Cloudflare DNS and TLS, static hosting, Grok revisions, Whisper, until £5. |
| `tier_25` | £25 | £10 | None | Same as £12, with a £10 cap. |
| `tier_50` | £50 | £20 | None | Same, plus one-shot Cursor CLI batches when a layout cannot do the change. |
| `tier_100` | £100 | £30 | None | Same as £50, queue priority, human review before each go-live deploy. |
| `tier_manual` | Above £100, set in Stripe | 30% of the monthly price | None | Same as £100. Created by the operator, not by the public pricing page. |

Margin this produces on generation spend alone, before Stripe fees, domain, and hosting:

| Price | Cap | Left after cap |
| --- | --- | --- |
| £12 | £5 | 58% |
| £25 | £10 | 60% |
| £50 | £20 | 60% |
| £100 | £30 | 70% |

£12, £25, and £50 are linear (£5 per £12). £100 is tighter so the 70% target holds. Domain registration and Stripe fees come out of what is left. They are not a reason to raise the generation cap. A £12 domain in month one can make that month thin. That is accepted. The cap still does not move.

Public pricing page shows the four prices and one line each. It does not show caps in pounds.

## 7. Cost cap

Target: about 70% of the subscription left after variable generation spend. The hard ceiling is the cap column above. Never spend more than that on a user in a period.

### 7.1 What counts

| Item | Counts toward the cap |
| --- | --- |
| Grok input and output tokens | Yes |
| Model tokens inside a Cursor CLI batch | Yes, pass-through only |
| Whisper, per second, rounded up to the next penny | Yes |
| A paid availability API, if one is ever added | Yes. Free tier must not call it. |
| RDAP | No. Daily count cap only. |
| Template render and preview bandwidth | No. Rate-limit hotlinking instead of paying. |
| Stripe fees | No. |
| Domain registration and renewal | No. Logged as `fulfilment_domain`. |
| Cloudflare, Vercel, Resend, Supabase fixed plans | No. |
| Human review time | No. |
| Cursor seat cost | No. Only the model bill that batch causes. |

### 7.2 Mechanics

1. Price book to pence, round up.
2. Before each vendor call, estimate an upper bound (max tokens for that prompt class, or the full clip length for Whisper).
3. If `spent + estimate > cap_pence`, set the build to `stopped_cap`, call nothing, show the lock copy.
4. After the call, insert one `usage_events` row with actuals.
5. A single event over 20% of the cap emails the operator. The user still only sees the percentage.
6. No overage product, no negative allowance, no silent retry of a stopped build.
7. Stripe webhook handlers are idempotent on event id.
8. `past_due` and `canceled` are treated as cap zero for new generation.

### 7.3 Free tier cost

Allowed variable spend: £0. Permitted work: template render, free RDAP inside the daily cap, Resend magic links on the product's normal email plan. Forbidden: Grok, Whisper, registrar, per-customer hosting projects, paid WHOIS.

## 8. Meter UX

### 8.1 Free preview

- Parent chrome, not inside the iframe.
- Badge: PREVIEW.
- Tweak line: "2 of 3 free tweaks left." At zero: "Free tweaks used."
- Sticky bar, all viewports, pinned to the bottom: "Make this live, subscribe from £12/month."
- Mobile: the bar stays on screen while the iframe scrolls. It does not cover the primary tweak control until tweaks are locked.
- After lock, inputs are disabled. The preview and the sticky bar remain.
- No allowance percentage on the free tier. There is nothing to meter.

### 8.2 Paid

- Sticky bar on the idea page and on the live-site manager.
- Fill shows the percentage. Copy is always of the form "60% of allowance used."
- Secondary line, no money: "Resets on 12 Oct." Use the real `period_end` date in en-GB short form.
- At 80% and above, add: "Builds stop at 100%."
- At 100%, disable generation controls and show only: "You've hit your build limit. Upgrade or wait for reset."
- Upgrade link stays available in that state.
- Never show pounds of spend, token counts, model names, or a cost breakdown.

### 8.3 Other locks

| State | What the user sees |
| --- | --- |
| RDAP daily cap | "Name checks paused until tomorrow." |
| Name taken at go-live | "That name has gone. Pick another and we will register it." |
| Price over £15 per year | "That name is outside the standard price. Pick another." |
| £100 waiting on review | "This build is in review." |
| Past due | "Update payment to keep building." The live site is still up. |

## 9. Tech stack

Match the existing skillettsites shape. One product app, Cloudflare for the sites we run for customers.

| Concern | Choice |
| --- | --- |
| Product app | Next.js on Vercel. App Router. |
| Auth and database | Supabase, London. Magic links. |
| Files | Cloudflare R2 for preview and live HTML. |
| Customer DNS, TLS, hosting | Cloudflare. Registrar plus a Worker in front of R2. |
| Payments | Stripe Billing and Customer Portal. |
| Email | Resend, outbound and inbound. |
| Voice, paid | OpenAI Whisper API (`whisper-1`), metered. |
| Voice, free | Browser speech recognition only. |
| Copy and revise, paid | Grok API (xAI), metered. |
| Bespoke changes, £50 and £100 | One Cursor CLI batch per request, lean, metered on pass-through tokens. |
| Templates | Repo HTML/CSS. No external site builder. |

Secrets live in Vercel and the worker, never in the repo: `SUPABASE_*`, `STRIPE_*`, `RESEND_*`, `XAI_API_KEY`, `OPENAI_API_KEY`, `CLOUDFLARE_*`, `R2_*`, `ADMIN_EMAILS`.

## 10. MVP build order

Each phase is one lean CLI run. Do not start the next phase inside the same run. Do not register domains, deploy production, or spend vendor money while writing code. Use Stripe test mode and RDAP (free) only.

Exit criteria are the definition of done for that phase.

### Phase 1. Shell and templates

Magic link, `ideas`, paste intake, five layouts, keyword picker, slot form, server-rendered preview page with a stand-in name. Tweak counter locks at 3. No Stripe, no RDAP, no model.

Done when a signed-in user can go from dump to a watermarked page and cannot edit after three tweaks.

### Phase 2. Names

RDAP for `.com` and `.co.uk`, alternative generator, `lookup_log`, daily caps, preview title uses an available name or the temporary label.

Done when a taken name never becomes the preview title, and the 11th lookup in a day is refused.

### Phase 3. Sandbox

Store HTML in R2. Iframe with sandbox. Parent-page PREVIEW badge and sticky upgrade bar. `noindex`. Mobile and desktop both keep the bar visible.

Done when the badge is still present if the iframe document is inspected, because it is not inside the iframe.

### Phase 4. Stripe

Four test-mode prices, checkout, portal, webhook, `subscriptions` row, `live_idea_id`.

Done when a test clock invoice marks the user paid, and a failed signature does not.

### Phase 5. Meter

`usage_events`, price book, pre-flight check, percentage bar, lock copy. A dev-only fixture can insert pence. No live model calls required to prove the lock.

Done when a fixture at 100% blocks a build and the UI shows the lock sentence with no pound spend figure.

### Phase 6. Paid generation

Grok revise inside slots. Whisper on paid uploads only. Estimate, call, log, stop. Free routes have no code path that constructs a Grok or Whisper client.

Done when a free session can be traced and shows no model request, and a paid session stops before a call that would cross the cap.

### Phase 7. Go live

After a paid test (or a flagged dry run against registrar sandbox if Cloudflare provides one). Fresh RDAP, refuse premium and anything over £15 per year, register, zone, Worker hostname, deploy, drop the watermark on the live host only.

Done when the live host serves the site and the preview URL still shows PREVIEW. A taken name does not cause a different registration.

### Phase 8. CLI and review

£50 and £100 only. One Cursor CLI run per build, token cost written to `usage_events`. £100 sets `needs_review` and does not cut DNS over until admin approves.

Done when a £12 account cannot enqueue `cli_batch`, and a £100 build stays off the public hostname until approval.

## 11. Out of scope

- Buying or renewing domains as part of writing this spec, or as part of phases 1 to 6.
- Lovable, v0, Framer, Webflow, or any paid builder.
- More than one live site per subscription.
- TLDs other than `.com` and `.co.uk`.
- Self-serve prices above £100.
- Automated domain transfer to the customer.
- Native apps.
- A free-tier model "just for a better mockup".
- Showing raw spend, tokens, or margin to the customer.

## 12. Operator checks before calling it live

- Free path: no Grok, no Whisper, no registrar call, in a request log.
- Paid path: a build that would exceed the cap makes zero vendor calls.
- Customer pages never render pence of usage.
- Watermark sits outside the iframe.
- First domain purchase happens only after `invoice.paid`.
- £100 deploy waits for admin approval.
