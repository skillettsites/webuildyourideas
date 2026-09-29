-- Round 1 starter ideas (added 29 Sep 2026). Marked source = 'team' and shown as "Starter idea".
-- No votes are seeded. created_at is staggered so the board shows them in this order until votes come in.
with ideas(n, title, description, category) as (values
  (1, 'Where was this TikTok filmed?', 'Paste a travel or food TikTok and the app works out where it was filmed, then pins the spot on your own map. Next time you’re in that city, every place you saved is waiting for you, with directions.', 'app'),
  (2, 'Last-minute room filler for B&Bs', 'B&Bs and guest houses post tonight’s empty rooms at a discount, and people nearby get a heads-up. Rooms that would have sat empty get filled, and no booking site takes a cut.', 'business'),
  (3, 'TikTok recipes to a shopping list in one tap', 'Paste the link to any recipe TikTok and get the ingredients, amounts and method written out properly, plus a shopping list you can send to your supermarket. No more pausing the video fifty times.', 'app'),
  (4, 'Is this builder’s quote fair?', 'Photograph a quote from a builder, plumber or electrician and see how it compares with typical prices in your area, plus the questions worth asking before you say yes.', 'tool'),
  (5, 'Mystery walk generator', 'Tell it how long you’ve got and it plans a surprise walking route from your front door, with hidden stops like a blue plaque, a great view or an old pub. You only find out the next stop when you reach the last one.', 'app'),
  (6, 'TikTok trend spotter for small businesses', 'Tells a café, salon or B&B which TikTok sounds and trends are taking off this week, then suggests three short videos they could film on their phone today.', 'tool'),
  (7, 'Does this TikTok hack actually work?', 'Paste a cleaning trick, money tip or life hack from TikTok and get a straight verdict: works, sort of, or don’t bother, with the reasons and where the evidence comes from.', 'tool'),
  (8, 'Comment section courtroom', 'Paste an argument from a comment section or a group chat and an impartial judge weighs up both sides, then delivers a verdict. Settle debates once and for all, complete with a gavel.', 'app'),
  (9, 'Street sign storyteller', 'Point your phone at a street name sign and hear the story behind the name in under a minute. Brilliant on a walk, and it finally explains why you live on Gallows Hill.', 'app'),
  (10, 'Allotment waiting list finder', 'One map of allotment sites near you, how long each waiting list is and who to contact. Add your own site’s wait time to help the next person.', 'website'),
  (11, 'Kids’ party venue finder with real prices', 'Compare soft plays, church halls and activity centres near you by price per child, how many they hold and what’s included, without ringing round ten places.', 'website'),
  (12, 'Repair café finder', 'A map of free repair cafés and fix-it events near you, what they can mend and when they’re next on. Fewer things in landfill, and you learn to fix them yourself.', 'community')
)
insert into wbyi_ideas (slug, title, description, category, author_name, round_end, source, created_at)
select
  trim(both '-' from left(regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'), 60)) || '-' || substr(md5(gen_random_uuid()::text), 1, 5),
  title, description, category, 'We Build Your Ideas', wbyi_round_end(now()), 'team',
  now() - ((13 - n) * interval '1 minute')
from ideas
where not exists (select 1 from wbyi_ideas w where w.title = ideas.title and w.round_end = wbyi_round_end(now()));
