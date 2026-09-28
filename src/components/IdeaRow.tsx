import Link from "next/link";
import { categoryLabel } from "@/lib/config";
import { timeAgo } from "@/lib/rounds";
import { VoteButton } from "./VoteButton";

export type IdeaRowData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  author_name: string | null;
  vote_count: number;
  status: string;
  created_at: string;
};

export function StatusPill({ status }: { status: string }) {
  if (status === "winner")
    return <span className="pill bg-[#fff4e5] !px-2.5 !py-0.5 !text-[12px] font-semibold text-orange">Winner</span>;
  if (status === "building")
    return <span className="pill bg-[#eef4ff] !px-2.5 !py-0.5 !text-[12px] font-semibold text-blue">Building now</span>;
  if (status === "built")
    return <span className="pill bg-green-soft !px-2.5 !py-0.5 !text-[12px] font-semibold text-green">Built</span>;
  return null;
}

export function IdeaRow({ idea, rank, closed = false, now }: { idea: IdeaRowData; rank?: number; closed?: boolean; now?: Date }) {
  return (
    <article className="group relative flex gap-4 rounded-[22px] bg-white p-4 transition-shadow duration-300 hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.22)] sm:gap-5 sm:p-5">
      {typeof rank === "number" && (
        <div className="hidden w-7 shrink-0 pt-1 text-center text-[15px] font-semibold tabular-nums text-mute-2 sm:block">{rank}</div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.022em] text-ink">
            <Link href={`/ideas/${idea.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {idea.title}
            </Link>
          </h3>
          <StatusPill status={idea.status} />
        </div>
        <p className="mt-1.5 line-clamp-2 text-[15px] leading-relaxed text-mute">{idea.description}</p>
        <p className="mt-2.5 text-[13px] text-mute-2">
          <span className="font-medium text-ink-2">{categoryLabel(idea.category)}</span>
          <span className="mx-1.5">·</span>
          {idea.author_name ? `by ${idea.author_name}` : "Anonymous"}
          <span className="mx-1.5">·</span>
          <time dateTime={idea.created_at} suppressHydrationWarning>
            {timeAgo(idea.created_at, now)}
          </time>
        </p>
      </div>
      <div className="relative z-[1] shrink-0 self-center">
        <VoteButton ideaId={idea.id} count={idea.vote_count} closed={closed || idea.status !== "open"} title={idea.title} />
      </div>
    </article>
  );
}
