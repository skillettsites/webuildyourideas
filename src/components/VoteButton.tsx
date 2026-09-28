"use client";

import { useState } from "react";
import { toggleVote, useVotes } from "@/lib/votes-client";

type Props = {
  ideaId: string;
  count: number;
  closed?: boolean;
  size?: "md" | "lg";
  title?: string;
  // TikTok likes, which count towards the total but can't be toggled here.
  bonus?: number;
};

export function VoteButton({ ideaId, count, closed = false, size = "md", title, bonus = 0 }: Props) {
  const votes = useVotes(ideaId);
  const [error, setError] = useState("");
  const [bump, setBump] = useState(0);
  const voted = votes.voted.has(ideaId);
  const siteVotes = votes.counts.get(ideaId) ?? count;
  const shown = siteVotes + bonus;

  async function onClick() {
    if (closed) return;
    setError("");
    setBump((b) => b + 1);
    const r = await toggleVote(ideaId, siteVotes);
    if (r.error) setError(r.error);
  }

  const lg = size === "lg";
  const label = closed
    ? `${shown} ${shown === 1 ? "vote" : "votes"}. Voting has closed.`
    : voted
      ? `Remove your vote${title ? ` for ${title}` : ""}. ${shown} ${shown === 1 ? "vote" : "votes"}.`
      : `Vote${title ? ` for ${title}` : ""}. ${shown} ${shown === 1 ? "vote" : "votes"}.`;

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={closed}
        aria-pressed={voted}
        aria-label={label}
        className={`group flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 ${
          lg ? "h-[84px] w-[76px]" : "h-[64px] w-[56px]"
        } ${
          voted
            ? "border-blue bg-blue text-white shadow-[0_6px_16px_-6px_rgba(0,113,227,0.6)]"
            : closed
              ? "cursor-default border-hair bg-cloud text-mute"
              : "border-line bg-white text-ink hover:border-blue hover:text-blue"
        }`}
      >
        <svg
          key={bump}
          viewBox="0 0 24 24"
          className={`${lg ? "h-6 w-6" : "h-5 w-5"} ${bump ? "pop" : ""} transition-transform duration-200 ${
            !voted && !closed ? "group-hover:-translate-y-0.5" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 15 6-6 6 6" />
        </svg>
        <span className={`font-semibold tabular-nums tracking-[-0.02em] ${lg ? "text-[20px]" : "text-[15px]"}`} aria-live="polite">
          {shown}
        </span>
      </button>
      {error && (
        <p role="alert" className="absolute top-full z-10 mt-2 w-44 rounded-xl bg-ink px-3 py-2 text-center text-[12px] leading-snug text-white shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}
