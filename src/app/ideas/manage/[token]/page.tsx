import Link from "next/link";
import type { Metadata } from "next";
import { ManageIdea } from "@/components/ManageIdea";
import { sbRpc } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage your idea", robots: { index: false, follow: false } };

type Row = { id: string; slug: string; title: string; status: string; vote_count: number; round_end: string };

export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const rows = /^[a-f0-9]{36}$/.test(token) ? await sbRpc<Row[]>("wbyi_manage_get", { p_token: token }).catch(() => []) : [];
  const idea = rows?.[0];
  return (
    <div className="bg-cloud px-5 pb-24 pt-14 md:pt-20">
      <div className="mx-auto max-w-[620px] rounded-[28px] bg-white p-8">
        {!idea ? (
          <>
            <h1 className="title">Link not found</h1>
            <p className="mt-3 text-mute">This link doesn’t match an idea. Check you copied the whole link from your email.</p>
          </>
        ) : (
          <>
            <p className="text-[13px] font-semibold text-mute">Your idea</p>
            <h1 className="title mt-1">{idea.title}</h1>
            <p className="mt-2 text-[15px] text-mute">
              {idea.vote_count} {idea.vote_count === 1 ? "vote" : "votes"} ·{" "}
              {idea.status === "removed" ? "removed" : idea.status === "hidden" ? "hidden by us" : idea.status === "open" ? "on the board" : "won its round"}
            </p>
            {idea.status !== "removed" && (
              <Link href={`/ideas/${idea.slug}`} className="link-more mt-4 !text-[15px]">
                View your idea
              </Link>
            )}
            <div className="mt-8 border-t hairline pt-6">
              <ManageIdea token={token} removable={idea.status === "open" || idea.status === "hidden"} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
