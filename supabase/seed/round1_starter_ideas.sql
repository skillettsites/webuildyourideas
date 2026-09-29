-- Round 1 starter ideas (29 Sep 2026). Marked source = 'team' and shown as "Starter idea".
-- Every one is buildable in about a week on something that exists and is free:
--   TikTok travel map / recipe box: TikTok's official oEmbed (caption, creator, thumbnail; no key),
--     postcodes.io / OpenStreetMap for places.
--   Takeaway hygiene league: Food Standards Agency ratings API (api.ratings.food.gov.uk).
--   Mystery walk / allotment finder: OpenStreetMap via Overpass (viewpoints, pubs, memorials, landuse=allotments).
--   Courtroom / review replies / quote explainer: Claude API.
--   Room filler / holiday dates: plain database + email.
-- Re-running is safe: it removes zero-vote starter ideas that are no longer listed, updates the
-- listed ones in place (keeping their links and any votes), adds new ones, and sets the order.
-- No votes are seeded.

begin;

create temporary table starter(n int, title text, description text, category text) on commit drop;
insert into starter values
  (1, 'TikTok travel map', 'Save travel and food TikToks to your own map. Paste the link, tell it the place, and the video is pinned to the spot, so your next trip is already planned and easy to share with friends.', 'app'),
  (2, 'Last-minute room filler for B&Bs', 'B&Bs and guest houses post tonight’s empty rooms at a lower price, and people who’ve signed up for that area get an email straight away. Rooms that would have sat empty get filled, and no booking site takes a cut.', 'business'),
  (3, 'Comment section courtroom', 'Paste an argument from a comment section or a group chat and an impartial AI judge weighs up both sides and gives its verdict, with reasons. Settle who was right once and for all.', 'app'),
  (4, 'Review reply writer for small businesses', 'Paste a Google or TripAdvisor review and get a warm, professional reply in your own voice, ready to post. Especially handy for the tricky one-star ones.', 'tool'),
  (5, 'TikTok recipe box', 'Paste a recipe TikTok and save it as a tidy card with the video, ingredients and method. Pick a few for the week and get one combined shopping list.', 'app'),
  (6, 'Takeaway hygiene league table', 'Every takeaway in your town ranked by its official food hygiene rating, with the date it was last inspected. Check before you order, using the Food Standards Agency’s own data.', 'website'),
  (7, 'Mystery walk generator', 'Tell it how long you’ve got and it plans a walk from your door with a few surprise stops, like a viewpoint, a historic memorial or a good pub, taken from open map data.', 'app'),
  (8, 'Group holiday date finder', 'Send one link to the group, everyone taps the dates they’re free, and it shows the best week for the most people. No more 200-message group chats.', 'tool'),
  (9, 'Builder’s quote explainer', 'Photograph a quote from a builder or tradesperson and get it explained line by line in plain English, with anything that looks missing, like VAT, waste removal or payment terms, and the questions worth asking.', 'tool'),
  (10, 'Allotment waiting list finder', 'A map of allotment sites near you and who to contact for each one, plus waiting times shared by the people already on the list.', 'website');

delete from wbyi_ideas w
where w.source = 'team' and w.vote_count = 0 and w.round_end = wbyi_round_end(now())
  and not exists (select 1 from starter s where s.title = w.title);

update wbyi_ideas w
set description = s.description, category = s.category, created_at = now() - ((11 - s.n) * interval '1 minute')
from starter s
where w.source = 'team' and w.title = s.title and w.round_end = wbyi_round_end(now());

insert into wbyi_ideas (slug, title, description, category, author_name, round_end, source, created_at)
select
  trim(both '-' from left(regexp_replace(lower(s.title), '[^a-z0-9]+', '-', 'g'), 60)) || '-' || substr(md5(gen_random_uuid()::text), 1, 5),
  s.title, s.description, s.category, 'We Build Your Ideas', wbyi_round_end(now()), 'team',
  now() - ((11 - s.n) * interval '1 minute')
from starter s
where not exists (select 1 from wbyi_ideas w where w.title = s.title and w.round_end = wbyi_round_end(now()));

commit;
