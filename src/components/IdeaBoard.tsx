"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IdeaRow, type IdeaRowData } from "./IdeaRow";

export function IdeaBoard({ ideas, closed = false }: { ideas: IdeaRowData[]; closed?: boolean }) {
  const [sort, setSort] = useState<"top" | "new">("top");
  const sorted = useMemo(() => {
    const copy = [...ideas];
    if (sort === "new") copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return copy;
  }, [ideas, sort]);
  const topOrder = useMemo(() => new Map(ideas.map((i, n) => [i.id, n + 1])), [ideas]);

  if (ideas.length === 0) {
    return (
      <div className="tile px-6 py-16 text-center">
        <p className="title">No ideas yet this round.</p>
        <p className="mx-auto mt-3 max-w-md text-[17px] text-mute">
          Be the first. An early idea has the whole week to gather votes.
        </p>
        <Link href="/ideas/submit" className="btn btn-primary mt-7">
          Submit an idea
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[15px] text-mute">
          {ideas.length} {ideas.length === 1 ? "idea" : "ideas"}
        </p>
        <div className="segmented" role="group" aria-label="Sort ideas">
          <button type="button" aria-pressed={sort === "top"} onClick={() => setSort("top")}>
            Top
          </button>
          <button type="button" aria-pressed={sort === "new"} onClick={() => setSort("new")}>
            New
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {sorted.map((idea) => (
          <IdeaRow key={idea.id} idea={idea} rank={topOrder.get(idea.id)} closed={closed} />
        ))}
      </div>
    </div>
  );
}
