-- Starter ideas from the team, used to get each round going. Shown as "Starter idea", start
-- with no votes, and can win like any other idea (if one does, we build it for everyone).
alter table wbyi_ideas drop constraint if exists wbyi_ideas_source_check;
alter table wbyi_ideas add constraint wbyi_ideas_source_check check (source in ('site', 'tiktok', 'team'));
